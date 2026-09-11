import type { DemoStage, ScenarioId } from './demoData'

/**
 * A beat is a single spoken segment. Every stage has one, plus an extra beat for
 * the moment the human control point is on screen and awaiting a decision.
 */
export type NarrationBeat = DemoStage | 'HOLD_DECISION'

export const narrationScript: Record<ScenarioId, Record<NarrationBeat, string>> = {
  casework: {
    REQUEST:
      'This is TokenClaw, an economic execution gateway. A request has just arrived: review one thousand customer support cases, resolve everything that can be safely automated, and escalate only what genuinely needs human judgment. Nothing is running yet. What you see is a proposed route, not execution.',
    BASELINE:
      'First, the baseline. An ordinary agent would send all one thousand cases to an advanced model. Every case, full inference, forty dollars. The work would get done, but nobody would ever know whether forty dollars was the right price.',
    GRAB:
      'TokenClaw grabs the request before a single token is spent. This is the moment that matters. Execution is intercepted before inference, not reported on a dashboard next month.',
    PULL:
      'Now the claw pulls the work apart and drops each piece down the execution ladder. Four hundred and twenty cases match outcomes that were already verified, so they cost nothing. Three hundred and ninety route to a certified capability that runs deterministically, for thirty nine cents. One hundred and fifty need a small model, at one dollar twenty. Only forty exceptions ever reach advanced reasoning, at four dollars.',
    WARRANT:
      'That plan becomes an A.I. Spend Warrant, a checksum bound authorization. Six dollars and twenty cents against an eight dollar budget, a ninety eight percent quality floor, and eight human decisions held in reserve. Nothing is allowed to execute outside this warrant.',
    EXECUTE:
      'Execution begins, governed by the warrant. Each lane runs independently and is metered against its own allowance. If any lane tried to exceed what was authorized, it would stop rather than overspend.',
    HOLD:
      'And here it stops. Eight cases require customer refunds. The agent cannot cross that boundary. C.X. policy version twelve demands a human decision, and no amount of model confidence overrides it.',
    HOLD_DECISION:
      'The decision is recorded against the warrant itself. In this mock the approval is simulated. In production it would be a named, accountable person, and the decision would be permanently attributable.',
    OUTCOME:
      'Nine hundred and sixty seven customer cases, independently verified. Not tokens consumed, outcomes delivered. Six dollars and twenty cents produced nine hundred and sixty seven resolved cases. That is less than a cent each, and that is the only unit of economics that actually matters.',
    CAPACITY:
      'Thirty three dollars and eighty cents was never spent. That is not a saving sitting in a report, it is recovered capacity. At this rate it funds five thousand four hundred and fifty one additional cases. The same budget now buys roughly six and a half times the work.',
    LEARN:
      'Finally, TokenClaw learns. After ten successful runs, seven of the nine steps were stable enough to run with no model at all. That pattern is proposed as a new certified capability, C.X. Resolution version four, which would move ninety seven percent of this work permanently below the model line. Every run makes the next one cheaper. That is the compounding loop.',
  },
  incidents: {
    REQUEST:
      'This is TokenClaw, an economic execution gateway. Cloud Reliability has asked for two hundred and fifty application incidents to be investigated, and everything that matches approved evidence and runbooks to be resolved safely. Nothing is running yet. This is a proposed route, not execution.',
    BASELINE:
      'First, the baseline. An ordinary agent would push all two hundred and fifty incidents through an advanced model. Fifteen dollars, every incident treated as though it were novel, even the ones the team has already solved a hundred times.',
    GRAB:
      'TokenClaw grabs the run before inference begins. On an incident queue this matters even more, because the expensive path and the risky path are usually the same path.',
    PULL:
      'The claw pulls the queue apart against the execution ladder. One hundred and ten incidents have fingerprints matching verified prior resolutions, so they cost nothing. Eighty five are fully covered by certified runbooks, for seventeen cents. Forty need a small model to synthesise telemetry, at sixty cents. Only fifteen genuinely novel incidents reach advanced reasoning, at one dollar eighty.',
    WARRANT:
      'The plan becomes an A.I. Spend Warrant. Three dollars against a four dollar budget, a ninety nine percent quality floor, and three production remediations held back for human decision. The warrant is the authorization, not a suggestion.',
    EXECUTE:
      'Execution proceeds under the warrant. Reuse and runbook lanes clear almost immediately, because deterministic work does not need to think. The model lanes are deliberately the smallest part of the run.',
    HOLD:
      'And here it stops. Three incidents require changes to production systems. Operations policy version eight will not let an agent make that change on its own, regardless of how confident it is.',
    HOLD_DECISION:
      'The decision is recorded against the warrant itself. In this mock the approval is simulated. In production a named on call engineer would own it, and it would be permanently attributable.',
    OUTCOME:
      'Two hundred and forty three incidents verifiably resolved, with seven routed to follow up. Three dollars for two hundred and forty three verified resolutions is a little over one cent per incident.',
    CAPACITY:
      'Twelve dollars was never spent. At this rate it funds roughly one thousand additional incidents. The reliability team did not get a cost report, they got four times the throughput from the same budget.',
    LEARN:
      'And TokenClaw learns. After twelve successful runs, nine of the eleven steps were stable without a model. That becomes a proposed capability, Incident Triage version nine, projected to cover ninety six percent of this work deterministically. The queue gets cheaper every time it runs.',
  },
  validation: {
    REQUEST:
      'This is TokenClaw, an economic execution gateway. Platform Engineering needs release candidate seven validated before it reaches production. That is two thousand four hundred individual validation operations. Nothing is running yet. This is a proposed route, not execution.',
    BASELINE:
      'First, the baseline. An ordinary agent would send all two thousand four hundred checks to an advanced model. Seventy two dollars, to ask a language model to do work that compilers, test suites and static analysers already do perfectly, and provably.',
    GRAB:
      'TokenClaw grabs the run before inference. This scenario is the clearest example of the core problem: most validation work does not need intelligence, it needs execution.',
    PULL:
      'The claw pulls the release apart against the ladder. Three hundred and thirty checks match checksum bound findings from this release train, so they cost nothing. One thousand eight hundred and fifty are proven deterministically by tests and static analysis, for one dollar eighty five. One hundred and seventy need bounded semantic review, at one dollar thirty six. Only fifty cross component risks reach advanced reasoning, at five dollars.',
    WARRANT:
      'The plan becomes an A.I. Spend Warrant. Nine dollars against a twelve dollar budget, a ninety nine percent quality floor, and the deployment itself reserved for human decision. The warrant is checksum bound to this exact release candidate.',
    EXECUTE:
      'Execution runs under the warrant. Notice the shape of it: the overwhelming majority of validation completes in the deterministic lanes, and the model is reserved for the genuinely ambiguous minority.',
    HOLD:
      'And here it stops. Deploying release candidate seven to production is a human decision. Release policy version fourteen does not delegate that, and a passing validation run is not the same thing as permission to ship.',
    HOLD_DECISION:
      'The decision is recorded against the warrant itself. In this mock the approval is simulated. In production a named release manager would own it, bound to this warrant and this candidate.',
    OUTCOME:
      'Two thousand three hundred and ninety seven validation outcomes verified, with three routed to follow up. Nine dollars across two thousand three hundred and ninety seven verified checks is well under half a cent each.',
    CAPACITY:
      'Sixty three dollars was never spent. At this rate it funds roughly sixteen thousand eight hundred additional checks. That is the difference between validating one release and validating every release.',
    LEARN:
      'And TokenClaw learns. After eighteen successful runs, eleven of the fourteen steps were stable without a model. That becomes a proposed capability, Release Assurance version fifteen, projected at ninety eight percent deterministic coverage. Assurance gets cheaper and stronger at the same time.',
  },
}

export function narrationFor(scenarioId: ScenarioId, beat: NarrationBeat): string {
  return narrationScript[scenarioId][beat]
}

/**
 * Fallback pacing used when narration is muted or unsupported, so the demo still
 * advances at a watchable rhythm.
 */
export const silentBeatDelay: Record<NarrationBeat, number> = {
  REQUEST: 1800,
  BASELINE: 1800,
  GRAB: 1400,
  PULL: 2000,
  WARRANT: 1800,
  EXECUTE: 700,
  HOLD: 1400,
  HOLD_DECISION: 1400,
  OUTCOME: 1800,
  CAPACITY: 1800,
  LEARN: 1800,
}
