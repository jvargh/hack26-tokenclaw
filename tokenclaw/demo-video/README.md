# TokenClaw Demo Media Renderers

Produces the demo assets for the TokenClaw Execution Studio, all locally — no API key, no cloud speech service, no manual screen recording.

| Asset | Scenario | Runtime | Size |
|---|---|---|---|
| `TokenClaw-Demo.mp4` | Customer Case Resolution | ~1:49 | ~9 MB |
| `TokenClaw-IT-Incidents.gif` | IT Incident Resolution | ~33 s | ~9 MB |
| `TokenClaw-Software-Validation.gif` | Software Validation | ~33 s | ~8 MB |

The MP4 is the narrated headline demo. The two GIFs are silent and captioned, and exist to show that the same Request → Learn lifecycle drives the other two domains.

All three walk the complete lifecycle: Request → Baseline → Grab → Pull → Warrant → Execute → Hold → decision → Outcome → Capacity → Learn.

## Prerequisite

The mock UI must be running:

```powershell
cd ..\mock-ui
npm run dev
```

Then, once only:

```powershell
npm install
```

If the dev server picks a different port:

```powershell
$env:TOKENCLAW_URL = 'http://127.0.0.1:5173/'
```

## Render

```powershell
npm run render       # narrated MP4
npm run render:gif   # both scenario GIFs
```

### Fast iteration on the MP4

Re-cutting captions or audio does **not** require re-recording the browser:

```powershell
node render.mjs --remux
```

This reuses the capture in `build/` and only redoes the caption burn and mux. Use a full `npm run render` after changing the UI or the spoken script.

## Output specifications

| | MP4 | GIF |
|---|---|---|
| Resolution | 1920×1080 | 1152×648 |
| Frame rate | 30 fps | 8 fps |
| Audio | AAC 48 kHz stereo, −16 LUFS | none |
| Captions | burned in | burned in |

## How it works

1. **`tts.ps1`** drives the Windows speech engine to write one WAV per narration beat *(MP4 only)*.
2. **ffprobe** measures each WAV precisely.
3. **Playwright** drives the real UI, holding each phase on screen for the length of its line (MP4) or a fixed readable hold (GIF), while recording.
4. **ffmpeg** burns captions at full resolution, then either mixes and muxes the narration (MP4) or downscales and builds an optimised palette (GIF).

Because the visual hold and the audio offset derive from the *same* measurement, narration and picture stay in sync by construction rather than by hand-tuning.

### Recording drift

Playwright begins writing frames slightly *after* the browser context is created, so the recorded file is roughly 1.4 s shorter than the wall-clock run. Cue times and audio offsets are measured from wall-clock zero, so both renderers subtract that difference. Without this correction every caption trails its phase by over a second. The renderers print the measured drift.

## Editing the scripts

- **`video-script.json`** — spoken narration for the MP4. Knobs: `voice`, `rate`, `leadInMs`, `beatGapMs`, `tailHoldMs`. The renderer prints the projected runtime before recording and warns if the result exceeds 2:00.
- **`gif-script.json`** — captions and per-phase holds for the GIFs. Knobs: `gifWidth`, `fps`, `defaultHoldMs`, and a per-beat `holdMs` override. Lower `gifWidth` or `fps` to shrink the files.

Each beat's `id` must match a phase the renderer knows how to drive; see `beatActions` in [`lib.mjs`](lib.mjs).

### Voice quality

The MP4 renderer prefers **PowerShell 7 (`pwsh`)**, whose `System.Speech` also exposes the newer OneCore voices (*Microsoft Mark / David / Zira*). Windows PowerShell 5.1 only exposes the older `* Desktop` voices, which sound noticeably worse. If `pwsh` is unavailable the render still works, just with a lower-quality voice.

## Scope note

These recordings capture the interactive **mock**. Figures are deterministic fixtures that demonstrate the operating model, and the approval at the human control point is explicitly labelled as simulated in both the narration and the GIF captions. See the [root README](../../README.md#what-is-real-and-what-is-not) for the full claims-and-boundaries statement.

