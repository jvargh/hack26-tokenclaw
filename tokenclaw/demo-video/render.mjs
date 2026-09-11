/**
 * Renders a narrated MP4 walkthrough of the TokenClaw Execution Studio.
 *
 * Pipeline:
 *   1. Windows speech engine -> one WAV per narration beat (offline, no API key)
 *   2. ffprobe               -> exact duration of each WAV
 *   3. Playwright            -> drives the real UI, holding each phase for the
 *                               length of its line, while recording video
 *   4. ffmpeg                -> delays each WAV to its measured offset, mixes,
 *                               burns captions, and muxes to H.264 / AAC MP4
 *
 * Because the visual hold time and the audio offset both come from the same
 * measured duration, narration and picture stay in sync by construction.
 */

import { chromium } from 'playwright'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FFMPEG, beatActions, buildAss, prepareScenario, probeDurationMs, resolvePowerShell, run, wait,
} from './lib.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const BUILD = join(here, 'build')
const AUDIO = join(BUILD, 'audio')
const VIDEO = join(BUILD, 'video')
const OUT = join(here, 'TokenClaw-Demo.mp4')

const BASE_URL = process.env.TOKENCLAW_URL ?? 'http://127.0.0.1:5174/'
const WIDTH = 1920
const HEIGHT = 1080
const SETTLE_MS = 380

const spec = JSON.parse(readFileSync(join(here, 'video-script.json'), 'utf8'))

async function main() {
  const remuxOnly = process.argv.includes('--remux')
  const timingsPath = join(BUILD, 'timings.json')
  console.log(`TokenClaw demo renderer\n  source: ${BASE_URL}${remuxOnly ? '\n  mode:   remux only (reusing recorded capture)' : ''}\n`)

  let beats, cues, totalMs, rawVideo

  if (remuxOnly) {
    if (!existsSync(timingsPath)) throw new Error('No previous capture found. Run without --remux first.')
    ;({ beats, cues, totalMs, rawVideo } = JSON.parse(readFileSync(timingsPath, 'utf8')))
    console.log(`[1/2] Reusing capture: ${beats.length} beats, ${(totalMs / 1000).toFixed(1)}s`)
  } else {
    rmSync(BUILD, { recursive: true, force: true })
    mkdirSync(AUDIO, { recursive: true })
    mkdirSync(VIDEO, { recursive: true })

    // --- 1. narration audio -------------------------------------------------
    const shell = await resolvePowerShell()
    console.log(`[1/4] Generating narration with the local speech engine (${shell})...`)
    const tts = await run(shell, [
      '-NoProfile', '-ExecutionPolicy', 'Bypass',
      '-File', join(here, 'tts.ps1'),
      '-ScriptPath', join(here, 'video-script.json'),
      '-OutDir', AUDIO,
    ])
    process.stdout.write(tts.split('\n').map((l) => `      ${l}`).join('\n'))

    // --- 2. measure ---------------------------------------------------------
    beats = []
    for (const beat of spec.beats) {
      const file = join(AUDIO, `${beat.id}.wav`)
      if (!existsSync(file)) throw new Error(`Missing narration audio: ${file}`)
      beats.push({ ...beat, file, durationMs: await probeDurationMs(file) })
    }
    const speechMs = beats.reduce((n, b) => n + b.durationMs, 0)
    const projected = spec.leadInMs + speechMs + spec.beatGapMs * (beats.length - 1) + spec.tailHoldMs
    console.log(`\n[2/4] ${beats.length} beats, ${(speechMs / 1000).toFixed(1)}s of speech`)
    console.log(`      projected runtime ~${(projected / 1000).toFixed(1)}s`)

    // --- 3. drive the UI while recording ------------------------------------
    console.log('\n[3/4] Recording the interface...')
    const browser = await chromium.launch()
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1,
      recordVideo: { dir: VIDEO, size: { width: WIDTH, height: HEIGHT } },
    })
    const page = await context.newPage()
    const videoT0 = Date.now()

    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await prepareScenario(page, spec.scenario)

    cues = []
    await wait(spec.leadInMs)

    for (const [index, beat] of beats.entries()) {
      await beatActions[beat.id](page)
      await wait(SETTLE_MS)

      const startMs = Date.now() - videoT0
      cues.push({ startMs, endMs: startMs + beat.durationMs + 180, text: beat.speech })
      beat.offsetMs = startMs
      console.log(`      ${String(index + 1).padStart(2)}. ${beat.id.padEnd(14)} @ ${(startMs / 1000).toFixed(1)}s  (${(beat.durationMs / 1000).toFixed(1)}s)`)

      await wait(beat.durationMs + spec.beatGapMs)
    }

    await wait(spec.tailHoldMs)
    totalMs = Date.now() - videoT0

    await context.close()
    await browser.close()

    const recorded = readdirSync(VIDEO).filter((f) => f.endsWith('.webm'))
    if (recorded.length === 0) throw new Error('Playwright produced no video file')
    rawVideo = join(VIDEO, recorded[0])

    // Playwright starts writing frames slightly after the context is created, so
    // the file is shorter than the wall-clock run. Both the caption times and the
    // audio offsets are measured from wall-clock zero, so shift both back by that
    // difference to keep narration locked to the picture.
    const videoMs = await probeDurationMs(rawVideo)
    const driftMs = Math.max(0, totalMs - videoMs)
    if (driftMs > 0) {
      cues = cues.map((c) => ({
        ...c,
        startMs: Math.max(0, c.startMs - driftMs),
        endMs: Math.max(0, c.endMs - driftMs),
      }))
      beats = beats.map((b) => ({ ...b, offsetMs: Math.max(0, b.offsetMs - driftMs) }))
      totalMs = videoMs
    }
    console.log(`      captured ${(totalMs / 1000).toFixed(1)}s -> ${recorded[0]} (drift ${driftMs}ms corrected)`)

    writeFileSync(timingsPath, JSON.stringify({ beats, cues, totalMs, rawVideo }, null, 2))
  }

  // --- 4. mux -------------------------------------------------------------
  console.log(`\n[${remuxOnly ? '2/2' : '4/4'}] Burning captions and muxing audio...`)
  const assPath = join(BUILD, 'captions.ass')
  writeFileSync(assPath, buildAss(cues, { width: WIDTH, height: HEIGHT }), 'utf8')

  const args = ['-y', '-i', rawVideo]
  for (const beat of beats) args.push('-i', beat.file)

  const filters = beats
    .map((b, i) => `[${i + 1}:a]adelay=${b.offsetMs}|${b.offsetMs}[a${i}]`)
    .join(';')
  const mixIn = beats.map((_, i) => `[a${i}]`).join('')
  const filterComplex =
    `${filters};${mixIn}amix=inputs=${beats.length}:normalize=0:dropout_transition=0[mix];` +
    // Narration is quiet straight out of the speech engine; normalise to a
    // broadcast-ish target so the video is audible without the viewer adjusting.
    `[mix]aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11,apad[aout];` +
    `[0:v]subtitles=captions.ass[v]`

  args.push(
    '-filter_complex', filterComplex,
    '-map', '[v]', '-map', '[aout]',
    '-t', (totalMs / 1000).toFixed(2),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-r', '30', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '160k', '-ac', '2',
    OUT,
  )

  await run(FFMPEG, args, { cwd: BUILD })

  const finalMs = Math.round(await probeDurationMs(OUT))
  const mm = Math.floor(finalMs / 60000)
  const ss = Math.floor((finalMs % 60000) / 1000)
  console.log(`\nDone: ${OUT}`)
  console.log(`Runtime: ${mm}:${String(ss).padStart(2, '0')}`)
  if (finalMs > 120000) console.log('WARNING: runtime exceeds 2:00 - shorten lines in video-script.json')
}

main().catch((error) => {
  console.error(`\nRender failed: ${error.message}`)
  process.exitCode = 1
})
