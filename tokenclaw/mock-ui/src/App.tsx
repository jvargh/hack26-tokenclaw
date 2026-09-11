import { useEffect, useMemo, useState, type ReactNode } from 'react'
import './App.css'
import {
  demoStages,
  ladderRows,
  scenarios,
  type DemoStage,
  type Route,
  type Scenario,
  type ScenarioId,
} from './demoData'
import { narrationFor, silentBeatDelay, type NarrationBeat } from './narration'
import { useNarrator } from './useNarrator'

type Decision = 'pending' | 'approved' | 'denied'
type DrawerType = 'evidence' | 'services' | 'warrant'
type EventTone = 'neutral' | 'claw' | 'success' | 'warn' | 'danger'

interface DemoEvent {
  stage: DemoStage
  message: string
  tone: EventTone
}

function App() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('casework')
  const [stageIndex, setStageIndex] = useState(0)
  const [view, setView] = useState<'flow' | 'ladder'>('flow')
  const [progress, setProgress] = useState(0)
  const [autoplay, setAutoplay] = useState(false)
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [decision, setDecision] = useState<Decision>('pending')
  const [drawer, setDrawer] = useState<DrawerType | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [narrationOn, setNarrationOn] = useState(true)
  const [completedBeatToken, setCompletedBeatToken] = useState('')
  const [engaged, setEngaged] = useState(false)
  const [narrationRun, setNarrationRun] = useState(0)
  const narrator = useNarrator()
  const { speak: speakLine, cancel: cancelSpeech } = narrator

  const scenario = scenarios[scenarioId]
  const stage = demoStages[stageIndex]
  // The approval dialog is its own spoken beat so the human control point gets
  // narrated separately from the phase that reveals it. Once a decision exists we
  // stay on that beat rather than re-speaking the HOLD line on the way out.
  const beat: NarrationBeat =
    stage === 'HOLD' && (approvalOpen || decision !== 'pending') ? 'HOLD_DECISION' : stage
  const narrationActive = narrationOn && narrator.supported
  // A beat is identified by its name plus the current run, so pausing and
  // resuming replays the line rather than treating it as already delivered.
  const beatToken = `${beat}:${narrationRun}`
  const beatComplete = completedBeatToken === beatToken
  const avoided = scenario.baselineCost - scenario.actualCost
  const deterministicRate = Math.round(
    ((scenario.routes[0].count + scenario.routes[1].count) / scenario.total) * 100,
  )
  const advancedRate = (scenario.routes[3].count / scenario.total) * 100
  const costPerOutcome = scenario.actualCost / scenario.verified

  useEffect(() => {
    if (stage !== 'EXECUTE') return
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(timer)
          return 100
        }
        return Math.min(100, current + 4)
      })
    }, 70)
    return () => window.clearInterval(timer)
  }, [stage, scenarioId])

  // Narration drives pacing. A beat reports completion only once its line has
  // finished, so the autoplay effect below can never advance over a sentence
  // that is still being spoken.
  useEffect(() => {
    if (!engaged) return

    if (!narrationActive) {
      const timer = window.setTimeout(() => setCompletedBeatToken(beatToken), silentBeatDelay[beat])
      return () => window.clearTimeout(timer)
    }

    let abandoned = false
    speakLine(narrationFor(scenarioId, beat), () => {
      if (!abandoned) setCompletedBeatToken(beatToken)
    })
    return () => {
      abandoned = true
      cancelSpeech()
    }
  }, [beat, beatToken, cancelSpeech, engaged, narrationActive, scenarioId, speakLine])

  useEffect(() => {
    if (!autoplay || stage === 'LEARN') return
    if (!beatComplete) return
    if (stage === 'EXECUTE' && progress < 100) return

    if (stage === 'HOLD') {
      const timer = window.setTimeout(
        () => {
          if (!approvalOpen) {
            setApprovalOpen(true)
            return
          }
          setDecision('approved')
          setApprovalOpen(false)
          setStageIndex(7)
        },
        approvalOpen ? 700 : 500,
      )
      return () => window.clearTimeout(timer)
    }

    const nextStageIndex = Math.min(demoStages.length - 1, stageIndex + 1)
    const timer = window.setTimeout(() => {
      if (stage === 'WARRANT') setProgress(0)
      setStageIndex(nextStageIndex)
      if (nextStageIndex === demoStages.length - 1) setAutoplay(false)
    }, 620)
    return () => window.clearTimeout(timer)
  }, [approvalOpen, autoplay, beatComplete, progress, stage, stageIndex])

  const events = useMemo(() => {
    const all: DemoEvent[] = [
      { stage: 'REQUEST', message: 'Run created from customer outcome request', tone: 'neutral' },
      { stage: 'BASELINE', message: `Ordinary agent baseline calculated at ${money(scenario.baselineCost)}`, tone: 'neutral' },
      { stage: 'GRAB', message: 'TokenClaw intercepted execution before inference', tone: 'claw' },
      { stage: 'PULL', message: `${scenario.routes[0].count} verified outcomes matched`, tone: 'success' },
      { stage: 'PULL', message: `${scenario.routes[1].count} work units assigned to certified capability`, tone: 'success' },
      { stage: 'PULL', message: `${scenario.routes[3].count} exceptions reserved for advanced reasoning`, tone: 'warn' },
      { stage: 'WARRANT', message: `Spend Warrant proposed under ${scenario.policy}`, tone: 'neutral' },
      { stage: 'EXECUTE', message: 'Warrant approved; governed execution started', tone: 'success' },
      { stage: 'HOLD', message: `${scenario.blockedAction} blocked pending approval`, tone: 'danger' },
      { stage: 'OUTCOME', message: `${scenario.verified} business outcomes independently verified`, tone: 'success' },
      { stage: 'CAPACITY', message: `${money(avoided)} recovered for additional work`, tone: 'claw' },
      { stage: 'LEARN', message: `${scenario.learn.capability} proposed from repeated success`, tone: 'success' },
    ]
    const visibleStages = new Set(demoStages.slice(0, stageIndex + 1))
    const visible = all.filter((event) => visibleStages.has(event.stage))
    if (decision !== 'pending') {
      const decisionEvent: DemoEvent = {
        stage: 'HOLD',
        message: `Human decision recorded: ${decision.toUpperCase()}`,
        tone: decision === 'approved' ? 'success' : 'warn',
      }
      // The decision must read immediately after the action it unblocked, or the
      // stream implies outcomes were verified before anyone approved them.
      const blockedIndex = visible.findIndex((event) => event.stage === 'HOLD')
      if (blockedIndex === -1) visible.push(decisionEvent)
      else visible.splice(blockedIndex + 1, 0, decisionEvent)
    }
    return visible
  }, [avoided, decision, scenario, stageIndex])

  const reset = (nextScenario = scenarioId) => {
    cancelSpeech()
    setScenarioId(nextScenario)
    setStageIndex(0)
    setView('flow')
    setProgress(0)
    setAutoplay(false)
    setApprovalOpen(false)
    setDecision('pending')
    setDrawer(null)
    setSelectedRoute(null)
    setEngaged(false)
    setCompletedBeatToken('')
  }

  const advance = () => {
    setEngaged(true)
    if (stage === 'HOLD') {
      setApprovalOpen(true)
      return
    }
    if (stage === 'WARRANT') setProgress(0)
    setStageIndex((current) => Math.min(demoStages.length - 1, current + 1))
  }

  const approveAction = (nextDecision: Exclude<Decision, 'pending'>) => {
    setDecision(nextDecision)
    setApprovalOpen(false)
    window.setTimeout(() => setStageIndex(7), 250)
  }

  const primaryLabel: Record<DemoStage, string> = {
    REQUEST: 'Compare ordinary agent',
    BASELINE: 'Let TokenClaw inspect',
    GRAB: 'Evaluate execution ladder',
    PULL: 'Review Spend Warrant',
    WARRANT: 'Approve warrant & execute',
    EXECUTE: progress < 100 ? `Executing ${progress}%` : 'Trigger governed action',
    HOLD: `Review ${scenario.humanDecisions} decisions`,
    OUTCOME: 'View recovered capacity',
    CAPACITY: 'Analyze for reuse',
    LEARN: 'Reset demonstration',
  }
  const primaryAction = stage === 'LEARN' ? () => reset() : advance
  const primaryDisabled = stage === 'EXECUTE' && progress < 100

  const inspectRoute = (route: Route) => {
    setSelectedRoute(route)
    setDrawer('evidence')
  }

  const navigateToStage = (nextStageIndex: number) => {
    setAutoplay(false)
    setApprovalOpen(false)
    setEngaged(true)
    setDecision(nextStageIndex >= 7 ? 'approved' : 'pending')
    if (nextStageIndex === 5) setProgress(0)
    setStageIndex(nextStageIndex)
  }

  const toggleAutoplay = () => {
    if (autoplay) {
      setAutoplay(false)
      cancelSpeech()
      return
    }
    if (stage === 'LEARN') reset()
    setEngaged(true)
    // Bump the run counter so resuming re-speaks the current beat from the top
    // instead of silently waiting on a line that was cancelled by the pause.
    setNarrationRun((current) => current + 1)
    setAutoplay(true)
  }

  const toggleNarration = () => {
    setNarrationOn((current) => {
      if (current) cancelSpeech()
      return !current
    })
  }

  return (
    <div className={`app-shell ${narrationActive && engaged ? 'with-narration' : ''}`}>
      <Header
        scenario={scenario}
        scenarioId={scenarioId}
        stage={stage}
        stageIndex={stageIndex}
        progress={progress}
        onScenario={(id) => reset(id)}
        onServices={() => setDrawer('services')}
      />

      <main className="workspace">
        <RequestPanel
          scenario={scenario}
          primaryLabel={primaryLabel[stage]}
          disabled={primaryDisabled}
          onPrimary={primaryAction}
        />

        <section className={`execution-panel panel stage-${stage.toLowerCase()}`}>
          <div className="canvas-header">
            <div>
              <div className="section-kicker">Execution canvas</div>
              <h2>{stageTitle(stage)}</h2>
            </div>
            <div className="view-switcher" role="group" aria-label="Canvas view">
              <button className={view === 'flow' ? 'active' : ''} onClick={() => setView('flow')}>Flow</button>
              <button className={view === 'ladder' ? 'active' : ''} onClick={() => setView('ladder')}>Ladder</button>
            </div>
          </div>

          <div className="canvas-body">
            {view === 'ladder' && stageIndex >= 3 ? (
              <ExecutionLadder stageIndex={stageIndex} scenario={scenario} onRoute={inspectRoute} />
            ) : stageIndex <= 2 ? (
              <BaselineFlow scenario={scenario} active={stage === 'BASELINE'} grabbed={stage === 'GRAB'} />
            ) : stageIndex <= 4 ? (
              <PullFlow scenario={scenario} onRoute={inspectRoute} />
            ) : (
              <ExecutionFlow
                scenario={scenario}
                progress={stageIndex > 5 ? 100 : progress}
                stage={stage}
                decision={decision}
                onRoute={inspectRoute}
              />
            )}
          </div>

          <div className="canvas-caption">
            <span className="live-dot" />
            <strong>{stageCallout(stage, scenario.total)}</strong>
            <span>{stageDescription(stage, scenario)}</span>
          </div>
        </section>

        <ControlRail
          scenario={scenario}
          stageIndex={stageIndex}
          avoided={avoided}
          deterministicRate={deterministicRate}
          advancedRate={advancedRate}
          onWarrant={() => setDrawer('warrant')}
        />
      </main>

      <section className="bottom-dock">
        <div className="event-stream panel">
          <div className="dock-heading">
            <span>Event / policy stream</span>
            <b>{events.length} EVENTS</b>
          </div>
          <div className="event-list">
            {events.slice(-5).map((event, index) => (
              <div className={`event event-${event.tone}`} key={`${event.stage}-${event.message}`}>
                <time>10:{String(1 + Math.floor((events.length + index) / 3)).padStart(2, '0')}:{String(12 + index * 4).padStart(2, '0')}</time>
                <span>{event.message}</span>
                <b>{event.stage}</b>
              </div>
            ))}
          </div>
        </div>
        <div className={`active-control panel control-${stage.toLowerCase()}`}>
          <ActiveControl
            stage={stage}
            scenario={scenario}
            decision={decision}
            costPerOutcome={costPerOutcome}
            onReview={() => setApprovalOpen(true)}
            onAdvance={primaryAction}
          />
        </div>
      </section>

      <NarrationBar
        visible={narrationActive && engaged}
        speaking={narrator.speaking}
        caption={narrator.caption}
        beat={beat}
      />

      <DemoController
        stageIndex={stageIndex}
        autoplay={autoplay}
        disabled={primaryDisabled}
        narrationOn={narrationOn}
        narrationSupported={narrator.supported}
        onNarration={toggleNarration}
        onBack={() => navigateToStage(Math.max(0, stageIndex - 1))}
        onAutoplay={toggleAutoplay}
        onStage={navigateToStage}
        onAdvance={advance}
        onReset={() => reset()}
      />

      {approvalOpen && (
        <ApprovalDialog
          scenario={scenario}
          automated={autoplay}
          onClose={() => setApprovalOpen(false)}
          onDecision={approveAction}
        />
      )}

      {drawer && (
        <Drawer title={drawerTitle(drawer)} onClose={() => setDrawer(null)}>
          {drawer === 'evidence' && selectedRoute && <EvidenceDetails route={selectedRoute} scenario={scenario} />}
          {drawer === 'warrant' && <WarrantDetails scenario={scenario} />}
          {drawer === 'services' && <ConnectedServices />}
        </Drawer>
      )}
    </div>
  )
}

function Header({
  scenario,
  scenarioId,
  stage,
  stageIndex,
  progress,
  onScenario,
  onServices,
}: {
  scenario: Scenario
  scenarioId: ScenarioId
  stage: DemoStage
  stageIndex: number
  progress: number
  onScenario: (id: ScenarioId) => void
  onServices: () => void
}) {
  return (
    <header className="app-header">
      <div className="brand-lockup">
        <ClawMark />
        <div><strong>TOKENCLAW</strong><span>Execution Studio</span></div>
      </div>
      <label className="scenario-control">
        <span>Scenario</span>
        <select value={scenarioId} onChange={(event) => onScenario(event.target.value as ScenarioId)}>
          {Object.values(scenarios).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <div className="phase-track" aria-label={`Current phase ${stage}`}>
        {['GRAB', 'PULL', 'HOLD', 'LEARN'].map((phase) => (
          <span key={phase} className={phaseClass(phase, stageIndex)}>{phase}</span>
        ))}
      </div>
      <div className="run-summary">
        <div><span>Run</span><strong>{scenario.code}</strong></div>
        <div>
          <span>Warrant</span>
          <strong className={stageIndex >= 5 ? 'good' : 'pending'}>
            {stageIndex >= 5 ? 'APPROVED' : stageIndex >= 4 ? 'PROPOSED' : 'PREFLIGHT'}
          </strong>
        </div>
        <div>
          <span>Spend</span>
          <strong>{money(stageIndex >= 5 ? scenario.actualCost * (stageIndex > 5 ? 1 : progress / 100) : 0)} / {money(scenario.budget)}</strong>
        </div>
      </div>
      <button className="icon-button" onClick={onServices} aria-label="View connected services"><NetworkIcon /></button>
    </header>
  )
}

function RequestPanel({
  scenario,
  primaryLabel,
  disabled,
  onPrimary,
}: {
  scenario: Scenario
  primaryLabel: string
  disabled: boolean
  onPrimary: () => void
}) {
  return (
    <aside className="request-panel panel">
      <div className="section-kicker">{scenario.eyebrow}</div>
      <h1>{scenario.label}</h1>
      <p className="request-copy">{scenario.request}</p>
      <section className="request-section">
        <div className="minor-title">Authorized evidence</div>
        {scenario.evidence.map((item, index) => (
          <div className="evidence-item" key={item}>
            <span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p><i>READY</i>
          </div>
        ))}
      </section>
      <section className="outcome-target">
        <div className="minor-title">Requested outcome</div>
        <strong>{scenario.outcome}</strong>
        <span>{scenario.total.toLocaleString()} {scenario.unit} in scope</span>
      </section>
      <div className="request-footer">
        <div className="baseline-mini">
          <span>Naive route</span><strong>{scenario.total.toLocaleString()} advanced calls</strong><b>{money(scenario.baselineCost)}</b>
        </div>
        <button className="primary-button" onClick={onPrimary} disabled={disabled}>
          <span>{primaryLabel}</span><ArrowIcon />
        </button>
      </div>
    </aside>
  )
}

function ControlRail({
  scenario,
  stageIndex,
  avoided,
  deterministicRate,
  advancedRate,
  onWarrant,
}: {
  scenario: Scenario
  stageIndex: number
  avoided: number
  deterministicRate: number
  advancedRate: number
  onWarrant: () => void
}) {
  return (
    <aside className="control-rail">
      <section className="warrant-card panel">
        <div className="rail-title">
          <div>
            <div className="section-kicker">AI Spend Warrant</div>
            <h2>{stageIndex >= 5 ? 'Approved' : stageIndex >= 4 ? 'Ready for approval' : 'Building'}</h2>
          </div>
          <button className="text-button" onClick={onWarrant}>Inspect</button>
        </div>
        <WarrantRow label="Business owner" value={scenario.owner} />
        <WarrantRow label="Maximum budget" value={money(scenario.budget)} emphasis />
        <WarrantRow label="Expected cost" value={money(scenario.actualCost)} />
        <WarrantRow label="Quality floor" value={`${scenario.qualityFloor.toFixed(1)}%`} />
        <WarrantRow label="Advanced limit" value={`${scenario.routes[3].count} ${scenario.unit}`} />
        <WarrantRow label="Maximum retries" value="2" />
        <WarrantRow label="External action" value="Approval required" alert />
        <div className="warrant-seal"><span>{stageIndex >= 5 ? 'BOUND' : 'DRAFT'}</span><code>{scenario.policy}</code></div>
      </section>
      <section className="economics-card panel">
        <div className="section-kicker">Live economics</div>
        <div className="cost-comparison">
          <div><span>Ordinary agent</span><strong>{money(scenario.baselineCost)}</strong></div>
          <div className="claw-cost"><span>TokenClaw route</span><strong>{stageIndex >= 4 ? money(scenario.actualCost) : '--'}</strong></div>
        </div>
        <div className="avoided"><span>Spend intercepted</span><strong>{stageIndex >= 3 ? money(avoided) : '$0.00'}</strong></div>
        <div className="metric-grid">
          <Metric label="Quality" value={stageIndex >= 7 ? `${scenario.quality}%` : `${scenario.qualityFloor}% floor`} />
          <Metric label="Reuse + deterministic" value={stageIndex >= 3 ? `${deterministicRate}%` : '--'} />
          <Metric label="Advanced reasoning" value={stageIndex >= 3 ? `${advancedRate.toFixed(1)}%` : '--'} />
          <Metric label="Verified outcomes" value={stageIndex >= 7 ? scenario.verified.toLocaleString() : 'Pending'} />
        </div>
      </section>
    </aside>
  )
}

function BaselineFlow({
  scenario,
  active,
  grabbed,
}: {
  scenario: Scenario
  active: boolean
  grabbed: boolean
}) {
  return (
    <div className="baseline-flow">
      <div className="flow-node request-node"><span>BUSINESS REQUEST</span><strong>{scenario.total.toLocaleString()} {scenario.unit}</strong></div>
      <div
        className={`stream stream-wide ${active ? 'active' : ''} ${grabbed ? 'stopped' : ''}`}
        aria-label={grabbed ? 'Execution stream intercepted' : active ? 'Ordinary agent baseline flow' : 'Proposed route, not executing'}
      >
        <span>{scenario.total.toLocaleString()}</span>
      </div>
      {grabbed && (
        <div className="grab-overlay" aria-label="TokenClaw intercepted the execution">
          <i className="prong prong-top" /><i className="prong prong-mid" /><i className="prong prong-bottom" />
          <strong>TOKENCLAW</strong><span>GRAB</span>
        </div>
      )}
      <div className={`flow-node model-node ${grabbed ? 'intercepted' : ''}`}>
        <span>ADVANCED MODEL</span><strong>{scenario.total.toLocaleString()} executions</strong><b>{grabbed ? 'INTERCEPTED' : money(scenario.baselineCost)}</b>
      </div>
      <div className="baseline-ledger">
        <div><span>Verified reuse</span><b>0%</b></div>
        <div><span>Deterministic work</span><b>0%</b></div>
        <div><span>Projected spend</span><b>{money(scenario.baselineCost)}</b></div>
      </div>
    </div>
  )
}

function PullFlow({ scenario, onRoute }: { scenario: Scenario; onRoute: (route: Route) => void }) {
  return (
    <div className="pull-flow">
      <div className="pull-origin"><span>INTERCEPTED PLAN</span><strong>{scenario.total.toLocaleString()} work units</strong></div>
      <div className="claw-hub"><ClawMark /><div><strong>PULL</strong><span>Cheapest safe route first</span></div></div>
      <div className="route-fan">
        {scenario.routes.map((route) => (
          <button key={route.id} className={`route-node route-${route.color}`} onClick={() => onRoute(route)}>
            <span>{route.shortLabel}</span><strong>{route.count.toLocaleString()}</strong><small>{scenario.unit}</small><b>{money(route.cost)}</b>
          </button>
        ))}
      </div>
      <div className="pull-rule">ONLY UNCERTAINTY CLIMBS TO EXPENSIVE REASONING</div>
    </div>
  )
}

function ExecutionFlow({
  scenario,
  progress,
  stage,
  decision,
  onRoute,
}: {
  scenario: Scenario
  progress: number
  stage: DemoStage
  decision: Decision
  onRoute: (route: Route) => void
}) {
  const showGate = ['HOLD', 'OUTCOME', 'CAPACITY', 'LEARN'].includes(stage)
  return (
    <div className="execution-flow">
      <div className="lane-grid">
        {scenario.routes.map((route, index) => {
          const laneProgress = progress >= 100
            ? 100
            : Math.min(100, Math.max(0, progress - index * 4))
          const completedCount = Math.round(route.count * (laneProgress / 100))
          return (
            <button className={`execution-lane lane-${route.color}`} key={route.id} onClick={() => onRoute(route)}>
              <div className="lane-head"><span>{route.shortLabel}</span><b>{completedCount.toLocaleString()} / {route.count.toLocaleString()}</b></div>
              <div className="lane-track">
                <i style={{ width: `${laneProgress}%` }} />
                {[0, 1, 2, 3, 4, 5].map((dot) => <em key={dot} style={{ left: `${8 + dot * 17}%`, opacity: laneProgress > dot * 18 ? 1 : 0.16 }} />)}
              </div>
              <div className="lane-foot"><span>{laneProgress >= 100 ? 'COMPLETE' : `${Math.round(laneProgress)}%`}</span><strong>{money(route.cost * (laneProgress / 100))}</strong></div>
            </button>
          )
        })}
      </div>
      {showGate && (
        <div className={`policy-gate ${decision !== 'pending' ? `decision-${decision}` : ''}`}>
          <div className="gate-claw"><ClawMark /></div>
          <div>
            <span>{decision === 'pending' ? 'TOKENCLAW HOLD' : 'HUMAN DECISION RECORDED'}</span>
            <strong>{scenario.blockedAction}</strong>
            <small>{decision === 'pending' ? `Blocked by ${scenario.policy}` : `${decision.toUpperCase()} under ${scenario.policy}`}</small>
          </div>
          <b>{decision === 'pending' ? 'BLOCKED' : decision.toUpperCase()}</b>
        </div>
      )}
      {stage === 'OUTCOME' && <OutcomeStamp scenario={scenario} />}
      {stage === 'CAPACITY' && <CapacityVisual scenario={scenario} />}
      {stage === 'LEARN' && <LearnVisual scenario={scenario} />}
    </div>
  )
}

function ExecutionLadder({ stageIndex, scenario, onRoute }: { stageIndex: number; scenario: Scenario; onRoute: (route: Route) => void }) {
  const mappedRoutes: Array<Route | null> = [null, scenario.routes[0], scenario.routes[1], null, null, scenario.routes[2], scenario.routes[3], null]
  return (
    <div className="ladder">
      <div className="ladder-axis"><span>LOWEST AI DEPENDENCY</span><i /><span>HIGHEST AI DEPENDENCY</span></div>
      <div className="ladder-rows">
        {ladderRows.map(([label, status, reason], index) => {
          const route = mappedRoutes[index]
          return (
            <button
              key={label}
              className={`ladder-row ${stageIndex >= 3 ? 'evaluated' : ''} status-${status.toLowerCase().replaceAll(' ', '-')}`}
              style={{ animationDelay: `${index * 90}ms` }}
              onClick={() => route && onRoute(route)}
            >
              <span className="rung-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="rung-copy"><strong>{label}</strong><small>{reason}</small></span>
              {route && <b>{route.count.toLocaleString()}</b>}<em>{status}</em>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ActiveControl({
  stage,
  scenario,
  decision,
  costPerOutcome,
  onReview,
  onAdvance,
}: {
  stage: DemoStage
  scenario: Scenario
  decision: Decision
  costPerOutcome: number
  onReview: () => void
  onAdvance: () => void
}) {
  if (stage === 'HOLD') return (
    <>
      <div className="control-icon danger-icon">!</div>
      <div><span>ACTION BLOCKED</span><strong>{scenario.blockedAction}</strong><small>Human approval required by {scenario.policy}</small></div>
      <button className="danger-button" onClick={onReview}>Review decision</button>
    </>
  )
  if (stage === 'OUTCOME') return (
    <>
      <div className="control-icon success-icon">✓</div>
      <div><span>OUTCOME VERIFIED</span><strong>{scenario.verified.toLocaleString()} verified outcomes</strong><small>{scenario.quality}% simulated quality · {money(costPerOutcome)} each</small></div>
      <button className="quiet-button" onClick={onAdvance}>View capacity</button>
    </>
  )
  if (stage === 'CAPACITY') return (
    <>
      <div className="control-icon claw-icon">+</div>
      <div><span>RECOVERED CAPACITY</span><strong>{scenario.additionalCapacity}</strong><small>{money(scenario.baselineCost - scenario.actualCost)} returned to productive work</small></div>
      <button className="quiet-button" onClick={onAdvance}>Analyze pattern</button>
    </>
  )
  if (stage === 'LEARN') return (
    <>
      <div className="control-icon success-icon">↻</div>
      <div><span>CAPABILITY CANDIDATE</span><strong>{scenario.learn.capability}</strong><small>{scenario.learn.coverage}% projected deterministic coverage</small></div>
      <span className="candidate-state">PROPOSED</span>
    </>
  )
  return (
    <>
      <div className="control-icon neutral-icon">◎</div>
      <div><span>CURRENT CONTROL</span><strong>{stageCallout(stage, scenario.total)}</strong><small>{decision === 'pending' ? 'Deterministic demo state' : `Decision: ${decision}`}</small></div>
      <span className="control-state">{stage}</span>
    </>
  )
}

function NarrationBar({
  visible,
  speaking,
  caption,
  beat,
}: {
  visible: boolean
  speaking: boolean
  caption: string
  beat: NarrationBeat
}) {
  if (!visible || !caption) return null
  return (
    <div className={`narration-bar ${speaking ? 'speaking' : 'settled'}`} aria-live="polite">
      <div className="narration-meta">
        <span className="narration-wave" aria-hidden="true"><i /><i /><i /><i /></span>
        <b>{beat === 'HOLD_DECISION' ? 'HOLD · DECISION' : beat}</b>
      </div>
      <p>{caption}</p>
    </div>
  )
}

function DemoController({
  stageIndex,
  autoplay,
  disabled,
  narrationOn,
  narrationSupported,
  onNarration,
  onBack,
  onAutoplay,
  onStage,
  onAdvance,
  onReset,
}: {
  stageIndex: number
  autoplay: boolean
  disabled: boolean
  narrationOn: boolean
  narrationSupported: boolean
  onNarration: () => void
  onBack: () => void
  onAutoplay: () => void
  onStage: (index: number) => void
  onAdvance: () => void
  onReset: () => void
}) {
  return (
    <div className="demo-controller" aria-label="Demo controls">
      <button onClick={onBack} disabled={stageIndex === 0}>Back</button>
      <button className={autoplay ? 'active' : ''} onClick={onAutoplay}>{autoplay ? 'Pause demo' : 'Run full demo'}</button>
      <button
        className={`narration-toggle ${narrationOn && narrationSupported ? 'active' : ''}`}
        onClick={onNarration}
        disabled={!narrationSupported}
        aria-pressed={narrationOn && narrationSupported}
        title={narrationSupported ? 'Toggle spoken narration' : 'Speech synthesis unavailable in this browser'}
      >
        <SpeakerIcon muted={!narrationOn || !narrationSupported} />
        {narrationSupported ? (narrationOn ? 'Narration on' : 'Narration off') : 'No speech'}
      </button>
      <div className="stage-pips">
        {demoStages.map((item, index) => (
          <button key={item} className={index === stageIndex ? 'current' : index < stageIndex ? 'complete' : ''} onClick={() => onStage(index)} aria-label={`Go to ${item}`} />
        ))}
      </div>
      <button onClick={onAdvance} disabled={disabled || stageIndex === demoStages.length - 1}>Advance</button>
      <button onClick={onReset}>Reset</button>
    </div>
  )
}

function ApprovalDialog({
  scenario,
  automated,
  onClose,
  onDecision,
}: {
  scenario: Scenario
  automated: boolean
  onClose: () => void
  onDecision: (decision: Exclude<Decision, 'pending'>) => void
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="approval-dialog" role="dialog" aria-modal="true" aria-labelledby="approval-title">
        <div className="dialog-topline" />
        <header>
          <div><span>HUMAN CONTROL POINT</span><h2 id="approval-title">Review governed action</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close approval dialog">×</button>
        </header>
        <div className="approval-action">
          <span>REQUESTED ACTION</span><strong>{scenario.blockedAction}</strong>
          <p>The agent cannot cross this boundary until an authorized human records a decision.</p>
        </div>
        {automated && (
          <div className="auto-decision-banner">
            <i />
            PRESENTATION MODE · SIMULATED HUMAN APPROVAL WILL BE RECORDED
          </div>
        )}
        <div className="approval-grid">
          <Metric label="Affected records" value={scenario.humanDecisions.toString()} />
          <Metric label="Confidence" value={`${scenario.quality}%`} />
          <Metric label="Cost impact" value="$0.00" />
          <Metric label="Policy" value={scenario.policy} />
        </div>
        <div className="approval-evidence">
          <span>EVIDENCE PACKAGE</span>
          <div><i>✓</i> Case-level rationale and source evidence</div>
          <div><i>✓</i> Spend Warrant remains within budget</div>
          <div><i>✓</i> No undeclared tool or model requested</div>
        </div>
        <footer>
          <button className="deny-button" onClick={() => onDecision('denied')}>Deny & send to follow-up</button>
          <button className="approve-button" onClick={() => onDecision('approved')}>Approve governed action</button>
        </footer>
      </section>
    </div>
  )
}

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <header><div><span>INSPECTOR</span><h2>{title}</h2></div><button onClick={onClose} aria-label="Close inspector">×</button></header>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  )
}

function EvidenceDetails({ route, scenario }: { route: Route; scenario: Scenario }) {
  return (
    <div className="detail-stack">
      <DetailBlock label="Decision" value={`${route.count.toLocaleString()} ${scenario.unit} assigned`} />
      <DetailBlock label="Route" value={route.label} /><DetailBlock label="Reason" value={route.reason} />
      <DetailBlock label="Evidence" value={route.evidence} /><DetailBlock label="Quality" value={route.quality} />
      <DetailBlock label="Execution cost" value={money(route.cost)} /><DetailBlock label="Policy" value={`${scenario.policy} · ALLOWED`} />
    </div>
  )
}

function WarrantDetails({ scenario }: { scenario: Scenario }) {
  return (
    <div className="detail-stack">
      <DetailBlock label="Requested outcome" value={scenario.outcome} /><DetailBlock label="Owner" value={scenario.owner} />
      <DetailBlock label="Maximum spend" value={money(scenario.budget)} /><DetailBlock label="Quality floor" value={`${scenario.qualityFloor}%`} />
      <DetailBlock label="Permitted route" value="Reuse -> Capability -> Small -> Advanced" />
      <DetailBlock label="Permitted tools" value="Case reader, resolution engine, outcome verifier" />
      <DetailBlock label="Advanced limit" value={`${scenario.routes[3].count} ${scenario.unit}`} />
      <DetailBlock label="Stop conditions" value="Budget exhausted, quality below floor, evidence missing" />
      <DetailBlock label="Policy version" value={scenario.policy} /><DetailBlock label="Request checksum" value="sha256: 6f9c...d018" />
    </div>
  )
}

function ConnectedServices() {
  const services = [
    ['Azure API Management', 'Gateway enforcement, attribution, quotas'],
    ['TokenClaw engines', 'Warrant, route, policy, settlement'],
    ['Azure AI Search', 'Verified outcomes and capability discovery'],
    ['Microsoft Foundry', 'Bounded model and agent execution'],
    ['Azure Monitor', 'Execution evidence and operational signals'],
    ['Microsoft Fabric', 'Business outcome settlement'],
    ['Microsoft Purview', 'Classification and governance context'],
  ]
  return (
    <div className="services-map">
      <p>Production mapping is inspectable but intentionally outside the core demonstration.</p>
      {services.map(([service, role], index) => (
        <div className="service-node" key={service}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{service}</strong><small>{role}</small></div></div>
      ))}
    </div>
  )
}

function OutcomeStamp({ scenario }: { scenario: Scenario }) {
  return (
    <div className="outcome-stamp">
      <span>OUTCOME VERIFIED</span><strong>{scenario.verified.toLocaleString()}</strong><small>{scenario.outcome}</small>
      <div><b>{scenario.quality}%</b> SIMULATED QUALITY</div>
    </div>
  )
}

function CapacityVisual({ scenario }: { scenario: Scenario }) {
  return (
    <div className="capacity-visual">
      <span>PROJECTED EQUIVALENT CAPACITY</span><strong>{scenario.additionalCapacity}</strong>
      <div className="batch-row">{[0, 1, 2, 3, 4, 5].map((item) => <i key={item} style={{ animationDelay: `${item * 80}ms` }} />)}</div>
      <small>Funded by {money(scenario.baselineCost - scenario.actualCost)} intercepted spend</small>
    </div>
  )
}

function LearnVisual({ scenario }: { scenario: Scenario }) {
  return (
    <div className="learn-visual">
      <div className="pattern-steps">
        {Array.from({ length: scenario.learn.stableSteps }).map((_, index) => <i key={index} />)}
        {Array.from({ length: scenario.learn.modelSteps }).map((_, index) => <i className="model-step" key={`m-${index}`} />)}
      </div>
      <div className="learn-arrow">BECOMES</div>
      <div className="capability-tile">
        <span>CAPABILITY CANDIDATE</span><strong>{scenario.learn.capability}</strong>
        <div><b>{scenario.learn.coverage}%</b><small>projected deterministic</small></div>
        <em>PROPOSED · NOT YET CERTIFIED</em>
      </div>
    </div>
  )
}

function WarrantRow({ label, value, emphasis, alert }: { label: string; value: string; emphasis?: boolean; alert?: boolean }) {
  return <div className={`warrant-row ${emphasis ? 'emphasis' : ''} ${alert ? 'alert' : ''}`}><span>{label}</span><strong>{value}</strong></div>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return <section className="detail-block"><span>{label}</span><p>{value}</p></section>
}

function ClawMark() {
  return (
    <svg className="claw-mark" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 5v12c0 7 5 12 12 12h7" /><path d="M40 5v12c0 7-5 12-12 12h-7" />
      <path d="M24 5v38" /><path d="m18 36 6 7 6-7" />
    </svg>
  )
}

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" /></svg>
}

function NetworkIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="18" r="2.5" /><circle cx="19" cy="18" r="2.5" /><path d="m10.7 7.2-4.3 8M13.3 7.2l4.3 8M7.5 18h9" /></svg>
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg className="speaker-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
      {muted ? (
        <path d="m16 9.5 5 5m0-5-5 5" />
      ) : (
        <>
          <path d="M15.5 9a4 4 0 0 1 0 6" />
          <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
        </>
      )}
    </svg>
  )
}

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value)
}

function stageTitle(stage: DemoStage) {
  const titles: Record<DemoStage, string> = {
    REQUEST: 'Request entering the economic gateway',
    BASELINE: 'Ordinary agent execution plan',
    GRAB: 'Intercepting expensive execution',
    PULL: 'Redistributing to the cheapest safe path',
    WARRANT: 'Authorized execution route',
    EXECUTE: 'Governed execution in progress',
    HOLD: 'External action held at policy boundary',
    OUTCOME: 'Execution settled against business evidence',
    CAPACITY: 'Recovered budget returned to useful work',
    LEARN: 'Repeated success becomes reusable capability',
  }
  return titles[stage]
}

function stageCallout(stage: DemoStage, total: number) {
  const callouts: Record<DemoStage, string> = {
    REQUEST: 'BUSINESS INTENT RECEIVED',
    BASELINE: `${total.toLocaleString()} EXPENSIVE EXECUTIONS PROPOSED`,
    GRAB: 'EXPENSIVE EXECUTION INTERCEPTED',
    PULL: 'ROUTE COMPRESSION COMPLETE',
    WARRANT: 'ECONOMIC BOUNDARIES READY',
    EXECUTE: 'AUTHORIZED WORK IN MOTION',
    HOLD: 'UNAUTHORIZED ACTION BLOCKED',
    OUTCOME: 'VALUE INDEPENDENTLY VERIFIED',
    CAPACITY: 'SAVED CAPACITY REINVESTED',
    LEARN: 'NEXT EQUIVALENT RUN GETS CHEAPER',
  }
  return callouts[stage]
}

function stageDescription(stage: DemoStage, scenario: Scenario) {
  const descriptions: Record<DemoStage, string> = {
    REQUEST: 'TokenClaw is the persistent gateway between intent and execution.',
    BASELINE: `Without intervention, every ${scenario.unit} item would use advanced reasoning.`,
    GRAB: 'No model spend has occurred.',
    PULL: 'Verified reuse and deterministic capability absorb stable work.',
    WARRANT: `Execution cannot exceed ${money(scenario.budget)} or fall below ${scenario.qualityFloor}% quality.`,
    EXECUTE: 'Every route reports progress, evidence, cost, and quality.',
    HOLD: 'The agent cannot cross a material action boundary on its own.',
    OUTCOME: 'Technical completion and business value are separate states.',
    CAPACITY: 'Avoided spend is translated into additional business throughput.',
    LEARN: 'Stable steps are proposed for certification, never silently activated.',
  }
  return descriptions[stage]
}

function phaseClass(phase: string, stageIndex: number) {
  const thresholds: Record<string, number> = { GRAB: 2, PULL: 3, HOLD: 6, LEARN: 9 }
  const threshold = thresholds[phase]
  return stageIndex === threshold ? 'active' : stageIndex > threshold ? 'complete' : ''
}

function drawerTitle(drawer: DrawerType) {
  return drawer === 'evidence' ? 'Route evidence' : drawer === 'services' ? 'Connected services' : 'Spend Warrant'
}

export default App
