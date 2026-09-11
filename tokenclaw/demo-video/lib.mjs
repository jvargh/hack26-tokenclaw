/**
 * Shared helpers for the TokenClaw demo renderers.
 *
 * Both the narrated MP4 and the silent GIFs drive the same UI in the same order;
 * only their output stage differs. Keeping the phase-driving logic here means a
 * change to the app's controls is fixed once, not twice.
 */

import { spawn } from 'node:child_process'

export const FFMPEG = process.env.FFMPEG ?? 'ffmpeg'
export const FFPROBE = process.env.FFPROBE ?? 'ffprobe'

export function run(cmd, args, opts = {}) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts })
    let out = '', err = ''
    p.stdout.on('data', (d) => { out += d })
    p.stderr.on('data', (d) => { err += d })
    p.on('error', rej)
    p.on('close', (code) =>
      code === 0 ? res(out) : rej(new Error(`${cmd} exited ${code}\n${err.slice(-4000)}`)))
  })
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export async function probeDurationMs(file) {
  const out = await run(FFPROBE, [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file,
  ])
  const seconds = Number.parseFloat(out.trim())
  if (!Number.isFinite(seconds)) throw new Error(`Could not read duration of ${file}`)
  return Math.round(seconds * 1000)
}

/**
 * PowerShell 7's System.Speech also enumerates the newer OneCore voices
 * (Microsoft Mark / David / Zira), which sound markedly better than the legacy
 * "* Desktop" voices that Windows PowerShell 5.1 is limited to. Prefer pwsh.
 */
export async function resolvePowerShell() {
  for (const exe of ['pwsh', 'powershell']) {
    try {
      await run(exe, ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.Major'])
      return exe
    } catch { /* try the next one */ }
  }
  throw new Error('Neither pwsh nor powershell is available on PATH')
}

export function toAssTime(ms) {
  const cs = Math.round(ms / 10)
  const h = Math.floor(cs / 360000)
  const m = Math.floor((cs % 360000) / 6000)
  const s = Math.floor((cs % 6000) / 100)
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`
}

/**
 * Builds a burned-in caption track. Ten Dialogue fields are mandatory
 * (Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text) - omitting
 * MarginV shifts Text by one field and prepends a stray comma to every line.
 */
export function buildAss(cues, { width, height, fontSize = 32, marginV = 58, marginX = 100 }) {
  const head = `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Segoe UI Semibold,${fontSize},&H00E6EFF2,&H000000FF,&HA0000000,&HA0000000,0,0,0,0,100,100,0,0,3,9,0,2,${marginX},${marginX},${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`
  const body = cues
    .map((c) => {
      const text = c.text.replace(/\r?\n/g, ' ').replace(/\{/g, '(').replace(/\}/g, ')')
      return `Dialogue: 0,${toAssTime(c.startMs)},${toAssTime(c.endMs)},Cap,,0,0,0,,${text}`
    })
    .join('\n')
  return `${head}${body}\n`
}

/** Clicks the demo controller's Advance button, waiting until it is usable. */
export async function clickAdvance(page) {
  const advance = page.locator('.demo-controller > button', { hasText: /^Advance$/ })
  await advance.waitFor({ state: 'visible' })
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('.demo-controller > button')]
      .find((x) => x.textContent.trim() === 'Advance')
    return b && !b.disabled
  }, null, { timeout: 30000 })
  await advance.click({ force: true })
}

/**
 * One action per lifecycle phase. Advance handles most transitions; the human
 * control point needs an explicit approval click, and the step into HOLD blocks
 * until the execution lanes reach 100%.
 */
export const beatActions = {
  REQUEST: async () => {},
  BASELINE: clickAdvance,
  GRAB: clickAdvance,
  PULL: clickAdvance,
  WARRANT: clickAdvance,
  EXECUTE: clickAdvance,
  HOLD: clickAdvance,
  HOLD_DECISION: clickAdvance,
  OUTCOME: async (page) => { await page.locator('.approve-button').click({ force: true }) },
  CAPACITY: clickAdvance,
  LEARN: clickAdvance,
}

/** Puts a freshly loaded page into the starting state for a given scenario. */
export async function prepareScenario(page, scenarioId) {
  await page.waitForSelector('.demo-controller')
  await page.selectOption('.scenario-control select', scenarioId)
  // Mute the in-app speech rail: these renders burn their own captions, and a
  // headless browser has no voices to speak with anyway.
  await page.evaluate(() => {
    const t = document.querySelector('.narration-toggle')
    if (t && /Narration on/i.test(t.textContent || '')) t.click()
  })
  await page.waitForTimeout(500)
}
