# TokenClaw — Technical Deep Dive

A walkthrough of how the TokenClaw prototype is built: its domain model, lifecycle state machine, governance surfaces, narration subsystem, and the reproducible media pipeline that records it.

For the product pitch and headline numbers, see the [root README](../README.md). This document is for reviewers who want to know *how it works* and *what is actually true*.

---

## 1. What this prototype is

TokenClaw is an **economic execution gateway**: it intercepts an agent's execution plan before inference, routes each unit of work down an execution ladder to the cheapest safe path, binds that plan to a Spend Warrant, blocks consequential actions for human decision, and settles the run against verified business outcomes.

This repository contains a **high-fidelity interactive prototype** of that product, plus the tooling that records it.

It is deliberately **not** a backend. There is no live model execution, no Azure call, no real spend. Every figure is a deterministic fixture. What *is* real is the operating model: the lifecycle, the state transitions, the arithmetic, the governance surfaces, and the control points that genuinely block progress.

That boundary is enforced in the product itself — the self-running demo labels its approval as simulated both on screen and in narration, and capability candidates are always marked `PROPOSED · NOT YET CERTIFIED`.

---

## 2. System map

Three parts, each independently runnable:

```text
tokenclaw/
├─ mock-ui/        React + TypeScript + Vite prototype — the product itself
├─ demo-video/     Node + Playwright + ffmpeg — records the prototype into shareable media
└─ _bkp/           Internal working documents (gitignored)
```

| Part | Stack | Entry point |
|---|---|---|
| Prototype | React 19, TypeScript 6, Vite 8 | `mock-ui/src/App.tsx` |
| Media renderers | Node 25, Playwright, ffmpeg, Windows SAPI | `demo-video/render.mjs`, `render-gif.mjs` |

The renderers drive the **real UI through a real browser** rather than replaying a storyboard. A change to the product cannot silently desynchronise from the recordings — if a control moves, the render fails loudly rather than producing a stale video.

---

## 3. Domain model

Everything displayed derives from one typed fixture file, [`mock-ui/src/demoData.ts`](mock-ui/src/demoData.ts). No figure is hard-coded into a component.

### Core types

```ts
interface Route {
  id, shortLabel, label
  count: number          // work units assigned to this rung
  cost: number           // execution cost for this rung
  color: 'reuse' | 'deterministic' | 'small' | 'advanced'
  reason, quality, evidence: string   // why this routing is defensible
}

interface Scenario {
  total, unit            // scope, e.g. 1000 "cases"
  baselineCost           // what an ordinary agent would spend
  actualCost             // what the governed route spends
  budget, qualityFloor   // warrant limits
  verified, followUp     // settled outcomes
  humanDecisions         // actions held at the policy boundary
  blockedAction, policy  // what gets held, and under which policy
  routes: Route[]        // exactly four rungs
  learn: { ... }         // capability-compounding projection
}
```

Every `Route` carries `reason`, `quality`, and `evidence` — not decoration, but the substance of the product claim. A routing decision that cannot be justified is not governance.

### Three scenarios

| | Customer Case | IT Incident | Software Validation |
|---|---|---|---|
| Scope | 1,000 cases | 250 incidents | 2,400 checks |
| Baseline | $40.00 | $15.00 | $72.00 |
| Governed route | $6.20 | $3.00 | $9.00 |
| Ladder split | 420 · 390 · 150 · 40 | 110 · 85 · 40 · 15 | 330 · 1,850 · 170 · 50 |
| Held action | 8 refunds | 3 remediations | Deploy RC7 |

### Derived values

Computed in `App()`, never stored — so the fixtures cannot drift from what is displayed:

| Value | Formula | Casework | Incidents | Validation |
|---|---|---|---|---|
| Avoided spend | `baselineCost − actualCost` | $33.80 | $12.00 | $63.00 |
| Reuse + deterministic | `round((r0+r1)/total × 100)` | 81% | 78% | 91% |
| Advanced reasoning | `r3/total × 100` | 4.0% | 6.0% | 2.1% |
| Cost per outcome | `actualCost / verified` | $0.0064 | $0.0123 | $0.0038 |
| Recovered capacity | `floor(avoided/actualCost × total)` | 5,451 | 1,000 | 16,800 |

All three scenarios are internally consistent: route counts sum exactly to `total`, and the advertised `additionalCapacity` string matches the capacity formula exactly.

---

## 4. The lifecycle state machine

Ten stages, ordered, in `demoData.ts`:

```text
REQUEST → BASELINE → GRAB → PULL → WARRANT → EXECUTE → HOLD → OUTCOME → CAPACITY → LEARN
```

State is held in `App()` as plain `useState` — no reducer, no state library. The lifecycle is small and linear enough that a reducer would add ceremony without removing complexity.

| State | Purpose |
|---|---|
| `stageIndex` | Position in the lifecycle |
| `progress` | Execution completion, 0–100, animated during `EXECUTE` |
| `decision` | `pending` / `approved` / `denied` at the human control point |
| `autoplay` | Self-running demo mode |
| `approvalOpen` | Whether the control-point dialog is showing |

### Transition rules

Three rules carry the product's integrity:

1. **`EXECUTE` cannot be left until `progress === 100`.** The Advance control is disabled, so the demo can never skip past work it claims to have done.
2. **`HOLD` cannot be left without a recorded decision.** `advance()` intercepts `HOLD` and opens the approval dialog instead of advancing. Only `approveAction()` moves to `OUTCOME`.
3. **Direct navigation past `HOLD` records an approval.** Jumping to a later phase via the controller sets `decision = 'approved'`, because showing verified outcomes with no decision on record would misrepresent the model.

### The `HOLD_DECISION` beat

The approval dialog is narrated separately from the phase that reveals it, so a derived *beat* is layered over the stage:

```ts
const beat = stage === 'HOLD' && (approvalOpen || decision !== 'pending')
  ? 'HOLD_DECISION'
  : stage
```

Including `decision !== 'pending'` matters: without it, closing the dialog would drop the beat back to `HOLD` and re-speak the "here it stops" line on the way *out* of the hold.

---

## 5. The execution canvas

The centre column swaps visualisation by stage, with a Flow/Ladder toggle:

| Stages | Component | Shows |
|---|---|---|
| 0–2 | `BaselineFlow` | The naive all-inference plan, and its interception |
| 3–4 | `PullFlow` | Work redistributed across four ladder rungs |
| 5–9 | `ExecutionFlow` | Metered lanes, policy gate, outcome, capacity, capability |
| 3+ | `ExecutionLadder` | All eight rungs with per-rung verdicts |

### Animation carries meaning

The baseline stream has three distinct states, because a moving bar implies running work:

| Stage | Stream | Accessible label |
|---|---|---|
| `REQUEST` | paused, dimmed to 0.42 | "Proposed route, not executing" |
| `BASELINE` | animating | "Ordinary agent baseline flow" |
| `GRAB` | frozen, red | "Execution stream intercepted" |

This was a correctness fix, not a polish pass: the original build animated the stream from load, implying execution had begun before the user pressed anything.

### Lane metering

Lanes stagger by index (`progress − index × 4`) so they complete in ladder order rather than in lockstep — reuse clears first, advanced reasoning last. At `progress >= 100` every lane is clamped to exactly 100% and its full cost, so a completed run never displays 96% / 92% / 88%.

### The ladder view

Eight rungs, with only four carrying routed work:

```text
1. No execution required              REJECTED
2. Verified outcome reuse             PARTIAL      ← route 0
3. Certified capability               PARTIAL      ← route 1
4. Reusable workflow / cached         EVALUATED
5. Local / deterministic processing   INCLUDED
6. Small model                        PARTIAL      ← route 2
7. Advanced model                     ESCALATION ONLY ← route 3
8. Agent workflow                     REJECTED
```

Showing the *rejected* and *evaluated* rungs is the point. A router that only shows where work went looks like load balancing; showing what was considered and declined is what makes it an economic argument.

---

## 6. Governance surfaces

### AI Spend Warrant

The right rail builds progressively — `Building` → `Ready for approval` → `Approved`, and `DRAFT` → `BOUND` at stage 5. Economics reveal in step with the lifecycle (route cost appears at `PULL`, verified outcomes only at `OUTCOME`), so the interface never displays a number the run has not yet earned.

The warrant carries budget, quality floor, advanced-model limit, retry cap, external-action policy, and a request checksum — the checksum being what binds authorization to *this* request rather than to a role or a session.

### The human control point

`ApprovalDialog` presents the requested action, affected record count, confidence, cost impact, governing policy, and an evidence package. It offers **Approve** and **Deny & send to follow-up** — a deny path exists, because a control point with only one button is theatre.

In autoplay it additionally renders a `PRESENTATION MODE · SIMULATED HUMAN APPROVAL` banner.

### Event and policy stream

A derived log filtered to stages reached so far. The decision event is inserted **immediately after the action it unblocked**:

```ts
const blockedIndex = visible.findIndex((e) => e.stage === 'HOLD')
visible.splice(blockedIndex + 1, 0, decisionEvent)
```

The original implementation inserted at `length − 2`, which placed "Human decision recorded: APPROVED" *after* "967 outcomes verified" — implying outcomes were verified before anyone approved them. Invisible until narration said the opposite out loud.

---

## 7. Narration subsystem

Three files: [`narration.ts`](mock-ui/src/narration.ts) (script), [`useNarrator.ts`](mock-ui/src/useNarrator.ts) (speech), and the pacing logic in `App()`.

### Pacing by completion token

Narration **drives** the demo rather than accompanying it. Rather than a boolean that an effect must reset (which triggers cascading renders), completion is derived:

```ts
const beatToken = `${beat}:${narrationRun}`
const beatComplete = completedBeatToken === beatToken
```

A beat is only complete when the token for *this* beat and *this* run has been recorded. Autoplay gates every transition on `beatComplete`, so no line is ever cut off mid-sentence. Incrementing `narrationRun` on resume invalidates the token, so pausing and resuming replays the current line from the top instead of skipping it.

When narration is muted, a per-beat timeout supplies fallback pacing, so the demo still traverses every phase.

### Web Speech hardening

`speechSynthesis` is unreliable in specific, documented ways, and each is handled:

| Failure mode | Mitigation |
|---|---|
| Voices load asynchronously | `voiceschanged` listener re-runs voice selection |
| `onend` sometimes never fires | Duration estimated from word count as a fallback timer |
| Chrome stops long utterances (~15 s) | 9-second `pause()`/`resume()` keepalive |
| Callback could fire twice | `settled` guard — completion fires exactly once |

The fallback timer matters most: without it, a single silent speech failure would stall the demo permanently.

---

## 8. Media pipeline

`demo-video/` renders an MP4 and two GIFs from the live prototype. Shared UI-driving logic lives in [`lib.mjs`](demo-video/lib.mjs) so a change to the app's controls is fixed once.

```text
narration text ─► Windows SAPI (pwsh) ─► WAV per beat
                                           │
                                           ├─► ffprobe: exact duration
                                           │        │
                                           │        ▼
                                    Playwright drives the real UI,
                                    holding each phase for that duration
                                           │
                                           ▼
                              ffmpeg: delay each WAV to its measured
                              offset, mix, normalise, burn captions, mux
```

### Sync by construction

The visual hold time and the audio offset derive from the **same measurement**. There is no hand-tuned offset table to maintain: change a sentence, and both the hold and the audio position move together.

### Recording drift

Playwright begins writing frames *after* the browser context is created, so the recorded file is ~1.4–1.9 s shorter than the wall-clock run. Cue times and audio offsets are measured from wall-clock zero, so both renderers measure the gap and subtract it:

```js
const driftMs = Math.max(0, totalMs - videoMs)
```

Without this every caption trails its phase by over a second. It was visible immediately in the GIFs (2 s holds) and near-invisible in the MP4 (8–12 s lines) — the same defect, caught only because the shorter format exposed it.

### Voice quality

`System.Speech` under Windows PowerShell 5.1 sees only the two legacy `* Desktop` voices; PowerShell 7 also enumerates the newer OneCore voices (*Microsoft Mark / David / Zira*). The renderer probes for `pwsh` first and falls back gracefully.

### Output

| | MP4 | GIF |
|---|---|---|
| Resolution | 1920×1080 | 1152×648 |
| Frame rate | 30 fps | 8 fps |
| Audio | AAC 48 kHz, −16 LUFS | none |
| Runtime | 1:48 | 0:33 each |
| Size | 9.3 MB | 9.1 / 8.1 MB |

Two-pass palette generation (`stats_mode=diff` + `diff_mode=rectangle`) exploits the mostly-static dark interface to keep each GIF under 10 MB.

---

## 9. Key design decisions

**Fixtures over a backend.** The product claim is about the *operating model*, not inference plumbing. A real backend would consume the entire build and demonstrate less. The trade-off is stated explicitly rather than hidden.

**Every number derived, never written twice.** Percentages, cost per outcome, and recovered capacity are computed from the fixtures at render time. There is no path where a displayed figure contradicts the data.

**Governance that genuinely blocks.** `EXECUTE` cannot be skipped before completion; `HOLD` cannot be passed without a decision. A demo that can be clicked through proves nothing about control points.

**Narration drives pacing, not the reverse.** Fixed timings would either rush the narration or pad the silence. Deriving the hold from the spoken duration makes the demo self-timing.

**Recordings drive the real UI.** Playwright drives actual controls, so recordings cannot drift from the product.

**Disclosure built into the artifact.** The simulated approval is labelled on screen, in the narration, and in the GIF captions — not only in a README a viewer may never open.

---

## 10. Defects found and fixed

Each of these was caught by inspecting rendered output rather than by assuming the code was correct.

| Defect | Root cause | Fix |
|---|---|---|
| Completed lanes stopped at 96/92/88% | Index stagger never unwound at 100% | Clamp all lanes at `progress >= 100` |
| Pull rail crossed the subtitle | Connector geometry not aligned to route stems | Vertical trunk + rail at `calc(50% − 77px)` |
| Bars moved before the demo started | Stream animated from page load | Three explicit states: paused / running / intercepted |
| Outcomes logged before approval | Decision inserted at `length − 2` | Insert directly after the blocked-action event |
| Caption rail invisible, overlapping controls | `animation-fill-mode: both` used to hold the resting state; animations never advance in a background tab | Resting state is the element's own CSS; animation is entrance-only |
| Stray comma on every burned caption | ASS `Format:` line omitted `MarginV`, shifting `Text` by one field | Declare all ten Dialogue fields |
| Narration lagged the picture | Playwright starts recording after context creation | Measure and subtract drift |
| `EPERM` on repeat GIF renders | A failed run leaked Chromium, holding a lock on the output directory | `try/finally` around browser teardown |

---

## 11. Known modelling notes

Stated plainly, because a reviewer will find them.

**Route costs do not sum to the total cost.** Each scenario carries an unmodelled remainder — $0.61 (casework), $0.43 (incidents), $0.79 (validation) — representing platform and tool cost outside per-rung execution. It is consistent and intentional, but the interface does not currently break it out as a line item.

**Outcome accounting differs between scenarios.** In casework, `verified (967) + followUp (25) = 992`, with the remaining 8 being the held refunds — so held actions sit *outside* both buckets. In incidents and validation, `verified + followUp` equals the full scope, meaning held actions are counted *within* verified. Both readings are defensible; they are not the same convention.

**Quality figures are projections, not measurements.** Labelled `SIMULATED QUALITY` in the interface.

**Capability certification is out of scope.** LEARN proposes a candidate with projected coverage; nothing certifies or activates it.

---

## 12. Verifying it yourself

```powershell
cd tokenclaw\mock-ui
npm install
npm run lint      # oxlint — clean
npm run build     # tsc -b && vite build — clean
npm run dev
```

Checks worth doing by hand:

1. **Route counts sum to scope.** 420+390+150+40 = 1,000.
2. **Recovered capacity.** `floor(33.80/6.20 × 1000)` = 5,451 — matches the displayed string.
3. **Hold genuinely blocks.** At `HOLD`, press Advance: the dialog opens, the phase does not change. Only a recorded decision advances it.
4. **Execute cannot be skipped.** During `EXECUTE`, Advance is disabled until lanes reach 100%.
5. **Event ordering.** At `LEARN`, the stream shows the blocked action, then the decision, then verified outcomes.
6. **Scenario parity.** Switch scenarios; every derived figure recomputes from fixtures.

---

## 13. Where production would differ

The prototype's **Connected services** drawer names the intended mapping:

| Service | Role |
|---|---|
| Azure API Management | Gateway enforcement, attribution, quotas |
| TokenClaw engines | Warrant, route, policy, settlement |
| Azure AI Search | Verified outcomes and capability discovery |
| Microsoft Foundry | Bounded model and agent execution |
| Azure Monitor | Execution evidence and operational signals |
| Microsoft Fabric | Business outcome settlement |
| Microsoft Purview | Classification and governance context |

The architecturally significant point is that **the gateway is the enforcement boundary, not an advisory layer**. Routing proposals may come from a model; authorization must be deterministic and checksum-bound, or the warrant means nothing. Keeping proposal and authorization separate is the load-bearing decision the prototype is designed to make visible.

The honest gap between here and production: real model execution, real evidence retrieval, real outcome verification against systems of record, and capability certification with a regression gate. The lifecycle, the governance surfaces, and the economics are modelled; the plumbing is not.
