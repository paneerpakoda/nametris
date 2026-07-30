export function App() {
  return (
    <main className="welcome-shell">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <p className="eyebrow">A TWO-BOARD BLOCK GAME</p>
        <h1 id="welcome-title">NAMETRIS</h1>
        <p className="premise">
          Clear lines on one board. Route earned pieces to build your name on the other.
        </p>
        <div className="name-preview" aria-label="Default name: HARSH">
          HARSH
        </div>
        <p className="privacy-note">
          <span aria-hidden="true">◆</span> Your name stays on this device.
        </p>
        <button type="button" className="primary-button">
          Start building
        </button>
      </section>
    </main>
  );
}
