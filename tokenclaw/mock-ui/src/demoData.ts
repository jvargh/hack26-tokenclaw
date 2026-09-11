export type ScenarioId = 'casework' | 'incidents' | 'validation'

export interface Route {
  id: string
  shortLabel: string
  label: string
  count: number
  cost: number
  color: 'reuse' | 'deterministic' | 'small' | 'advanced'
  reason: string
  quality: string
  evidence: string
}

export interface Scenario {
  id: ScenarioId
  code: string
  label: string
  eyebrow: string
  owner: string
  request: string
  outcome: string
  total: number
  unit: string
  evidence: string[]
  baselineCost: number
  actualCost: number
  budget: number
  qualityFloor: number
  quality: number
  verified: number
  followUp: number
  humanDecisions: number
  blockedAction: string
  policy: string
  additionalCapacity: string
  routes: Route[]
  learn: {
    successfulRuns: number
    stableSteps: number
    modelSteps: number
    coverage: number
    annualSavings: number
    capability: string
  }
}

export const scenarios: Record<ScenarioId, Scenario> = {
  casework: {
    id: 'casework',
    code: 'CX-1042',
    label: 'Customer Case Resolution',
    eyebrow: 'Customer operations',
    owner: 'Customer Operations',
    request:
      'Review 1,000 customer support cases, resolve everything that can be safely automated, and escalate only cases requiring human judgment.',
    outcome: 'Accurately resolved customer cases',
    total: 1000,
    unit: 'cases',
    evidence: ['1,000 open cases', 'CX policy v12', 'Verified resolution history'],
    baselineCost: 40,
    actualCost: 6.2,
    budget: 8,
    qualityFloor: 98,
    quality: 98.7,
    verified: 967,
    followUp: 25,
    humanDecisions: 8,
    blockedAction: 'Issue 8 customer refunds',
    policy: 'CX-POLICY-v12',
    additionalCapacity: '5,451 additional cases',
    routes: [
      {
        id: 'reuse',
        shortLabel: 'REUSE',
        label: 'Verified outcome reuse',
        count: 420,
        cost: 0,
        color: 'reuse',
        reason: 'Resolution signatures match active, verified case patterns.',
        quality: '99.4% historical acceptance',
        evidence: '420 verified resolutions, current policy checksum',
      },
      {
        id: 'capability',
        shortLabel: 'CERTIFIED',
        label: 'Certified capability',
        count: 390,
        cost: 0.39,
        color: 'deterministic',
        reason: 'CX-Resolution-v3 applies without model inference.',
        quality: '99.1% certified quality',
        evidence: 'Capability certificate, regression set, CX policy v12',
      },
      {
        id: 'small',
        shortLabel: 'SMALL MODEL',
        label: 'Small-model assistance',
        count: 150,
        cost: 1.2,
        color: 'small',
        reason: 'Bounded ambiguity remains after deterministic checks.',
        quality: '98.8% projected quality',
        evidence: 'Uncertainty classifier v5, approved compact model',
      },
      {
        id: 'advanced',
        shortLabel: 'ADVANCED',
        label: 'Advanced reasoning',
        count: 40,
        cost: 4,
        color: 'advanced',
        reason: 'Novel exceptions fall below the small-model confidence floor.',
        quality: '98.7% projected quality',
        evidence: 'Escalation rule 7B, advanced-model allowance: 40',
      },
    ],
    learn: {
      successfulRuns: 10,
      stableSteps: 7,
      modelSteps: 2,
      coverage: 97,
      annualSavings: 18420,
      capability: 'CX-Resolution-v4',
    },
  },
  incidents: {
    id: 'incidents',
    code: 'OPS-0250',
    label: 'IT Incident Resolution',
    eyebrow: 'Cloud operations',
    owner: 'Cloud Reliability',
    request:
      'Investigate 250 application incidents and safely resolve everything that matches approved evidence and runbooks.',
    outcome: 'Verified incident resolutions',
    total: 250,
    unit: 'incidents',
    evidence: ['250 active incidents', 'Runbook registry v8', 'Monitor evidence'],
    baselineCost: 15,
    actualCost: 3,
    budget: 4,
    qualityFloor: 99,
    quality: 99.2,
    verified: 243,
    followUp: 7,
    humanDecisions: 3,
    blockedAction: 'Execute 3 production remediations',
    policy: 'OPS-POLICY-v8',
    additionalCapacity: '1,000 additional incidents',
    routes: [
      {
        id: 'reuse',
        shortLabel: 'REUSE',
        label: 'Verified incident reuse',
        count: 110,
        cost: 0,
        color: 'reuse',
        reason: 'Incident fingerprints match verified prior resolutions.',
        quality: '99.7% historical acceptance',
        evidence: 'Incident signatures and closed-resolution evidence',
      },
      {
        id: 'capability',
        shortLabel: 'RUNBOOK',
        label: 'Certified runbook',
        count: 85,
        cost: 0.17,
        color: 'deterministic',
        reason: 'Approved runbooks fully cover the detected conditions.',
        quality: '99.5% certified quality',
        evidence: 'Runbook v8, health checks, dependency checksum',
      },
      {
        id: 'small',
        shortLabel: 'SMALL MODEL',
        label: 'Small-model diagnosis',
        count: 40,
        cost: 0.6,
        color: 'small',
        reason: 'Telemetry needs bounded synthesis before a runbook can apply.',
        quality: '99.2% projected quality',
        evidence: 'Monitor evidence and approved diagnostic prompt',
      },
      {
        id: 'advanced',
        shortLabel: 'ADVANCED',
        label: 'Advanced reasoning',
        count: 15,
        cost: 1.8,
        color: 'advanced',
        reason: 'Novel incidents require cross-signal reasoning.',
        quality: '99.2% projected quality',
        evidence: 'Novelty classifier and warrant escalation rule',
      },
    ],
    learn: {
      successfulRuns: 12,
      stableSteps: 9,
      modelSteps: 2,
      coverage: 96,
      annualSavings: 27400,
      capability: 'Incident-Triage-v9',
    },
  },
  validation: {
    id: 'validation',
    code: 'REL-2400',
    label: 'Software Validation',
    eyebrow: 'Release engineering',
    owner: 'Platform Engineering',
    request: 'Validate this release before production deployment.',
    outcome: 'Verified release validation',
    total: 2400,
    unit: 'checks',
    evidence: ['Release candidate 7', '2,400 validation operations', 'Deployment policy v14'],
    baselineCost: 72,
    actualCost: 9,
    budget: 12,
    qualityFloor: 99,
    quality: 99.1,
    verified: 2397,
    followUp: 3,
    humanDecisions: 1,
    blockedAction: 'Deploy release candidate 7',
    policy: 'RELEASE-POLICY-v14',
    additionalCapacity: '16,800 additional checks',
    routes: [
      {
        id: 'reuse',
        shortLabel: 'REUSE',
        label: 'Certified finding reuse',
        count: 330,
        cost: 0,
        color: 'reuse',
        reason: 'Inputs match checksum-bound findings from this release train.',
        quality: '100% checksum match',
        evidence: 'Finding manifests and unchanged dependency graph',
      },
      {
        id: 'capability',
        shortLabel: 'DETERMINISTIC',
        label: 'Tests and static analysis',
        count: 1850,
        cost: 1.85,
        color: 'deterministic',
        reason: 'Software can prove these requirements without model inference.',
        quality: '99.9% deterministic coverage',
        evidence: 'Test results, static analysis, policy validators',
      },
      {
        id: 'small',
        shortLabel: 'SMALL MODEL',
        label: 'Small-model review',
        count: 170,
        cost: 1.36,
        color: 'small',
        reason: 'Review findings require bounded semantic classification.',
        quality: '99.3% projected quality',
        evidence: 'Review rubric v6 and approved compact model',
      },
      {
        id: 'advanced',
        shortLabel: 'ADVANCED',
        label: 'Advanced reasoning',
        count: 50,
        cost: 5,
        color: 'advanced',
        reason: 'Cross-component risk requires advanced reasoning.',
        quality: '99.1% projected quality',
        evidence: 'Risk threshold and release warrant',
      },
    ],
    learn: {
      successfulRuns: 18,
      stableSteps: 11,
      modelSteps: 3,
      coverage: 98,
      annualSavings: 42600,
      capability: 'Release-Assurance-v15',
    },
  },
}

export const ladderRows = [
  ['No execution required', 'REJECTED', 'The requested outcome is not already complete.'],
  ['Verified outcome reuse', 'PARTIAL', 'Reuse approved evidence where signatures match.'],
  ['Certified capability', 'PARTIAL', 'Execute stable work deterministically.'],
  ['Reusable workflow / cached evidence', 'EVALUATED', 'No exclusive records remain at this rung.'],
  ['Local / deterministic processing', 'INCLUDED', 'Included inside the certified capability.'],
  ['Small model', 'PARTIAL', 'Resolve bounded uncertainty at low cost.'],
  ['Advanced model', 'ESCALATION ONLY', 'Allow only the hardest exceptions.'],
  ['Agent workflow', 'REJECTED', 'A multi-step agent is unnecessary for this request.'],
] as const

export const demoStages = [
  'REQUEST',
  'BASELINE',
  'GRAB',
  'PULL',
  'WARRANT',
  'EXECUTE',
  'HOLD',
  'OUTCOME',
  'CAPACITY',
  'LEARN',
] as const

export type DemoStage = (typeof demoStages)[number]
