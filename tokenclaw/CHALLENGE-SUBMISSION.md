# Challenge Submission: TokenClaw

Copy-paste content for the Microsoft Global Hackathon 2026 submission form.  
Character counts are noted against each field limit and have been measured, not estimated.

---

# Part 1: Basics

---

## Title

**Limit: 140 characters, using 47**

```
TokenClaw: Claw Back AI Waste Before It's Spent
```

_Technical variant if you prefer precision over the wordplay:_ `TokenClaw: Claw Back AI Waste Before Inference` (46)

---

## Tagline

**Limit: 300 characters, using 281**

```
Every cap you set quietly taxes the innovation it protects. TokenClaw replaces caps with governed execution: intercepting before inference, routing each request to the cheapest safe path, holding risky actions for a human, and proving what the spend bought. Waste becomes capacity.
```

**Alternates.** Swap either in if you prefer a different angle:

_CFO reframe:_

```
Cost per token is an accounting figure. Cost per outcome is the number that survives a CFO. TokenClaw intercepts every agent request before inference, routes it to the cheapest safe path, holds consequential actions for a human, and proves what the spend actually bought.
```

_Short and punchy:_

```
An economic gateway for enterprise AI: decide before the model runs, escalate only what genuinely needs intelligence, and prove the spend bought a real outcome. Governance that funds more work instead of capping it.
```

---

## Executive Challenge

```
Tokenomics: The Zero-Waste AI Challenge
```

---

## Topic Challenges (optional, up to 5)

Pick from the live dropdown. Likely matches, in priority order:

1.  AI Agents / Agentic AI
2.  Azure / Cloud Platform
3.  Cost Optimization / FinOps
4.  Responsible AI / AI Governance
5.  Developer or Consultant Productivity

---

## Description

**Limit: 30,000 characters, using 14,535**

> **Formatting note:** the form's toolbar exposes headings, bold, italic, code, lists, quotes, rules, links and images, but no table control. Everything below is written with lists instead of Markdown tables so it renders correctly either way.

> **Images:** three `[INSERT IMAGE: ...]` markers appear below. Save the project first, then paste or drop each file at its marker and delete the marker line. Source files: `imgs/TokenClaw_Engine_DeepDive.png`, and the two GIFs in `tokenclaw/demo-video/`.

---

### Copy from here

## The instinct we need to break

When AI cost becomes the story, the instinct is to clamp down. Set a cap. Throttle a team. Put spend behind an approval queue.

Every one of those caps quietly taxes the innovation we exist to deliver, and none of them answer the only question a CFO actually asks: **what did the money buy?**

A token dashboard tells you what you already spent. A quota tells you when to stop. Neither one makes a single decision about whether the spend was _worth it_.

**TokenClaw moves the control point from after the invoice to before the inference.**

---

## What TokenClaw is

TokenClaw is an **economic execution gateway**: a persistent layer between a business request and every model, tool, and action.

It is deliberately **not** a token dashboard and **not** a model router. It does four things no dashboard can:

1.  **GRAB**: intercepts the execution plan _before a single token is spent_
2.  **PULL**: routes each unit of work down an execution ladder to the cheapest safe path
3.  **HOLD**: blocks consequential actions until a human records a decision
4.  **LEARN**: promotes repeatedly-successful work into certified deterministic capability

The result is not a saving in a report. It is **recovered capacity**: the same budget buying materially more work.

---

## Inside the engine

**[INSERT IMAGE: TokenClaw_Engine_DeepDive.png]**

Six engines sit behind the four moves:

1.  **Request Interpreter** normalizes the business request, its scope, and the outcome being asked for.
2.  **Execution Ladder Router** evaluates the cheapest safe route first, across eight rungs.
3.  **Spend Warrant Builder** binds budget, quality floor, permitted routes and policy into one authorization.
4.  **Policy and Hold Engine** blocks consequential actions until a human records a decision.
5.  **Outcome Settlement Engine** verifies the business outcome and calculates cost per outcome.
6.  **Capability Learning Engine** proposes reusable deterministic capability from repeated success.

The phrase that matters most on that diagram is **enforcement boundary, not an advisory layer**. A model may propose a routing plan. Authorization stays deterministic and checksum-bound, because a warrant that can be talked around is not a warrant.

Underneath sits a small typed domain model: `Scenario`, `Route`, `SpendWarrant`, `ExecutionEvent`, `OutcomeReceipt` and `CapabilityCandidate`. Those six entities are enough to express the whole operating model, which is a large part of why it can be demonstrated end to end rather than described.

---

## The execution ladder

Most cost tooling asks _"which model is cheapest?"_ That question is already too late, because it assumes a model is required.

TokenClaw evaluates in this order, and the first acceptable route wins:

1.  Should this work run at all?
2.  Has an approved equivalent outcome already been produced?
3.  Can a certified deterministic skill complete it?
4.  Can cached evidence or a reusable workflow complete it?
5.  Can a local or inexpensive model complete it?
6.  Can a small cloud model complete it?
7.  Does only the _uncertain portion_ need an advanced model?
8.  Is a multi-step agentic workflow genuinely necessary?

**The cheapest route is frequently no execution at all.** Rungs 1 through 4 involve no inference whatsoever, and in the modelled scenarios they absorb 78-91% of the work.

That is the difference between routing and economics. A router picks a cheaper engine for a journey you already decided to take. TokenClaw asks whether the journey is necessary first.

---

## What it looks like in practice

A working, interactive prototype demonstrates the full lifecycle across three enterprise scenarios. Figures below are **modelled scenario economics**: deterministic fixtures that demonstrate the operating model, not measured production savings.

**Customer case resolution: 1,000 support cases**

*   Ordinary agent: 1,000 advanced-model calls → **$40.00**
*   TokenClaw route: 420 verified reuse ($0.00) · 390 certified capability ($0.39) · 150 small model ($1.20) · 40 advanced reasoning ($4.00) → **$6.20**
*   Verified business outcomes: **967**
*   Cost per verified outcome: **$0.0064**
*   Recovered: **$33.80**, funding **5,451 additional cases** on the same budget

**IT incident resolution: 250 incidents**

*   Ordinary agent: **$15.00** → TokenClaw route: **$3.00**
*   110 reuse · 85 certified runbook · 40 small model · 15 advanced
*   **243 verified resolutions** at **$0.0123** each
*   Recovered: **$12.00**, funding roughly **1,000 additional incidents**

**Software validation: 2,400 validation checks**

*   Ordinary agent: **$72.00** → TokenClaw route: **$9.00**
*   330 reuse · 1,850 deterministic tests and static analysis · 170 small model · 50 advanced
*   **2,397 verified outcomes** at **$0.0038** each
*   Recovered: **$63.00**, funding roughly **16,800 additional checks**

Note the software validation case especially: **77% of that work is proven by compilers, test suites and static analysers**: tools that are deterministic, auditable, and already paid for. Sending it to a language model was never a cost problem. It was a _category error_.

---

## The same pattern, three different domains

The narrated video walks through customer case resolution. These two walkthroughs show the identical lifecycle driving very different work, which is the point: this is an operating model, not a one-scenario demo.

**IT incident resolution.** Reuse and certified runbooks absorb most of the queue. The held action is three production remediations, because operations policy does not let an agent change production on its own.

**[INSERT IMAGE: TokenClaw-IT-Incidents.gif]**

**Software validation.** Deterministic tests and static analysis do the overwhelming majority of the work. The held action is the deployment itself, because a passing validation run is not the same thing as permission to ship.

**[INSERT IMAGE: TokenClaw-Software-Validation.gif]**

Both run the full sequence: intercept, route down the ladder, issue the warrant, execute under it, hold for a human, settle the outcome, and propose the next capability.

---

## Cost per outcome is the only metric that survives

Cost per token is an accounting figure. It tells you nothing about whether the money bought anything.

TokenClaw is built around the metric that holds up in front of a CFO:

> **Cost per successfully completed business outcome**

This is why the lifecycle separates _technical completion_ from _business value_. A run that finishes is not a run that worked. The prototype settles every run against verified outcomes and reports the denominator: `$0.0064` per resolved case, not `$6.20 of tokens consumed`.

Once you have that denominator, the arguments resolve themselves. A model five times cheaper per token that fails a third of the time and needs a human to clean up is not cheaper. A reasoning model that costs more per call but removes a review step may be dramatically cheaper per outcome.

**This is the single most useful reframe to offer a customer anxious about AI spend: move the conversation from the numerator to the denominator.**

---

## Why this is not another "levers" project

Prompt caching, model routing, and gateway quotas are all real, valuable levers. They share one blind spot:

**None of them can tell you whether a cost reduction broke quality.**

A cache hit rate does not know if the cached answer was right. A router's "cost mode" does not know if the cheap model failed. A quota does not know what it prevented.

TokenClaw closes that join by making quality a **binding precondition of authorization**, not a dashboard you check afterwards:

*   Every Spend Warrant carries an explicit **quality floor** (98-99% in the modelled scenarios)
*   Every routing decision carries **reason, evidence, and a quality basis**: inspectable per rung
*   Every run **settles against verified outcomes**, separately from task completion
*   Capability promotion in LEARN is **proposed, never silently activated**

A cost optimization you cannot verify is not an optimization. It is a bet.

---

## Governance that accelerates instead of blocking

The failure mode to avoid is governance introduced as a blocker. TokenClaw is built so the governance _is_ the accelerator: the enforcement produces the headroom.

The **AI Spend Warrant** is the mechanism: a checksum-bound authorization issued before execution, carrying budget ceiling, quality floor, permitted route, advanced-model limit, retry cap, stop conditions, and a named business owner.

Critically, the warrant is bound to _this specific request_ by checksum, not to a role, a team, or a session. An agent cannot drift outside the plan it was authorized for, because the plan is the authorization.

Mapped against what good governance looks like in the first 30 days:

*   **Attribution**: every run carries a business owner and policy version
*   **Observability**: live economics stream per phase, not a monthly surprise
*   **Budgets and alerts**: the warrant is a hard, pre-execution ceiling with visible headroom
*   **Showback before chargeback**: recovered capacity is shown as _additional work funded_, not as a bill
*   **An evaluation baseline**: the quality floor is enforced as a precondition
*   **A gateway**: one policy enforcement point rather than per-application governance

And the HOLD phase draws the line agents must not cross alone: issuing refunds, changing production, shipping a release. In the prototype these genuinely block: the demo cannot be clicked past a control point without a decision on record, and the deny path is real.

---

## Where the loop actually costs you

Agentic systems do not fail on per-token price. They fail on **loop count**. One user request quietly becomes ten to fifty model calls, each re-sending accumulated context, with failed tool calls billed exactly like successful ones.

TokenClaw attacks this at the root by asking the ladder question _per unit of work_, before the loop starts, so 810 of 1,000 cases never enter a model loop at all. You cannot optimize a loop as effectively as you can avoid entering it.

And because LEARN promotes stable patterns into certified deterministic capability, the ladder shifts downward over time. In the modelled casework scenario, 7 of 9 steps ran without a model after ten successful runs, proposed as a capability at 97% deterministic coverage.

**Every run makes the next one cheaper. That is the compounding loop, and it is the opposite of a cap.**

---

## Azure architecture

The intended production mapping, exposed in the prototype's Connected Services view:

*   **Azure API Management (AI gateway)**: the interception point; token limits, quotas, semantic caching, per-consumer token metrics, circuit breaking
*   **Microsoft Foundry**: model catalogue and bounded execution across advanced, small, and local tiers
*   **Azure AI Search**: verified-outcome reuse and capability discovery
*   **Microsoft Fabric**: business outcome settlement and economic reporting
*   **Microsoft Purview**: classification, data boundaries, governance context
*   **Azure Monitor / Application Insights**: execution evidence, warrant compliance, quality telemetry
*   **Azure Functions / Container Apps**: certified deterministic capabilities

The architecturally load-bearing decision: **the gateway is the enforcement boundary, not an advisory layer.** A model may _propose_ a routing plan; authorization must be deterministic and checksum-bound. Keeping proposal and authorization separate is what makes the warrant mean something.

---

## What is real, and what is not

Being precise about this matters more than the demo looking impressive.

**Real in the prototype:**

*   The complete ten-phase lifecycle and its state machine
*   All routing arithmetic, warrant limits, outcome and capacity calculations
*   Human control points that genuinely block progress until a decision is recorded
*   Browser-native spoken narration, and fully reproducible media renderers that drive the real UI

**Simulated:**

*   Scenario results are deterministic fixtures, not live model execution
*   No live Azure calls are made; Connected Services shows intended mapping only
*   In the self-running demo the approval is recorded automatically and **labelled as simulated on screen and in the narration**
*   Capability candidates are **proposed**, never silently certified

The repository documents its own known modelling limitations, including an unmodelled platform-cost remainder and a difference in outcome-accounting convention between scenarios. We would rather a judge read that from us than find it themselves.

---

## Try it

*   **Repository:** https://github.com/jvargh/hack26-tokenclaw
*   **Narrated walkthrough:** 1:48 video covering the full lifecycle, with spoken narration and captions
*   **Scenario walkthroughs:** the two captioned GIFs above, showing IT incidents and software validation end to end
*   **Run it locally:** `npm install && npm run dev` in `tokenclaw/mock-ui`, then press **Run full demo** for a self-narrating walkthrough

The prototype narrates itself using browser-native speech (no API key, no network call), and every spoken line is captioned for silent rooms. The demo media is regenerated by Playwright driving the actual interface, so a recording can never drift from the product.

A **technical deep dive** in the repository covers the domain model, lifecycle state machine, governance surfaces, design decisions, and every defect found and fixed during development.

---

## Why it matters

Enterprises are not asking us to make AI cheaper. They are asking us to make it **defensible**: to show that spend produced outcomes, that quality did not quietly degrade, and that an agent did not do something nobody authorized.

TokenClaw is a demonstration that cost control, quality assurance, and governance are the same problem, solved at the same control point, before execution rather than after the invoice.

The caps we reach for today tax the innovation we exist to deliver. **The alternative is not spending less. It is proving what the spending bought, and reinvesting what it never needed to spend at all.**

> **The AI that knows when not to think.**

### Copy to here

---

# Part 2: Additional information

---

## Hacking On

**Free-text keywords. Type each, then press Enter to create.** Recommended set:

```
Tokenomics
Cost Per Outcome
AI Governance
Agentic AI
Azure API Management
Model Routing
FinOps
Responsible AI
```

Lead with **Tokenomics** and **Cost Per Outcome**: the first is the challenge itself, the second is the reframe the project argues for.

---

## Problem or opportunity statement

**Limit: 200 characters, using 196**

```
We see AI cost only after it's spent, so the only lever left is a cap, and caps slow the work we're trying to scale. The opportunity: decide before the model runs, and prove what the spend bought.
```

**Alternate.** Slightly plainer, if you prefer it less pointed:

```
AI cost arrives as a bill, not a decision. Capping it slows the work we are trying to grow. The opportunity: price every request before the model runs, and measure cost per outcome, not per token.
```

---

## Writing Code

```
Yes
```

A working React + TypeScript prototype, a reproducible Playwright/ffmpeg media pipeline, and full documentation are published in the repository.

---

## Who is this for?

Select the closest match in the live dropdown. In priority order:

1.  **Customers**: enterprises scaling AI who need spend to be defensible, not just capped
2.  **Microsoft (internal)**: SP&D field and consulting teams who need a better customer conversation about AI economics

If only one selection is permitted, choose **Customers**: the artifact is built to change a customer conversation.

---

## Venue

```
Select per your actual participation (e.g. Virtual / Digital)
```

Choose the option matching how you are taking part. Pick **Virtual** if you are not attending a physical hackathon hub.

---

## Visibility

```
Internal and external participants
```

Keep the default. The project contains no confidential material, the repository is already public, and every simulated element is explicitly disclosed, so there is no reason to restrict reach.

---

## Feature within an existing Microsoft product or service

**Limit: 200 characters, using 194**

```
Azure API Management AI Gateway: a policy layer that authorizes spend before each call, routes work to the cheapest safe path, and reports cost per outcome. Complements the Foundry Model Router.
```

**Alternate.** Names both platform anchors, if you want Foundry weighted equally:

```
Azure API Management AI Gateway for enforcement, with Microsoft Foundry for bounded model execution. TokenClaw adds the pre-execution spend decision and outcome settlement those layers leave open.
```

**Why this framing:** the AI Gateway is already the single point every model call passes through, which is exactly where a pre-execution authorization has to live. Positioning TokenClaw as complementary to the Model Router matters: the router picks a cheaper model for a call you have already decided to make, while TokenClaw decides whether the call is needed at all.

---

## Briefly describe what you made and how you made it

**Limit: 1,000 characters, using 977 (987 if the form counts CRLF line breaks)**

```
A working browser prototype, built in React, TypeScript and Vite. It runs the full lifecycle across three enterprise scenarios: intercept the plan before the model runs, route work down the execution ladder, issue a Spend Warrant, execute under it, hold the risky action for a human, settle the outcome, and propose what to certify next.

Every number on screen is derived from typed fixtures at render time, so the display cannot contradict the data.

Governance is enforced, not illustrated: execution cannot be skipped before it completes, and the control point needs a recorded decision to pass.

It narrates itself with the browser's own speech synthesis, holding each phase until its line finishes. No API key, no network call.

The video and GIFs are rendered by a Playwright and ffmpeg pipeline that drives the real interface, so they cannot drift from it.

Deterministic fixtures, not live model execution. That boundary is stated in the interface, narration and docs.
```

**If the form rejects it as too long,** delete the final paragraph. The same disclosure appears in the Description, the interface and the repository, so nothing is lost.

---

## Code repository

**Limit: 200 characters, using 42**

```
https://github.com/jvargh/hack26-tokenclaw
```

---

## Pre-submission checklist

**Part 1: Basics**

- [ ] Title pasted (47 / 140)
- [ ] Tagline pasted (281 / 300)
- [ ] Executive Challenge set to **Tokenomics: The Zero-Waste AI Challenge**
- [ ] Topic Challenges selected from the live dropdown (up to 5)
- [ ] Description pasted (14,535 / 30,000)
- [ ] Project saved, then the three images inserted at their markers
- [ ] `[INSERT IMAGE: ...]` marker lines deleted after inserting

**Part 2: Additional information**

- [ ] Hacking On keywords entered (each one needs Enter to register)
- [ ] Problem or opportunity statement pasted (196 / 200)
- [ ] Writing Code set to **Yes**
- [ ] Who is this for? selected
- [ ] Venue selected
- [ ] Visibility left as **Internal and external participants**
- [ ] Product/service field pasted (194 / 200)
- [ ] What you made and how pasted (977 / 1,000)
- [ ] Code repository pasted (42 / 200)

**Final**

- [ ] Project saved **before** attaching images
- [ ] Demo video attached or linked
- [ ] Repository verified public: https://github.com/jvargh/hack26-tokenclaw
