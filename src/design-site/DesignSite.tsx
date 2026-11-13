import { Download, Type } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import logoUrl from "../assets/logo-160.png";
import { ControlDeck } from "../components/ControlDeck";
import { KeyHint } from "../components/KeyHint";
import { NametrisMark } from "../components/NametrisMark";
import { nameRuleMessage } from "../features/onboarding/nameValidation";
import { RewardCard } from "../features/reward/RewardCard";
import { ResultStencil } from "../features/reward/ResultStencil";
import { formatActiveTime } from "../game/runtime/clock";
import type { PieceType } from "../game/model/types";
import "../styles/cabinet.css";
import "../styles/gameplay.css";
import "../styles/globals.css";
import "../styles/onboarding.css";
import "../styles/reward.css";
import {
  breakpoints,
  catalogNav,
  colorGroups,
  depthSteps,
  layoutMeasures,
  markSwatches,
  motionSteps,
  pieceSwatches,
  radii,
  sampleLoss,
  sampleResult,
  spaceSteps,
  stateSwatches,
  tokenValue,
  type Swatch,
  type TokenName,
} from "./catalog";
import "./design-site.css";

const sectionIds = catalogNav.flatMap((group) => group.items.map(([id]) => id));

const stencilStates = [
  { status: "void", label: "Void" },
  { status: "open", label: "Open" },
  { status: "filled", label: "Filled", piece: "T" },
  { status: "preview-valid", label: "Will stay", piece: "O" },
  { status: "preview-lost", label: "Will not stay", piece: "Z" },
] as const satisfies readonly {
  readonly status: string;
  readonly label: string;
  readonly piece?: PieceType;
}[];

export function DesignSite() {
  const current = useCurrentSection(sectionIds);

  return (
    <div className="ds">
      <a className="ds-skip" href="#materials">
        Skip to foundations
      </a>
      <header className="ds-masthead">
        <div>
          <div className="ds-brand">
            <NametrisMark />
            <p className="ds-kicker">Nametris</p>
          </div>
          <h1>Design system</h1>
          <p>
            Warm ivory cabinet, signal red CRT. Foundations, components, and patterns
            use the tokens the game ships with.
          </p>
        </div>
        <a className="ds-play-link" href={import.meta.env.BASE_URL}>
          Play the game
        </a>
      </header>
      <div className="ds-layout">
        <nav className="ds-nav" aria-label="Design system">
          {catalogNav.map((group) => (
            <div className="ds-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={current === id ? "true" : undefined}
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <main>
          <Materials />
          <Color />
          <Pieces />
          <TypeSection />
          <Space />
          <Shape />
          <Motion />
          <Focus />
          <Buttons />
          <Fields />
          <Keys />
          <Metrics />
          <Boards />
          <Help />
          <Reward />
          <Mark />
          <Welcome />
          <Play />
          <Result />
          <Voice />
          <footer className="ds-footer">
            <p>Values live in tokens.css. This catalog reads the approved contract.</p>
            <a href={import.meta.env.BASE_URL}>Play the game</a>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Materials() {
  return (
    <Section
      id="materials"
      kicker="Foundations"
      title="Materials"
      lede="A control belongs to one material. The room is the stage, the shell is ivory plastic, the bezel is metal, and the glass emits phosphor."
    >
      <div className="ds-grid">
        <article className="ds-panel ds-stage-sample">
          <h3>Stage</h3>
          <p>The page behind the machine. A warm glow sits at the top.</p>
          <TokenNameLine token="color-stage" />
        </article>
        <article className="ds-panel ds-cabinet-sample">
          <h3>Cabinet</h3>
          <p>SCORE</p>
          <TokenNameLine token="color-ivory-400" />
        </article>
        <article className="ds-material-screen">
          <div className="cabinet-bezel ds-bezel-sample">
            <div className="cabinet-screen">
              <div className="crt-rgb" />
              <div className="crt-scanlines" />
              <div className="crt-vignette" />
              <div className="cabinet-screen-content ds-screen-copy">
                <div>
                  <h3>Bezel and CRT</h3>
                  <strong>MAYA</strong>
                </div>
              </div>
            </div>
          </div>
        </article>
        <article className="ds-panel">
          <h3>Phosphor</h3>
          <p>Red labels, amber warns, route blue sends a piece to the name.</p>
          <div className="ds-phosphor-row" aria-hidden="true">
            <span
              style={{
                background: "var(--color-phosphor)",
                color: "var(--color-phosphor)",
              }}
            />
            <span
              style={{ background: "var(--color-amber)", color: "var(--color-amber)" }}
            />
            <span
              style={{ background: "var(--color-route)", color: "var(--color-route)" }}
            />
          </div>
        </article>
      </div>
    </Section>
  );
}

function Color() {
  return (
    <Section
      id="color"
      kicker="Foundations"
      title="Color"
      lede="Phosphor, signal, and button red are different jobs. Chips show the live token. The value underneath is the approved contract."
    >
      {colorGroups.map((group) => (
        <div className="ds-group" key={group.id}>
          <h3 className="ds-group-title">{group.title}</h3>
          <p className="ds-note">{group.note}</p>
          <SwatchGrid swatches={group.swatches} />
        </div>
      ))}
      <div className="ds-group">
        <h3 className="ds-group-title">States</h3>
        <p className="ds-note">
          Open stencil, ghost, and grid lines are translucent. The checker shows
          through.
        </p>
        <SwatchGrid swatches={stateSwatches} />
      </div>
      <p className="ds-note">
        Retired names stay in the contract so old CSS does not invent a new hue. Violet
        is not the T piece. Lime is gold, not the S piece.
      </p>
    </Section>
  );
}

function Pieces() {
  return (
    <Section
      id="pieces"
      kicker="Foundations"
      title="Pieces"
      lede="Board and export use the same seven fills. Shape carries the piece. T and J are graphic fills, so small text stays on ivory, amber, or phosphor."
    >
      <div className="ds-pieces">
        {pieceSwatches.map((piece) => (
          <article className="ds-piece" key={piece.type}>
            <PieceShape
              columns={piece.columns}
              rows={piece.rows}
              filled={piece.filled}
              piece={piece.type}
            />
            <div>
              <h3>{piece.type}</h3>
              <TokenNameLine token={piece.token} />
            </div>
          </article>
        ))}
        <article className="ds-piece">
          <span className="board-cell is-ghost ds-ghost-cell" />
          <div>
            <h3>Ghost</h3>
            <TokenNameLine token="color-ghost" />
          </div>
        </article>
      </div>
      <div className="ds-group">
        <h3 className="ds-group-title">Mark quartet</h3>
        <p className="ds-note">
          The logo blocks are a separate set from the falling pieces.
        </p>
        <SwatchGrid swatches={markSwatches} />
      </div>
    </Section>
  );
}

function TypeSection() {
  return (
    <Section
      id="type"
      kicker="Foundations"
      title="Type"
      lede="PP NeueBit is the display face for the name, the title, and the one primary action. Space Mono is every label, metric, and sentence. There is no third family."
    >
      <p className="ds-type-display type-gold">NAMETRIS</p>
      <div className="ds-type-row">
        <article className="ds-panel">
          <h3>Display</h3>
          <p className="ds-name-sample">MAYA</p>
          <TokenNameLine token="font-display" />
        </article>
        <article className="ds-panel">
          <h3>UI label</h3>
          <p className="ds-label-sample">
            Score
            <strong>12,840</strong>
          </p>
          <TokenNameLine token="font-ui" />
        </article>
        <article className="ds-panel">
          <h3>Supporting copy</h3>
          <p>Clear a full row to earn a name piece. You can hold up to three.</p>
          <TokenNameLine token="color-muted" />
        </article>
      </div>
    </Section>
  );
}

function Space() {
  const widest = 48;
  return (
    <Section
      id="space"
      kicker="Foundations"
      title="Space"
      lede="Spacing, the cabinet measures, and the breakpoints the stylesheets repeat as literals. A media query cannot read a custom property."
    >
      <ul className="ds-scale">
        {spaceSteps.map((token) => {
          const px = Number.parseInt(tokenValue(token), 10);
          return (
            <li key={token}>
              <span>{token}</span>
              <span
                className="ds-scale-bar"
                style={{ width: `${(px / widest) * 100}%` }}
              />
              <span>{tokenValue(token)}</span>
            </li>
          );
        })}
      </ul>
      <div className="ds-measure-row">
        {layoutMeasures.map(([token, role]) => (
          <article className="ds-panel" key={token}>
            <h3>{role}</h3>
            <TokenNameLine token={token} />
          </article>
        ))}
        {breakpoints.map(([token, role]) => (
          <article className="ds-panel" key={token}>
            <h3>{role}</h3>
            <TokenNameLine token={token} />
          </article>
        ))}
      </div>
    </Section>
  );
}

function Shape() {
  return (
    <Section
      id="shape"
      kicker="Foundations"
      title="Shape"
      lede="Radius follows the object. Cells stay nearly square. Buttons and the name field share one radius. The glass uses the bezel radius."
    >
      <div className="ds-radius-row">
        {radii.map(([token, role]) => (
          <article className="ds-panel" key={token}>
            <h3>{role}</h3>
            <div
              className="ds-radius-box"
              style={{ borderRadius: `var(--${token})` }}
            />
            <TokenNameLine token={token} />
          </article>
        ))}
      </div>
      <div className="ds-depth" aria-hidden="true">
        {(["z-crt", "z-dialog", "z-modal"] as const).map((token, index) => (
          <div
            className="ds-depth-card"
            key={token}
            style={{
              zIndex: `var(--${token})`,
              transform: `translate(${index * 28}px, ${index * 36}px)`,
            }}
          >
            {token} · {tokenValue(token)}
          </div>
        ))}
      </div>
      <ul className="ds-depth-list">
        {depthSteps.map(([token, role]) => (
          <li key={token}>
            <span>{token}</span>
            <span>{tokenValue(token)}</span>
            <span>{role}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Motion() {
  const [run, setRun] = useState(0);
  const longest = 1800;

  return (
    <Section
      id="motion"
      kicker="Foundations"
      title="Motion"
      lede="Durations are short and tied to a cause. Replay runs every bar for its own token. Reduced motion keeps the length and drops the travel."
    >
      <button
        type="button"
        className="ds-text-button"
        onClick={() => setRun((value) => value + 1)}
      >
        Replay motion
      </button>
      <ul className="ds-motion" key={run}>
        {motionSteps.map(([token, role]) => {
          const ms = Number.parseInt(tokenValue(token), 10);
          return (
            <li key={token}>
              <span>{role}</span>
              <span className="ds-motion-track">
                <span
                  className="ds-motion-bar"
                  style={
                    {
                      "--ds-duration": `var(--${token})`,
                      "--ds-share": `${(ms / longest) * 100}%`,
                    } as CSSProperties
                  }
                />
              </span>
              <span>{tokenValue(token)}</span>
              <span>{token}</span>
            </li>
          );
        })}
      </ul>
      <div className="ds-measure-row">
        <article className="ds-panel">
          <h3>Reward tilt</h3>
          <p>
            Stiffness {tokenValue("spring-tilt-stiffness")}, damping{" "}
            {tokenValue("spring-tilt-damping")}, max {tokenValue("spring-tilt-degrees")}
            °. The board does not idle-animate.
          </p>
        </article>
        <article className="ds-panel">
          <h3>Eases</h3>
          <p>
            Press {tokenValue("ease-press")}. Out {tokenValue("ease-out")}. In{" "}
            {tokenValue("ease-in")}. Linear {tokenValue("ease-linear")}.
          </p>
        </article>
      </div>
    </Section>
  );
}

function Focus() {
  return (
    <Section
      id="focus"
      kicker="Foundations"
      title="Focus"
      lede="CRT controls use amber. The welcome field uses ivory. Cabinet keys use ink. The rings below are always visible. Tab to the live controls for the real focus style."
    >
      <div className="ds-focus-row">
        <span className="ds-ring ds-ring-crt">CRT amber</span>
        <span className="ds-ring ds-ring-welcome">Welcome ivory</span>
        <span className="ds-ring ds-ring-cabinet">Cabinet ink</span>
      </div>
      <div className="ds-focus-row">
        <button type="button" className="secondary-button">
          CRT control
        </button>
        <form className="welcome-form" onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="focus-name">
            Welcome field
          </label>
          <input id="focus-name" defaultValue="MAYA" readOnly />
        </form>
        <button type="button" className="cabinet-key" aria-label="Cabinet key">
          <span className="cabinet-key-legend">X</span>
        </button>
      </div>
      <p className="ds-note">
        Ring width {tokenValue("focus-width")} on the CRT,{" "}
        {tokenValue("focus-width-field")} on the playfield. Welcome start uses the tight
        offset, {tokenValue("focus-offset-tight")}.
      </p>
    </Section>
  );
}

function Buttons() {
  return (
    <Section
      id="buttons"
      kicker="Components"
      title="Buttons"
      lede="One primary action. In-play disabled fades to gray. The welcome start button uses the framed face, and its disabled state keeps the cabinet colors."
    >
      <div className="ds-specimens">
        <Specimen title="Primary">
          <div className="ds-button-well">
            <button type="button" className="primary-button">
              Play again
            </button>
            <button type="button" className="primary-button ds-pressed">
              Pressed
            </button>
            <button type="button" className="primary-button" disabled>
              Finish
            </button>
          </div>
        </Specimen>
        <Specimen title="Welcome start">
          <div className="welcome-start-frame">
            <button type="button" className="primary-button">
              <span className="face" aria-hidden="true" />
              <span className="label">Start building</span>
            </button>
          </div>
          <div className="welcome-start-frame">
            <button type="button" className="primary-button" disabled>
              <span className="face" aria-hidden="true" />
              <span className="label">Start building</span>
            </button>
          </div>
        </Specimen>
        <Specimen title="Secondary and route">
          <button type="button" className="secondary-button">
            <Type aria-hidden="true" />
            Try another name
          </button>
          <button type="button" className="route-button">
            SEND · SHIFT
          </button>
          <button type="button" className="route-button" disabled>
            PAST THE SEND LINE
          </button>
        </Specimen>
      </div>
    </Section>
  );
}

function Fields() {
  return (
    <Section
      id="field"
      kicker="Components"
      title="Name field"
      lede="The field sits on the CRT. An invalid name keeps the letters and marks the underline in phosphor. The error names the rule."
    >
      <div className="ds-specimens">
        <Specimen title="Ready">
          <form
            className="welcome-form ds-field-well"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="catalog-name">Your name</label>
            <input id="catalog-name" defaultValue="MAYA" readOnly />
            <p className="field-help">2–10 letters · A–Z only</p>
          </form>
        </Specimen>
        <Specimen title="Invalid">
          <form
            className="welcome-form ds-field-well"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="catalog-name-invalid">Your name</label>
            <input
              id="catalog-name-invalid"
              defaultValue="MA"
              readOnly
              aria-invalid="true"
              aria-describedby="catalog-name-error"
            />
            <p className="field-error" id="catalog-name-error" role="alert">
              <span aria-hidden="true" /> {nameRuleMessage}
            </p>
          </form>
        </Specimen>
      </div>
    </Section>
  );
}

function Keys() {
  return (
    <Section
      id="keys"
      kicker="Components"
      title="Keys"
      lede="Cabinet keys are plastic controls. Hints in the help dialog are the smaller CRT key. Shift-ready outlines the send key in amber."
    >
      <div className="ds-key-row">
        <KeyHint>X</KeyHint>
        <KeyHint wide>SPACE</KeyHint>
        <button type="button" className="cabinet-key" aria-label="Rotate clockwise">
          <span className="cabinet-key-legend">X</span>
        </button>
        <button
          type="button"
          className="cabinet-key is-wide"
          disabled
          aria-label="Hard drop"
        >
          <span className="cabinet-key-legend">SPACE</span>
        </button>
        <button
          type="button"
          className="cabinet-key is-shift-ready"
          aria-label="Send, ready"
        >
          <span className="cabinet-key-legend">SHIFT</span>
        </button>
      </div>
      <div className="ds-deck">
        <ControlDeck />
      </div>
    </Section>
  );
}

function Metrics() {
  return (
    <Section
      id="metrics"
      kicker="Components"
      title="Metrics"
      lede="A metric is a quiet pair: an uppercase label and one value. The strip holds the numbers that are not the name."
    >
      <div className="metric-strip" style={{ maxWidth: 420 }}>
        <div className="metric">
          <span>Score</span>
          <strong>12,840</strong>
        </div>
        <div className="metric">
          <span>Lines</span>
          <strong>14</strong>
        </div>
        <div className="metric">
          <span>Level</span>
          <strong>2</strong>
        </div>
        <div className="metric">
          <span>Name</span>
          <strong>75%</strong>
        </div>
      </div>
    </Section>
  );
}

function Boards() {
  return (
    <Section
      id="boards"
      kicker="Components"
      title="Boards"
      lede="The playfield is a framed well. The route line is the only blue on the board. Stencil legality uses a hatch, not another red."
    >
      <div className="ds-specimens">
        <MiniBoard />
        <div className="ds-stencil-row">
          {stencilStates.map((state) => (
            <div className="ds-slot" key={state.status}>
              <span
                className="stencil-cell"
                data-status={state.status}
                data-piece={"piece" in state ? state.piece : undefined}
              />
              <span>{state.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Help() {
  return (
    <Section
      id="dialog"
      kicker="Components"
      title="Help"
      lede="Help is a CRT dialog over the playfield. This specimen is the same markup, kept in the page so it does not take focus on its own."
    >
      <div className="ds-help">
        <section className="help-dialog" aria-label="Help specimen">
          <p className="panel-kicker">QUICK REFERENCE</p>
          <h2>How to play Nametris</h2>
          <p className="help-intro">
            Clear a full row to earn a name piece. You can hold up to three. Press Shift
            to send one onto your name while it is still above the send line.
          </p>
          <div className="help-columns">
            <section className="help-section">
              <h3>Tetris board</h3>
              <dl className="help-controls">
                <div>
                  <dt className="help-keys">
                    <KeyHint>←</KeyHint>
                    <KeyHint>→</KeyHint>
                  </dt>
                  <dd>Move left or right</dd>
                </div>
                <div>
                  <dt className="help-keys">
                    <KeyHint wide>SPACE</KeyHint>
                  </dt>
                  <dd>Hard drop</dd>
                </div>
              </dl>
            </section>
            <section className="help-section">
              <h3>Your name</h3>
              <dl className="help-controls">
                <div>
                  <dt className="help-keys">
                    <KeyHint wide>SHIFT</KeyHint>
                  </dt>
                  <dd>Send a name piece before the send line</dd>
                </div>
                <div>
                  <dt className="help-keys">
                    <KeyHint wide>ENTER</KeyHint>
                  </dt>
                  <dd>Lock; parts outside the outline are lost</dd>
                </div>
              </dl>
            </section>
          </div>
          <button type="button" className="primary-button help-resume">
            Resume game
          </button>
        </section>
      </div>
    </Section>
  );
}

function Reward() {
  return (
    <Section
      id="reward"
      kicker="Components"
      title="Reward card"
      lede="The card is the trophy. Pointer movement tilts it. Reduced motion leaves it still. Actions sit outside the card."
    >
      <div className="ds-pattern ds-result">
        <div className="result-crt-screen">
          <div className="result-shell">
            <RewardCard result={sampleResult} />
          </div>
        </div>
      </div>
    </Section>
  );
}

function Mark() {
  return (
    <Section
      id="mark"
      kicker="Components"
      title="Mark"
      lede="The four-block mark is the product sign. The welcome logo is the same blocks as a picture, with a blue glow that belongs only to that image."
    >
      <div className="ds-mark-row">
        <NametrisMark />
        <NametrisMark compact />
        <img className="ds-logo" src={logoUrl} alt="" width={80} height={80} />
      </div>
      <p className="ds-note">Mark glow {tokenValue("color-mark-glow")}</p>
    </Section>
  );
}

function Welcome() {
  return (
    <Section
      id="welcome"
      kicker="Patterns"
      title="Welcome"
      lede="Centered on the glass: mark, gold wordmark, premise, name, one start button. The cabinet around it is the real bezel."
    >
      <CrtFrame label="Welcome pattern" className="ds-welcome">
        <main className="welcome-screen">
          <section className="welcome-layout">
            <div className="welcome-brand-mark">
              <img src={logoUrl} alt="" width={80} height={80} />
            </div>
            <h1>NAMETRIS</h1>
            <p className="welcome-tagline">
              CLEAR LINES. <span>BUILD YOUR NAME!</span>
            </p>
            <form className="welcome-form" onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="welcome-pattern-name">Your name</label>
              <input id="welcome-pattern-name" defaultValue="MAYA" readOnly />
              <p className="field-help">2–10 letters · A–Z only</p>
              <p className="field-help">Your name stays on this device.</p>
              <div className="welcome-start-frame">
                <button type="submit" className="primary-button">
                  <span className="face" aria-hidden="true" />
                  <span className="label">Start building</span>
                </button>
              </div>
            </form>
          </section>
        </main>
      </CrtFrame>
    </Section>
  );
}

function Play() {
  return (
    <Section
      id="play"
      kicker="Patterns"
      title="Play"
      lede="The board, the route line, the name, and the numbers share one glass. Route blue is the send affordance. The primary action waits until a row is cleared."
    >
      <CrtFrame label="Play pattern">
        <div className="ds-play">
          <MiniBoard />
          <div className="ds-play-side">
            <div className="ds-stencil-row">
              {["M", "A", "Y", "A"].map((letter, index) => (
                <div className="ds-slot" key={`${letter}-${index}`}>
                  <span
                    className="stencil-cell"
                    data-status={index < 3 ? "filled" : "open"}
                    data-piece={index < 3 ? "T" : undefined}
                  />
                  <span>{letter}</span>
                </div>
              ))}
            </div>
            <div className="metric-strip">
              <div className="metric">
                <span>Score</span>
                <strong>12,840</strong>
              </div>
              <div className="metric">
                <span>Name</span>
                <strong>75%</strong>
              </div>
            </div>
            <p className="empty-send-notice">No name pieces yet. Clear a row first.</p>
            <button type="button" className="route-button">
              Clear a row first
            </button>
          </div>
        </div>
      </CrtFrame>
    </Section>
  );
}

function Result() {
  return (
    <Section
      id="result"
      kicker="Patterns"
      title="Result"
      lede="A win names the player, then the card, then the actions. A loss keeps the same shell, states how far the name got, and offers the same two next steps."
    >
      <div className="ds-pattern ds-result">
        <div className="result-crt-screen">
          <div className="result-shell">
            <p className="win-plaque">{sampleResult.name}</p>
            <div className="result-heading">
              <h1>YOU BUILT IT.</h1>
            </div>
            <RewardCard result={sampleResult} />
            <div className="result-actions">
              <button type="button" className="primary-button">
                Play again
              </button>
              <button type="button" className="secondary-button">
                <Type aria-hidden="true" />
                Try another name
              </button>
              <button type="button" className="secondary-button">
                <Download aria-hidden="true" />
                Download card
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="ds-pattern ds-result">
        <div className="result-crt-screen">
          <div className="result-shell">
            <article className="loss-card">
              <h1>STACK OVERFLOW</h1>
              <p className="loss-name">{sampleLoss.name}</p>
              <p className="loss-message">
                The stack reached the top before you claimed the name. Your name still
                reached:
              </p>
              <strong className="loss-progress">{sampleLoss.displayPercent}%</strong>
              <ResultStencil
                name={sampleLoss.name}
                displayPercent={sampleLoss.displayPercent}
                stencil={sampleLoss.stencil}
                className="loss-stencil"
              />
              <dl className="loss-metrics">
                <div>
                  <dt>Score</dt>
                  <dd>{sampleLoss.score.toLocaleString()}</dd>
                </div>
                <div>
                  <dt>Active time</dt>
                  <dd>{formatActiveTime(sampleLoss.activeMilliseconds)}</dd>
                </div>
                <div>
                  <dt>Lines</dt>
                  <dd>{sampleLoss.linesCleared}</dd>
                </div>
                <div>
                  <dt>Level</dt>
                  <dd>{sampleLoss.level}</dd>
                </div>
              </dl>
              <div className="loss-actions">
                <button type="button" className="primary-button">
                  Play again
                </button>
                <button type="button" className="secondary-button">
                  <Type aria-hidden="true" />
                  Try another name
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Voice() {
  return (
    <Section
      id="voice"
      kicker="Patterns"
      title="Voice"
      lede="One primary action per screen. Labels are short. Errors say what to fix. The privacy line stays exact."
    >
      <div className="ds-voice">
        <blockquote>Start building</blockquote>
        <blockquote>Play again</blockquote>
        <blockquote>2–10 letters · A–Z only</blockquote>
        <blockquote>{nameRuleMessage}</blockquote>
        <blockquote>Your name stays on this device.</blockquote>
      </div>
    </Section>
  );
}

function Section({
  id,
  kicker,
  title,
  lede,
  children,
}: {
  readonly id: string;
  readonly kicker: string;
  readonly title: string;
  readonly lede: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="ds-section" id={id} aria-labelledby={`${id}-title`}>
      <header className="ds-section-head">
        <p className="ds-kicker">{kicker}</p>
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{lede}</p>
      </header>
      {children}
    </section>
  );
}

function Specimen({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <article className="ds-specimen">
      <h3>{title}</h3>
      {children}
    </article>
  );
}

function TokenNameLine({ token }: { readonly token: TokenName }) {
  return (
    <code className="ds-token">
      {token}
      <br />
      {tokenValue(token)}
    </code>
  );
}

function SwatchGrid({ swatches }: { readonly swatches: readonly Swatch[] }) {
  return (
    <div className="ds-swatches">
      {swatches.map((swatch) => (
        <article className="ds-swatch" key={swatch.token}>
          <div
            className="ds-chip"
            style={{ "--ds-swatch": `var(--${swatch.token})` } as CSSProperties}
          />
          <h3>{swatch.role}</h3>
          <code className="ds-token">
            {swatch.token}
            <br />
            {tokenValue(swatch.token)}
          </code>
        </article>
      ))}
    </div>
  );
}

function PieceShape({
  columns,
  rows,
  filled,
  piece,
}: {
  readonly columns: number;
  readonly rows: number;
  readonly filled: readonly number[];
  readonly piece: PieceType;
}) {
  const cells = Array.from({ length: columns * rows }, (_, index) => index);
  return (
    <div
      className="ds-piece-shape"
      style={{ gridTemplateColumns: `repeat(${columns}, 18px)` }}
      aria-hidden="true"
    >
      {cells.map((index) => (
        <span
          key={index}
          className={filled.includes(index) ? "board-cell" : undefined}
          data-piece={filled.includes(index) ? piece : undefined}
          data-empty={filled.includes(index) ? undefined : "true"}
        />
      ))}
    </div>
  );
}

function MiniBoard() {
  const ghosts = new Set([2, 3, 12, 13]);
  const filled = new Map<number, PieceType>([
    [51, "L"],
    [61, "L"],
    [71, "L"],
    [72, "L"],
    [75, "O"],
    [76, "O"],
    [65, "O"],
    [66, "O"],
  ]);

  return (
    <div
      className="board-frame ds-board"
      style={{ "--route-zone-end": "calc(var(--cell) * 2 + 5px)" } as CSSProperties}
    >
      <div className="ds-mini-grid">
        {Array.from({ length: 80 }, (_, index) => {
          const piece = filled.get(index);
          return (
            <span
              key={index}
              className={ghosts.has(index) ? "board-cell is-ghost" : "board-cell"}
              data-piece={piece}
            />
          );
        })}
      </div>
      <div className="transfer-route-deadline">
        <small>SEND</small>
      </div>
    </div>
  );
}

function CrtFrame({
  children,
  className = "",
  label,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly label: string;
}) {
  return (
    <div className={`ds-pattern ds-machine ${className}`}>
      <div className="cabinet-bezel ds-bezel-sample">
        <div className="cabinet-screen" role="region" aria-label={label}>
          <div className="crt-rgb" />
          <div className="crt-scanlines" />
          <div className="crt-vignette" />
          <div className="cabinet-screen-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

function useCurrentSection(ids: readonly string[]) {
  const [current, setCurrent] = useState(ids[0] ?? "");

  useEffect(() => {
    const readingLine = 128;

    function updateCurrent() {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;
      const next = nearBottom
        ? (ids[ids.length - 1] ?? "")
        : ids.reduce((selected, id) => {
            const node = document.getElementById(id);
            return node !== null && node.getBoundingClientRect().top <= readingLine
              ? id
              : selected;
          }, ids[0] ?? "");
      setCurrent((previous) => (previous === next ? previous : next));
    }

    updateCurrent();
    window.addEventListener("scroll", updateCurrent, { passive: true });
    window.addEventListener("hashchange", updateCurrent);
    return () => {
      window.removeEventListener("scroll", updateCurrent);
      window.removeEventListener("hashchange", updateCurrent);
    };
  }, [ids]);

  return current;
}
