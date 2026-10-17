const demoUrl = `${import.meta.env.BASE_URL}demo`;

const capabilities = [
  {
    number: "01",
    title: "Route and trip coordination",
    description: "Explore separate route, trip, bus, tracker, and assignment records in a fictional campus transport workflow.",
  },
  {
    number: "02",
    title: "Bus location and arrival estimates",
    description: "See simulated vehicle movement on a route map with clearly labelled prototype arrival estimates.",
  },
  {
    number: "03",
    title: "Role-based demo workspaces",
    description: "Preview student, driver, and campus-team screens using sample data. These workspaces are not production accounts.",
  },
  {
    number: "04",
    title: "RFID attendance workflow preview",
    description: "Review fictional attendance events and the proposed device-event flow without connecting to real readers or buses.",
  },
];

export function PublicLandingPage() {
  return (
    <main className="public-home">
      <header className="public-home__header">
        <a className="public-home__brand" href={import.meta.env.BASE_URL} aria-label="Wayfinder Mobility home">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} width="38" height="38" alt="" />
          <span>Wayfinder <strong>Mobility</strong></span>
        </a>
        <a className="public-home__header-link" href={demoUrl}>Explore the demo <span aria-hidden="true">↗</span></a>
      </header>

      <section className="public-home__hero" aria-labelledby="public-home-title">
        <div className="public-home__hero-copy">
          <p className="public-home__eyebrow">INSTITUTIONAL MOBILITY · PROTOTYPE</p>
          <h1 id="public-home-title">A clearer view of campus journeys.</h1>
          <p className="public-home__intro">
            Wayfinder Mobility is a demonstration of how campus transport teams and riders
            could coordinate routes, trips, vehicles, and arrival information in one place.
          </p>
          <div className="public-home__actions">
            <a className="public-home__primary" href={demoUrl}>Explore the demo <span aria-hidden="true">→</span></a>
            <span className="public-home__action-note">No account required · fictional sample data</span>
          </div>
        </div>
        <div className="public-home__journey" aria-label="Illustration of a campus bus route">
          <div className="public-home__journey-top"><span>DEMO ROUTE</span><span>SIMULATED</span></div>
          <div className="public-home__journey-map" aria-hidden="true">
            <svg viewBox="0 0 460 260" role="presentation">
              <path className="public-home__route-shadow" d="M74 202C94 156 132 170 154 126S209 75 236 117s50 72 78 23 47-80 83-65" />
              <path className="public-home__route-line" d="M74 202C94 156 132 170 154 126S209 75 236 117s50 72 78 23 47-80 83-65" />
              <circle className="public-home__route-stop" cx="74" cy="202" r="9" />
              <circle className="public-home__route-stop" cx="154" cy="126" r="9" />
              <circle className="public-home__route-stop" cx="236" cy="117" r="9" />
              <circle className="public-home__route-stop" cx="314" cy="140" r="9" />
              <circle className="public-home__route-stop public-home__route-stop--campus" cx="397" cy="75" r="11" />
              <g className="public-home__bus-icon" transform="translate(215 50)">
                <rect x="0" y="0" width="43" height="38" rx="12" />
                <path d="M9 22h25M12 11h19a4 4 0 0 1 4 4v7H8v-7a4 4 0 0 1 4-4ZM12 27v3m19-3v3" />
                <circle cx="14" cy="21" r="1" /><circle cx="29" cy="21" r="1" />
              </g>
            </svg>
          </div>
          <div className="public-home__journey-footer">
            <span><i className="public-home__legend-dot" /> Sample route</span>
            <span>Illustrative map data</span>
          </div>
        </div>
      </section>

      <section className="public-home__capabilities" aria-labelledby="public-home-capabilities">
        <div className="public-home__section-heading">
          <p className="public-home__eyebrow">WHAT THE PROTOTYPE SHOWS</p>
          <h2 id="public-home-capabilities">Mobility workflows, made easier to explore.</h2>
        </div>
        <div className="public-home__capability-grid">
          {capabilities.map((capability) => (
            <article className="public-home__capability" key={capability.number}>
              <span>{capability.number}</span>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-home__notice" aria-label="Prototype limitations">
        <span className="public-home__notice-mark" aria-hidden="true">i</span>
        <p>
          <strong>Prototype preview, not a live transport service.</strong> Locations,
          schedules, attendance, and profiles shown in the demo are fictional or simulated.
          It is not connected to live vehicle GPS, RFID readers, LoRa devices, or institutional
          identity systems. Do not enter personal or sensitive information.
        </p>
      </section>

      <footer className="public-home__footer">
        <span>Wayfinder Mobility · Institutional mobility prototype</span>
        <a href={demoUrl}>Open the demo</a>
      </footer>
    </main>
  );
}
