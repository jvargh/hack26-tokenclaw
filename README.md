# TokenClaw

> **The AI that knows when not to think.**

TokenClaw is an **economic execution gateway** for enterprise AI. It sits between a business request and every model, tool, and action — intercepting execution *before* inference, routing each unit of work to the cheapest safe path, binding that plan to an authorization, holding consequential actions for a human, and proving what the spend actually accomplished.

It is not a token dashboard and not a model router. A dashboard tells you what you already spent. TokenClaw decides what gets spent, before it happens.

---

## The problem

An ordinary agent handed *"resolve 1,000 customer support cases"* sends all 1,000 to an advanced model. The work gets done. Nobody ever learns whether that was the right price — or whether 810 of those cases needed a model at all.

## The approach

Four moves, and the visual grammar of the whole product:

| | | |
|---|---|---|
| **GRAB** | Intercept the execution plan before a single token is spent | not a report next month |
| **PULL** | Drop each unit of work down the execution ladder to the cheapest safe route | not one model for everything |
| **HOLD** | Block consequential external actions until a human records a decision | model confidence never overrides policy |
| **LEARN** | Promote repeatedly-successful work into certified deterministic capability | every run makes the next one cheaper |

### The execution ladder

The first acceptable route wins, subject to quality, data, and policy constraints:

```text
1. Should this work run at all?
2. Has an approved equivalent outcome already been produced?
3. Can a certified deterministic skill complete it?
4. Can cached evidence or a reusable workflow complete it?
5. Can a local or inexpensive model complete it?
6. Can a small cloud model complete it?
7. Does only the uncertain portion need an advanced model?
8. Is a multi-step agentic workflow genuinely necessary?
```

The cheapest route is often **no execution at all**.

---

## Proof point

Customer Case Resolution, 1,000 cases:

| | Ordinary agent | TokenClaw |
|---|---|---|
| Route | 1,000 advanced-model calls | 420 reuse · 390 certified · 150 small · 40 advanced |
| Cost | **$40.00** | **$6.20** |
| Verified outcomes | not measured | **967** |
| Cost per verified outcome | — | **$0.0064** |

$33.80 was never spent. That is not a line in a savings report — it is **recovered capacity**, enough to fund **5,451 additional cases** on the same budget. Then LEARN proposes `CX-Resolution-v4` at 97% projected deterministic coverage, so the next run starts cheaper.

The same pattern holds across domains:

| Scenario | Scope | Baseline → Route | Verified | Recovered capacity |
|---|---|---|---|---|
| Customer Case Resolution | 1,000 cases | $40.00 → $6.20 | 967 | ~5,451 more cases |
| IT Incident Resolution | 250 incidents | $15.00 → $3.00 | 243 | ~1,000 more incidents |
| Software Validation | 2,400 checks | $72.00 → $9.00 | 2,397 | ~16,800 more checks |

---

## See it

| Asset | Scenario | Runtime |
|---|---|---|
| 📹 [`TokenClaw-Demo.mp4`](tokenclaw/demo-video/TokenClaw-Demo.mp4) | Customer Case Resolution — **narrated** | 1:48 |
| 🎞️ [`TokenClaw-IT-Incidents.gif`](tokenclaw/demo-video/TokenClaw-IT-Incidents.gif) | IT Incident Resolution — silent, captioned | 0:33 |
| 🎞️ [`TokenClaw-Software-Validation.gif`](tokenclaw/demo-video/TokenClaw-Software-Validation.gif) | Software Validation — silent, captioned | 0:33 |

Each walks the complete lifecycle: **Request → Baseline → Grab → Pull → Warrant → Execute → Hold → decision → Outcome → Capacity → Learn.**

---

## Run it yourself

```powershell
cd tokenclaw\mock-ui
npm install
npm run dev
```

Open the URL Vite prints. Then either:

- press **Run full demo** for a self-running, spoken walkthrough, or
- press **Advance** to step through phase by phase while you narrate.

The scenario selector switches between all three domains. Narration uses the browser's built-in speech synthesis — no API key, no network call — and every spoken line is also captioned on screen.

### The thirty-second version

> An ordinary agent would send all 1,000 customer cases to an advanced model for $40. TokenClaw grabs that plan before inference, then pulls 420 cases to verified reuse and 390 to certified deterministic execution. Only 40 cases need advanced reasoning. A Spend Warrant caps cost at $8 and quality at 98%. The run completes for $6.20 — but TokenClaw holds eight customer refunds until a human records a decision. It then verifies 967 successful outcomes, recovers $33.80 for more customer work, and proposes the repeated pattern as a 97% deterministic capability for the next run.

---

## Repository map

```text
tokenclaw/
├─ mock-ui/                          Interactive React prototype (the demo)
│  └─ src/
│     ├─ App.tsx                     Lifecycle state machine and all UI surfaces
│     ├─ demoData.ts                 Typed fixtures for all three scenarios
│     ├─ narration.ts                Spoken script, 11 beats per scenario
│     └─ useNarrator.ts              Web Speech wrapper with reliable end-detection
├─ demo-video/                       Repeatable video + GIF renderers
│  ├─ render.mjs                     Narrated MP4 pipeline
│  ├─ render-gif.mjs                 Silent captioned GIF pipeline
│  ├─ lib.mjs                        Shared UI-driving logic
│  └─ tts.ps1                        Offline narration via the Windows speech engine
└─ (working documents)               Concept and specifications, kept out of the repo
```

### Documentation

| Document | What it covers |
|---|---|
| [Technical deep dive](tokenclaw/TECHNICAL-DEEP-DIVE.md) | Architecture, domain model, lifecycle state machine, governance surfaces, narration and media pipelines, design decisions, known limitations |
| [Mock UI README](tokenclaw/mock-ui/README.md) | Running the prototype, narration behaviour, validation |
| [Demo media README](tokenclaw/demo-video/README.md) | Re-rendering the video and GIFs |

The product concept, MVP specification, UI implementation specification, and presenter script are internal working documents and are deliberately excluded from this repository. Everything needed to understand, run, and present the prototype is in this README and the three above.

---

## Intended Azure architecture

The prototype demonstrates the operating model; production would map onto:

| Service | Role |
|---|---|
| **Azure API Management** (AI gateway) | The interception point — every model call passes through it |
| **Microsoft Foundry** | Model catalogue and deployment across the advanced/small/local tiers |
| **Azure AI Search** | Verified-outcome reuse and evidence retrieval |
| **Microsoft Fabric** | Outcome settlement and economic reporting |
| **Microsoft Purview** | Data boundaries and policy enforcement |
| **Azure Monitor / App Insights** | Execution telemetry and warrant compliance |
| **Azure Functions / Container Apps** | Deterministic certified capabilities |

The mock exposes this mapping through the **Connected services** panel, deliberately outside the core demonstration.

---

## What is real, and what is not

Being precise about this matters more than the demo looking impressive.

**Real in the prototype**
- The complete lifecycle, its state machine, and every governance surface
- Routing arithmetic, warrant limits, outcome and capacity calculations
- Human control points that genuinely block progress until a decision is recorded
- Spoken narration and the fully reproducible media renderers

**Simulated**
- Scenario results are deterministic fixtures, not live model execution
- The prototype makes no live Azure calls; connected services show intended mapping only
- In the self-running demo the approval is recorded automatically and labelled **simulated** both on screen and in the narration
- Capability candidates are **proposed**, never silently certified or activated

This section is the authoritative statement of what the prototype does and does not claim.

---

## Regenerating the demo media

Requires [ffmpeg](https://ffmpeg.org/) on `PATH`. Narration is generated offline by the Windows speech engine — no API key.

```powershell
cd tokenclaw\mock-ui
npm run dev                # must stay running

cd ..\demo-video
npm install
npm run render             # narrated MP4
npm run render:gif         # both scenario GIFs
```

Both renderers drive the **real** UI through Playwright rather than replaying a script, so the recordings cannot drift from the product.
