/**
 * Renders silent, captioned GIF walkthroughs of the IT Incident Resolution and
 * Software Validation scenarios.
 *
 * The narrated MP4 covers Customer Case Resolution; these GIFs show that the
 * same Request -> Learn lifecycle drives the other two domains.
 *
 * Pipeline per scenario:
 *   Playwright records the real UI at 1080p while holding each phase long enough
 *   to read -> ffmpeg burns captions at full resolution, then downscales and
 *   builds an optimised palette so the GIF stays small enough to share.
 */

import { chromium } from 'playwright'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FFMPEG, beatActions, buildAss, prepareScenario, probeDurationMs, run, wait,
} from './lib.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const BUILD = join(here, 'build-gif')
const BASE_URL = process.env.TOKENCLAW_URL ?? 'http://127.0.0.1:5174/'

const spec = JSON.parse(readFileSync(join(here, 'gif-script.json'), 'utf8'))
const { width, height, gifWidth, fps } = spec

async function record(scenario) {
  const dir = join(BUILD, scenario.id)
  mkdirSync(dir, { recursive: true })

  const browser = await chromium.launch()
  let cues = []
  let totalMs = 0

  // Always tear the browser down. A failure that leaks the process leaves a lock
  // on the recording directory, which breaks every later run with EPERM.
  try {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      recordVideo: { dir, size: { width, height } },
    })
    const page = await context.newPage()
    const t0 = Date.now()

    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await prepareScenario(page, scenario.id)

      await wait(spec.leadInMs)

      for (const beat of scenario.beats) {
        const action = beatActions[beat.id]
        if (!action) throw new Error(`No UI action defined for beat "${beat.id}"`)
        await action(page)
        await wait(320)

        const holdMs = beat.holdMs ?? spec.defaultHoldMs
        const startMs = Date.now() - t0
        cues.push({ startMs, endMs: startMs + holdMs, text: beat.text })
        await wait(holdMs)
      }

      await wait(spec.tailHoldMs)
      totalMs = Date.now() - t0
    } finally {
      await context.close()
    }
  } finally {
    await browser.close()
  }

  const files = readdirSync(dir).filter((f) => f.endsWith('.webm'))
  if (files.length === 0) throw new Error(`No capture produced for ${scenario.id}`)
  const raw = join(dir, files[0])

  // Playwright starts writing frames slightly after the context is created, so
  // the file is shorter than the wall-clock run. Cue times are measured from
  // wall-clock zero, so shift them back by that difference or every caption
  // trails its phase by a second or more.
  const videoMs = await probeDurationMs(raw)
  const driftMs = Math.max(0, totalMs - videoMs)
  if (driftMs > 0) {
    cues = cues.map((c) => ({
      ...c,
      startMs: Math.max(0, c.startMs - driftMs),
      endMs: Math.max(0, c.endMs - driftMs),
    }))
  }

  return { raw, cues, totalMs, videoMs, driftMs, dir }
}

async function toGif(scenario, capture) {
  const assName = 'captions.ass'
  writeFileSync(
    join(capture.dir, assName),
    buildAss(capture.cues, {
      width, height,
      fontSize: spec.captionFontSize,
      marginV: spec.captionMarginV,
      marginX: 90,
    }),
    'utf8',
  )

  // Captions are burned at full resolution so the ASS PlayRes matches, then the
  // frame is scaled down for the GIF.
  const chain = `subtitles=${assName},fps=${fps},scale=${gifWidth}:-2:flags=lanczos`
  const palette = join(capture.dir, 'palette.png')

  await run(FFMPEG, [
    '-v', 'error', '-y', '-i', capture.raw,
    '-vf', `${chain},palettegen=max_colors=160:stats_mode=diff`,
    palette,
  ], { cwd: capture.dir })

  const out = join(here, scenario.output)
  await run(FFMPEG, [
    '-v', 'error', '-y', '-i', capture.raw, '-i', palette,
    '-lavfi', `${chain}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`,
    '-loop', '0',
    out,
  ], { cwd: capture.dir })

  return out
}

async function main() {
  console.log(`TokenClaw GIF renderer\n  source: ${BASE_URL}\n`)
  rmSync(BUILD, { recursive: true, force: true })
  mkdirSync(BUILD, { recursive: true })

  const results = []
  for (const [i, scenario] of spec.scenarios.entries()) {
    console.log(`[${i + 1}/${spec.scenarios.length}] ${scenario.title}`)
    console.log('      recording...')
    const capture = await record(scenario)
    console.log(`      captured ${(capture.totalMs / 1000).toFixed(1)}s -> video ${(capture.videoMs / 1000).toFixed(1)}s (drift ${capture.driftMs}ms corrected)`)

    console.log('      encoding GIF...')
    const out = await toGif(scenario, capture)
    const sizeMb = statSync(out).size / 1024 / 1024
    const durMs = await probeDurationMs(out)
    console.log(`      ${scenario.output}  ${durMs / 1000}s  ${sizeMb.toFixed(1)} MB\n`)
    results.push({ scenario, out, sizeMb, durMs })
  }

  console.log('Done:')
  for (const r of results) {
    if (!existsSync(r.out)) throw new Error(`Expected output missing: ${r.out}`)
    console.log(`  ${r.out}  (${r.sizeMb.toFixed(1)} MB, ${(r.durMs / 1000).toFixed(1)}s)`)
  }
}

main().catch((error) => {
  console.error(`\nGIF render failed: ${error.message}`)
  process.exitCode = 1
})
