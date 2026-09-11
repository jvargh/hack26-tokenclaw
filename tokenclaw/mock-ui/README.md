# TokenClaw Execution Studio

Interactive browser mock for demonstrating TokenClaw as an economic execution gateway.

For the project overview, proof points, and what is real versus simulated, see the [root README](../../README.md).

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. Use the bottom controller to advance one state at a time, jump directly to a state, or select **Run full demo** for the complete Request-to-Learn presentation.

The full demo visibly traverses Request, Baseline, Grab, Pull, Warrant, Execute, Hold, Outcome, Capacity, and Learn. At Hold it opens the decision surface and clearly labels the recorded approval as a presentation-mode simulation; manual mode continues to require an explicit user decision.

## Spoken narration

The studio narrates itself. Narration is on by default and uses the browser's built-in speech synthesis, so there is no API key, no network call, and no audio asset to ship.

- **Narration drives the pacing.** Each phase waits for its spoken line to finish before advancing, so nothing is ever cut off mid-sentence.
- **Every line is captioned** on a rail above the controller, for silent rooms and accessibility.
- **All three scenarios have their own script**, written for the specific numbers on screen.
- **Toggle it** with the **Narration on / Narration off** button. Muted, the demo falls back to timed pacing and still traverses every phase.
- **Pause and resume** replays the current phase's line from the top rather than resuming mid-sentence.

A full narrated run takes roughly two and a half minutes. Scripts live in [`src/narration.ts`](src/narration.ts); the speech layer is in [`src/useNarrator.ts`](src/useNarrator.ts).

Browser support: any Chromium or Safari browser with `speechSynthesis` and at least one installed voice. If speech is unavailable the toggle reads **No speech** and disables itself, and the demo runs on timed pacing.

## Demonstrated capabilities

- **Grab** intercepts a naive all-inference execution plan.
- **Pull** redistributes work across reuse, certified capability, small-model, and advanced-model routes.
- **AI Spend Warrant** binds budget, quality, retry, and human-control limits before execution.
- **Hold** blocks consequential external action until a human records a decision.
- **Outcome** verifies business results independently from task completion.
- **Recovered capacity** converts avoided spend into additional workload capacity.
- **Learn** proposes repeated successful work as a capability candidate without silently activating it.

The scenario selector includes customer case resolution, IT incident resolution, and software validation.

## Validation

```powershell
npm run lint
npm run build
```
