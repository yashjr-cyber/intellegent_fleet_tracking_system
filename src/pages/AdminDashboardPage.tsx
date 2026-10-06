import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CampusMap } from "../components/CampusMap";
import { DashboardLayout } from "../components/DashboardLayout";
import { Icon } from "../components/Icons";
import { demoArrivalPredictionService } from "../services/demoArrivalPredictionService";
import { demoFleetService } from "../services/demoFleetService";
import { getSimulatedBusPositions } from "../services/simulatedTrackingService";
import { useFleetSnapshot } from "../services/useFleetSnapshot";
import type {
  FleetSnapshot,
  IntegrationEvent,
  LoRaHealthPayload,
  RfidTapPayload,
  TripDirection,
} from "../types/models";

type AdminSection = "overview" | "fleet" | "buses" | "routes" | "trips" | "drivers" | "attendance" | "analytics" | "lora";

function localDateInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const sectionTitles: Record<AdminSection, string> = {
  overview: "Campus overview",
  fleet: "Fleet map",
  buses: "Buses & trackers",
  routes: "Routes & stops",
  trips: "Trips & assignments",
  drivers: "Drivers",
  attendance: "Attendance",
  analytics: "Analytics",
  lora: "LoRa network",
};

function eventEnvelope<T>(eventType: string, deviceId: string, payload: T): IntegrationEvent<T> {
  const eventId = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    eventId,
    eventType,
    schemaVersion: 1,
    timestamp: new Date().toISOString(),
    source: { kind: "device", deviceId, adapter: "demo-rfid-bridge" },
    idempotencyKey: eventId,
    payload,
  };
}

function Panel({ title, eyebrow, children, className = "" }: { title: string; eyebrow: string; children: ReactNode; className?: string }) {
  return <article className={`glass-panel feature-card ${className}`}><div className="card-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div></div>{children}</article>;
}

function FleetMapPanel({ snapshot }: { snapshot: FleetSnapshot }) {
  const [now, setNow] = useState(Date.now());
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const startedAt = useRef(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => window.clearInterval(timer);
  }, []);
  const positions = useMemo(() => getSimulatedBusPositions(snapshot, now, startedAt.current), [snapshot, now]);
  const details = useMemo(() => {
    const result = new Map();
    const busIds = new Set<string>();
    for (const position of positions) {
      if (busIds.has(position.busId)) continue;
      busIds.add(position.busId);
      const assignment = snapshot.tripAssignments.find((item) => item.tripId === position.tripId);
      const trip = snapshot.trips.find((item) => item.id === position.tripId);
      const route = snapshot.routes.find((item) => item.id === position.routeId);
      const bus = snapshot.buses.find((item) => item.id === position.busId);
      if (!assignment || !trip || !route || !bus) continue;
      result.set(bus.id, {
        busLabel: bus.label,
        route,
        trip,
        position,
        prediction: demoArrivalPredictionService.predict({
          latitude: position.latitude,
          longitude: position.longitude,
          destination: position.nextStop,
          stopsRemaining: 1,
          historicalMinutesPerStop: [4, 5, 4],
          currentTime: new Date(now),
          isWeekday: new Date(now).getDay() % 6 !== 0,
          traffic: position.traffic,
        }),
      });
    }
    return result;
  }, [positions, snapshot, now]);
  const uniqueBusIds = new Set<string>();
  const mapPositions = positions.filter((position) => {
    if (uniqueBusIds.has(position.busId)) return false;
    uniqueBusIds.add(position.busId);
    return true;
  });
  const selected = mapPositions.find((position) => position.busId === selectedBusId);
  const selectedDetails = selected ? details.get(selected.busId) : null;
  const assignedStop = snapshot.stops[0];
  if (!assignedStop) return <div className="student-empty-state"><h3>No campus stops</h3><p>Add route stops before viewing fleet positions.</p></div>;
  return <>
    <div className="student-map-layout admin-map-layout">
      <div className="student-map"><CampusMap routes={snapshot.routes} positions={mapPositions} selectedBusId={selectedBusId} stops={snapshot.stops} assignedStop={assignedStop} detailsByBusId={details} onSelectBus={setSelectedBusId} /></div>
      <aside className="student-map-details">
        {selectedDetails ? <>
          <div className="student-map-details__top"><span className={`freshness-badge freshness-badge--${selectedDetails.position.status.toLowerCase()}`}>{selectedDetails.position.status}</span><span>SIMULATED</span></div>
          <p className="eyebrow">{selectedDetails.trip.id}</p><h3>{selectedDetails.busLabel}</h3><p className="student-map-details__registration">{selectedDetails.route.name} · {selectedDetails.route.code}</p>
          <dl className="student-map-details__list"><div><dt>Next stop</dt><dd>{selectedDetails.position.nextStop.name}</dd></div><div><dt>Illustrative ETA</dt><dd>{selectedDetails.prediction.minutes} min · {selectedDetails.prediction.range.earliestMinutes}–{selectedDetails.prediction.range.latestMinutes} min</dd></div><div><dt>Last update</dt><dd>{selectedDetails.position.recordedAt.toLocaleTimeString()}</dd></div></dl>
        </> : <div className="student-empty-state"><h3>Select a bus</h3><p>Choose a marker to inspect its active trip, next stop and telemetry freshness.</p></div>}
      </aside>
    </div>
    <div className="student-map-legend"><span>Vehicle markers are simulated</span><span>{positions.length} moving demo position{positions.length === 1 ? "" : "s"}</span><span className="student-map-legend__disclaimer">Stale and offline locations are not presented as live.</span></div>
  </>;
}

function Overview({ snapshot, navigate }: { snapshot: FleetSnapshot; navigate: ReturnType<typeof useNavigate> }) {
  const activeTrips = snapshot.trips.filter((trip) => trip.status === "in_progress").length;
  const activeBuses = snapshot.buses.filter((bus) => bus.status === "active").length;
  const activeTrackers = snapshot.trackers.filter((tracker) => tracker.status === "active").length;
  return <>
    <section className="stats-grid" aria-label="Campus mobility summary">
      {[
        { label: "Active routes", value: snapshot.routes.filter((item) => item.status === "active").length, note: "Ordered campus stops", icon: "map" as const, tone: "mint" },
        { label: "Available buses", value: activeBuses, note: `${snapshot.buses.length} vehicles in the fleet`, icon: "bus" as const, tone: "blue" },
        { label: "Trips in progress", value: activeTrips, note: `${snapshot.trips.filter((trip) => trip.status === "scheduled").length} scheduled`, icon: "clock" as const, tone: "violet" },
      ].map((item) => <article className="stat-card glass-panel" key={item.label}><div className="stat-card__top"><span>{item.label}</span><span className={`stat-icon stat-icon--${item.tone}`}><Icon name={item.icon} size={18} /></span></div><strong className="stat-card__value">{item.value}</strong><span className="stat-card__note">{item.note}</span></article>)}
    </section>
    <section className="dashboard-grid admin-summary-grid">
      <Panel title="Fleet movement" eyebrow="SIMULATED CAMPUS VIEW"><FleetMapPanel snapshot={snapshot} /></Panel>
      <Panel title="Operational readiness" eyebrow="AT A GLANCE">
        <div className="admin-readiness-list"><p><span>Trackers reporting</span><strong>{activeTrackers} / {snapshot.trackers.length}</strong></p><p><span>Drivers active</span><strong>{snapshot.drivers.filter((item) => item.status === "active").length} / {snapshot.drivers.length}</strong></p><p><span>LoRa gateways connected</span><strong>{snapshot.loraGateways.filter((item) => item.backendConnected && item.status === "active").length}</strong></p><p><span>Attendance events</span><strong>{snapshot.attendanceEvents.length}</strong></p></div>
        <div className="admin-quick-links">{(["trips", "buses", "attendance", "lora"] as const).map((section) => <button className="soft-button" key={section} onClick={() => navigate(`/admin/${section}`)}>{sectionTitles[section]} <Icon name="arrow" size={14} /></button>)}</div>
      </Panel>
    </section>
  </>;
}

function BusManagement({ snapshot, act }: { snapshot: FleetSnapshot; act: (callback: () => Promise<unknown>) => void }) {
  return <Panel title="Vehicle and tracker registry" eyebrow="FLEET ASSETS">
    {snapshot.buses.length === 0 ? <div className="student-empty-state"><h3>No buses registered</h3><p>Fleet vehicles will appear here when added.</p></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Bus</th><th>Registration</th><th>Tracker</th><th>Tracker state</th><th>Vehicle state</th></tr></thead><tbody>{snapshot.buses.map((bus) => {
      const tracker = snapshot.trackers.find((item) => item.busId === bus.id);
      return <tr key={bus.id}><td><strong>{bus.label}</strong><small>{bus.capacity} seats</small></td><td>{bus.registration}</td><td>{tracker?.serialNumber ?? "Unassigned"}</td><td>{tracker ? <select aria-label={`${tracker.serialNumber} status`} value={tracker.status} onChange={(event) => act(() => demoFleetService.updateTrackerStatus(tracker.id, event.target.value as typeof tracker.status))}><option value="active">Active</option><option value="inactive">Offline</option><option value="maintenance">Maintenance</option></select> : "—"}</td><td><select aria-label={`${bus.label} status`} value={bus.status} onChange={(event) => act(() => demoFleetService.updateBusStatus(bus.id, event.target.value as typeof bus.status))}><option value="active">Active</option><option value="idle">Idle</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></select></td></tr>;
    })}</tbody></table></div>}
    <p className="subtle-copy">Tracker or vehicle state changes are shared with student and driver views. Active trips must be paused or ended before taking their bus or tracker offline.</p>
  </Panel>;
}

function RouteManagement({ snapshot, act }: { snapshot: FleetSnapshot; act: (callback: () => Promise<unknown>) => void }) {
  const [routeName, setRouteName] = useState("");
  const [routeCode, setRouteCode] = useState("");
  const [stopIds, setStopIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (stopIds.length < 2) { setFormError("Select at least two stops, in route order."); return; }
    act(async () => {
      await demoFleetService.createRoute({ name: routeName.trim(), code: routeCode.trim().toUpperCase(), stopIds, estimatedDurationMinutes: 30, status: "active" });
      setRouteName(""); setRouteCode(""); setStopIds([]);
    });
  }
  function move(routeId: string, current: string[], from: number, offset: number) {
    const to = from + offset;
    if (to < 0 || to >= current.length) return;
    const reordered = [...current]; [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
    act(() => demoFleetService.updateRoute(routeId, { stopIds: reordered }));
  }
  return <section className="admin-management-grid">
    <Panel title="Ordered routes" eyebrow="ROUTE EDITOR">
      {snapshot.routes.map((route) => <div className="admin-route-row" key={route.id}><div className="admin-route-row__head"><span><strong>{route.name}</strong><small>{route.code} · {route.estimatedDurationMinutes} min</small></span><span className="schedule-tag">{route.status}</span></div><ol>{route.stopIds.map((stopId, index) => { const stop = snapshot.stops.find((item) => item.id === stopId); return <li key={stopId}><span>{index + 1}. {stop?.name ?? "Unknown stop"}</span><span><button className="icon-button" aria-label={`Move ${stop?.name} earlier`} disabled={index === 0} onClick={() => move(route.id, route.stopIds, index, -1)}>↑</button><button className="icon-button" aria-label={`Move ${stop?.name} later`} disabled={index === route.stopIds.length - 1} onClick={() => move(route.id, route.stopIds, index, 1)}>↓</button></span></li>; })}</ol></div>)}
      {snapshot.routes.length === 0 && <p className="subtle-copy">No routes have been created.</p>}
    </Panel>
    <Panel title="Create a route" eyebrow="NEW ROUTE">
      <form className="admin-form" onSubmit={submit}><label>Route name<input required value={routeName} onChange={(event) => setRouteName(event.target.value)} placeholder="East campus loop" /></label><label>Route code<input required value={routeCode} onChange={(event) => setRouteCode(event.target.value)} placeholder="E-03" /></label><fieldset className="admin-stop-picker"><legend>Select stops in route order</legend>{snapshot.stops.map((stop) => { const selected = stopIds.includes(stop.id); return <button type="button" key={stop.id} className={`stop-picker-item${selected ? " stop-picker-item--selected" : ""}`} onClick={() => setStopIds((current) => selected ? current.filter((id) => id !== stop.id) : [...current, stop.id])}><span>{selected ? `${stopIds.indexOf(stop.id) + 1}. ` : ""}{stop.name}</span><span>{selected ? "Remove" : "Add"}</span></button>; })}</fieldset>{formError && <p className="form-error" role="alert">{formError}</p>}<button className="primary-button" disabled={!routeName.trim() || !routeCode.trim()}>Create route</button></form>
    </Panel>
  </section>;
}

function TripManagement({ snapshot, act }: { snapshot: FleetSnapshot; act: (callback: () => Promise<unknown>) => void }) {
  const [routeId, setRouteId] = useState(snapshot.routes[0]?.id ?? "");
  const [date, setDate] = useState(localDateInput(new Date()));
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("10:30");
  const [direction, setDirection] = useState<TripDirection>("outbound");
  const [tripId, setTripId] = useState("");
  const [busId, setBusId] = useState("");
  const [trackerId, setTrackerId] = useState("");
  const [driverId, setDriverId] = useState("");
  const scheduled = snapshot.trips.filter((trip) => trip.status === "scheduled");
  const assignedIds = new Set(snapshot.tripAssignments.map((item) => item.tripId));
  return <section className="admin-management-grid">
    <Panel title="Create a dated trip" eyebrow="SCHEDULE">
      <form className="admin-form" onSubmit={(event) => { event.preventDefault(); act(() => demoFleetService.createTrip({ routeId, scheduledDate: date, scheduledStart: start, scheduledEnd: end, status: "scheduled", direction })); }}>
        <label>Route<select required value={routeId} onChange={(event) => setRouteId(event.target.value)}>{snapshot.routes.map((route) => <option key={route.id} value={route.id}>{route.name} · {route.code}</option>)}</select></label><label>Service date<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} /></label><div className="admin-form__inline"><label>Departure<input type="time" required value={start} onChange={(event) => setStart(event.target.value)} /></label><label>Scheduled end<input type="time" required value={end} onChange={(event) => setEnd(event.target.value)} /></label></div><label>Direction<select value={direction} onChange={(event) => setDirection(event.target.value as TripDirection)}><option value="outbound">Campus bound</option><option value="homebound">Homebound</option></select></label><button className="primary-button" disabled={!routeId}>Create trip</button>
      </form>
    </Panel>
    <Panel title="Assign or reassign resources" eyebrow="TRIP ASSIGNMENT">
      <form className="admin-form" onSubmit={(event) => { event.preventDefault(); act(() => demoFleetService.assignTrip({ tripId, busId, trackerId, driverId })); }}>
        <label>Scheduled trip<select required value={tripId} onChange={(event) => setTripId(event.target.value)}><option value="">Choose a trip</option>{scheduled.map((trip) => <option key={trip.id} value={trip.id}>{snapshot.routes.find((route) => route.id === trip.routeId)?.name ?? "Route"} · {trip.scheduledDate ?? "today"} · {trip.scheduledStart} {assignedIds.has(trip.id) ? "(reassign)" : "(unassigned)"}</option>)}</select></label>
        <label>Available bus<select required value={busId} onChange={(event) => setBusId(event.target.value)}><option value="">Choose a bus</option>{snapshot.buses.filter((bus) => bus.status === "active").map((bus) => <option key={bus.id} value={bus.id}>{bus.label} · {bus.registration}</option>)}</select></label>
        <label>Tracker<select required value={trackerId} onChange={(event) => setTrackerId(event.target.value)}><option value="">Choose a tracker</option>{snapshot.trackers.filter((tracker) => tracker.status === "active").map((tracker) => <option key={tracker.id} value={tracker.id}>{tracker.serialNumber}</option>)}</select></label>
        <label>Driver<select required value={driverId} onChange={(event) => setDriverId(event.target.value)}><option value="">Choose a driver</option>{snapshot.drivers.filter((driver) => driver.status === "active").map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}</select></label>
        <button className="primary-button" disabled={!tripId || !busId || !trackerId || !driverId}>Save assignment</button>
      </form>
      <p className="subtle-copy">Route, trip, bus and tracker remain separate records. Reassignment changes the trip assignment only; the route is unchanged. Overlapping bus schedules and active resource conflicts are rejected.</p>
    </Panel>
    <Panel title="Upcoming and active trips" eyebrow="TRIP REGISTER" className="admin-full-width">
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Trip</th><th>Route</th><th>Direction</th><th>Schedule</th><th>Assignment</th><th>Status</th></tr></thead><tbody>{snapshot.trips.filter((trip) => trip.status !== "completed").map((trip) => { const route = snapshot.routes.find((item) => item.id === trip.routeId); const assignment = snapshot.tripAssignments.find((item) => item.tripId === trip.id); const bus = snapshot.buses.find((item) => item.id === assignment?.busId); const overnight = trip.scheduledEnd < trip.scheduledStart; return <tr key={trip.id}><td><strong>{trip.id}</strong></td><td>{route?.name ?? "Unknown route"}</td><td>{trip.direction ?? "—"}</td><td>{trip.scheduledDate ?? "Today"} · {trip.scheduledStart}–{trip.scheduledEnd}{overnight ? " (+1 day)" : ""}</td><td>{bus ? `${bus.label} · ${snapshot.drivers.find((item) => item.id === assignment?.driverId)?.name}` : "Unassigned"}</td><td><span className="schedule-tag">{trip.status.replace("_", " ")}</span></td></tr>; })}</tbody></table></div>
    </Panel>
  </section>;
}

function Drivers({ snapshot }: { snapshot: FleetSnapshot }) {
  return <Panel title="Driver directory" eyebrow="PEOPLE">
    {snapshot.drivers.length === 0 ? <div className="student-empty-state"><h3>No drivers found</h3><p>Driver profiles will appear here when provisioned.</p></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Driver</th><th>Contact</th><th>Today's assignment</th><th>Status</th></tr></thead><tbody>{snapshot.drivers.map((driver) => { const assignment = snapshot.tripAssignments.find((item) => item.driverId === driver.id && snapshot.trips.find((trip) => trip.id === item.tripId)?.status !== "completed"); const trip = snapshot.trips.find((item) => item.id === assignment?.tripId); const route = snapshot.routes.find((item) => item.id === trip?.routeId); return <tr key={driver.id}><td><strong>{driver.name}</strong></td><td>{driver.email}<small>{driver.phone}</small></td><td>{route ? `${route.name} · ${trip?.scheduledStart}` : "No active assignment"}</td><td><span className="schedule-tag">{driver.status}</span></td></tr>; })}</tbody></table></div>}
  </Panel>;
}

function Attendance({ snapshot, act }: { snapshot: FleetSnapshot; act: (callback: () => Promise<unknown>) => void }) {
  const [routeId, setRouteId] = useState("all");
  const filtered = snapshot.attendanceEvents.filter((event) => routeId === "all" || snapshot.trips.find((trip) => trip.id === event.tripId)?.routeId === routeId).sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  const demoTap = () => {
    const trip = snapshot.trips.find((item) => item.status === "in_progress") ?? snapshot.trips.find((item) => item.status === "scheduled");
    const assignment = snapshot.tripAssignments.find((item) => item.tripId === trip?.id);
    const route = snapshot.routes.find((item) => item.id === trip?.routeId);
    const node = snapshot.loraNodes.find((item) => item.status === "active" && item.readerId);
    const card = snapshot.rfidCards.find((item) => item.status === "active");
    const stop = route?.stopIds.map((id) => snapshot.stops.find((item) => item.id === id)).find(Boolean);
    if (!trip || !assignment || !node?.readerId || !card || !stop) return;
    const payload: RfidTapPayload = { cardNumber: card.cardNumber, readerId: node.readerId, tripId: trip.id, stopId: stop.id, eventType: "boarded" };
    act(async () => { await demoFleetService.recordRfidTap(eventEnvelope("rfid.tap.v1", node.deviceId ?? node.id, payload)); });
  };
  return <Panel title="RFID check-in ledger" eyebrow="ATTENDANCE EVENTS">
    <div className="admin-toolbar"><label>Filter by route<select value={routeId} onChange={(event) => setRouteId(event.target.value)}><option value="all">All routes</option>{snapshot.routes.map((route) => <option key={route.id} value={route.id}>{route.name}</option>)}</select></label><button className="soft-button" onClick={demoTap}>Simulate RFID tap</button></div>
    {filtered.length === 0 ? <div className="student-empty-state"><h3>No attendance events</h3><p>Simulated or device-accepted RFID taps appear here.</p></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Student</th><th>Trip / route</th><th>Stop</th><th>RFID event time</th><th>Reader</th><th>Source</th></tr></thead><tbody>{filtered.map((event) => { const student = snapshot.students.find((item) => item.id === event.studentId); const trip = snapshot.trips.find((item) => item.id === event.tripId); const route = snapshot.routes.find((item) => item.id === trip?.routeId); const stop = snapshot.stops.find((item) => item.id === event.stopId); return <tr key={event.id}><td><strong>{student?.name ?? "Unknown card"}</strong><small>{student?.studentNumber}</small></td><td>{route?.name ?? "Unknown route"}<small>{event.tripId}</small></td><td>{stop?.name ?? "Unknown stop"}</td><td>{new Date(event.occurredAt).toLocaleString()}</td><td>{event.readerId ?? "—"}</td><td>{event.source ?? "simulated"}</td></tr>; })}</tbody></table></div>}
    <h3 className="admin-subheading">Device ingestion audit</h3><div className="admin-audit-list">{snapshot.ingestionAudit.slice(0, 8).map((item) => <p key={item.id}><span className={`audit-state audit-state--${item.status}`}>{item.status}</span><strong>{item.eventType}</strong><small>{item.message} · {item.sourceDeviceId}</small></p>)}</div>
    <p className="subtle-copy">Attendance is derived from recorded RFID events; no student-facing edit is provided. Device taps are validated and idempotent in this demo service.</p>
  </Panel>;
}

function Analytics({ snapshot }: { snapshot: FleetSnapshot }) {
  const counts = snapshot.routes.map((route) => ({ route, count: snapshot.attendanceEvents.filter((event) => snapshot.trips.find((trip) => trip.id === event.tripId)?.routeId === route.id).length }));
  const maximum = Math.max(1, ...counts.map((item) => item.count));
  return <section className="admin-management-grid">
    <Panel title="Recorded attendance by route" eyebrow="DEMO ACTIVITY"><div className="admin-chart">{counts.map(({ route, count }) => <div className="admin-chart__row" key={route.id}><span>{route.name}</span><div className="admin-chart__track"><i style={{ width: `${Math.max(count > 0 ? 8 : 0, count / maximum * 100)}%` }} /></div><strong>{count}</strong></div>)}</div><p className="subtle-copy">Counts are derived from the fictional RFID event ledger. This prototype has no predictive or population-scale analytics.</p></Panel>
    <Panel title="Service summary" eyebrow="CURRENT DEMO SNAPSHOT"><div className="admin-readiness-list"><p><span>Routes configured</span><strong>{snapshot.routes.length}</strong></p><p><span>Trips completed</span><strong>{snapshot.trips.filter((trip) => trip.status === "completed").length}</strong></p><p><span>Attendance events</span><strong>{snapshot.attendanceEvents.length}</strong></p><p><span>Open incidents</span><strong>{snapshot.driverIncidents.length}</strong></p><p><span>Accepted / rejected device events</span><strong>{snapshot.ingestionAudit.filter((event) => event.status === "accepted").length} / {snapshot.ingestionAudit.filter((event) => event.status === "rejected").length}</strong></p></div></Panel>
  </section>;
}

function LoraTopology({ snapshot, act }: { snapshot: FleetSnapshot; act: (callback: () => Promise<unknown>) => void }) {
  const nodeById = new Map(snapshot.loraNodes.map((node) => [node.id, node]));
  const simulateHealth = (nodeId: string) => {
    const node = nodeById.get(nodeId);
    const gateway = snapshot.loraGateways.find((item) => item.id === node?.gatewayId);
    if (!node || !gateway) return;
    const payload: LoRaHealthPayload = { nodeId, gatewayId: gateway.id, status: "active", batteryPercent: node.batteryPercent ?? 80, rssiDbm: node.rssiDbm ?? -70, snrDb: node.snrDb ?? 5 };
    const event = eventEnvelope("lora.health.v1", node.deviceId ?? node.id, payload);
    act(() => demoFleetService.recordLoraHealth(event));
  };
  return <>
    <section className="admin-management-grid">
      {snapshot.loraGateways.length === 0 ? <Panel title="Gateway unavailable" eyebrow="NETWORK"><div className="student-empty-state"><h3>No LoRa gateways configured</h3><p>Add a gateway integration before associating nodes.</p></div></Panel> : snapshot.loraGateways.map((item) => <Panel key={item.id} title={item.name} eyebrow="LORA GATEWAY"><div className="lora-gateway"><span className={`freshness-badge freshness-badge--${item.status === "active" && item.backendConnected ? "live" : "offline"}`}>{item.status === "active" && item.backendConnected ? "CONNECTED" : "OFFLINE"}</span><p><span>Gateway ID</span><strong>{item.id}</strong></p><p><span>Backend uplink</span><strong>{item.backendConnected ? "Available (simulated)" : "Disconnected"}</strong></p><p><span>Last heartbeat</span><strong>{new Date(item.lastSeenAt).toLocaleTimeString()}</strong></p><button className="soft-button" onClick={() => act(() => demoFleetService.updateGatewayStatus(item.id, item.status === "active" ? "inactive" : "active"))}>{item.status === "active" ? "Simulate gateway offline" : "Restore demo gateway"}</button></div></Panel>)}
      <Panel title="Multi-hop topology" eyebrow="SIMULATED RADIO LINKS" className="admin-full-width">
        {snapshot.loraNodes.length === 0 ? <div className="student-empty-state"><h3>No network nodes</h3><p>Reader and relay nodes will appear when provisioned.</p></div> : <div className="lora-topology">{snapshot.loraNodes.map((node) => { const parent = node.parentNodeId ? nodeById.get(node.parentNodeId) : null; const stop = snapshot.stops.find((item) => item.id === node.stopId); const gatewayConnected = snapshot.loraGateways.some((item) => item.id === node.gatewayId && item.status === "active" && item.backendConnected); return <div className={`lora-node${node.status !== "active" || !gatewayConnected ? " lora-node--offline" : ""}`} key={node.id}><div className="lora-node__title"><span className={`live-dot${node.status !== "active" || !gatewayConnected ? " live-dot--muted" : ""}`} /><strong>{node.name}</strong><span className="schedule-tag">{node.status !== "active" ? "Offline" : gatewayConnected ? "Linked" : "Gateway down"}</span></div><small>{node.readerId ? `RFID reader ${node.readerId}` : "LoRa relay"} · {stop?.shortName ?? "Campus node"}</small><div className="lora-node__metrics"><span>Parent: {parent?.name ?? "Gateway root"}</span><span>Battery {node.batteryPercent ?? "—"}%</span><span>RSSI {node.rssiDbm ?? "—"} dBm · SNR {node.snrDb ?? "—"} dB</span></div><div className="lora-node__actions"><button className="text-button" onClick={() => act(() => demoFleetService.updateLoraNodeStatus(node.id, node.status === "active" ? "inactive" : "active"))}>{node.status === "active" ? "Take offline" : "Restore node"}</button><button className="text-button" disabled={!gatewayConnected} onClick={() => simulateHealth(node.id)}>Simulate health ping</button></div></div>; })}</div>}
        <p className="subtle-copy">Links, RSSI, SNR and battery readings are fictional. This screen does not connect to a radio, reader, gateway or LoRaWAN network.</p>
      </Panel>
    </section>
    <Panel title="Integration contract preview" eyebrow="HARDWARE BOUNDARY">
      <p className="subtle-copy">Versioned JSON envelopes are validated at the demo service edge. A production adapter still needs authentication, transport security, server-side authorization, durable storage, replay controls and hardware-specific protocol mapping.</p>
      <pre className="integration-example">{JSON.stringify({ eventId: "demo-event-001", eventType: "lora.health.v1", schemaVersion: 1, timestamp: "2026-10-06T08:30:00Z", source: { kind: "device", deviceId: "demo-reader-garden", adapter: "lora-gateway-adapter" }, idempotencyKey: "gateway-001:seq-42", payload: { nodeId: "lora-reader-garden", gatewayId: "gateway-northstar", status: "active", batteryPercent: 63, rssiDbm: -78, snrDb: 4.6 } }, null, 2)}</pre>
    </Panel>
  </>;
}

export function AdminDashboardPage() {
  const { snapshot, loading, error } = useFleetSnapshot(10_000);
  const location = useLocation();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const sectionCandidate = location.pathname.split("/")[2] as AdminSection | undefined;
  const section: AdminSection = sectionCandidate && sectionCandidate in sectionTitles ? sectionCandidate : "overview";

  async function act(callback: () => Promise<unknown>) {
    setActionError(null); setNotice(null);
    try {
      const result = await callback();
      if (result === "rejected") throw new Error("The integration event was rejected. Check the device audit for details.");
      setNotice(result === "duplicate" ? "Duplicate event ignored; the original record remains." : "Change saved to the shared demo workspace.");
    }
    catch (caught) { setActionError(caught instanceof Error ? caught.message : "That change could not be saved."); }
  }

  if (loading) return <div className="loading-state" role="status">Preparing the campus operations workspace…</div>;
  if (error) return <div className="load-error" role="alert">{error}</div>;
  if (!snapshot) return <div className="student-empty-state glass-panel"><h3>No fleet snapshot</h3><p>There is no shared demo snapshot to display.</p></div>;
  const headings = { title: section === "overview" ? "Good morning, Avery" : sectionTitles[section], subtitle: section === "overview" ? "A shared view of the campus routes, vehicles and service health." : "Fictional operational data shared with the student and driver demo roles." };
  return <DashboardLayout role="admin" title={headings.title} subtitle={headings.subtitle}>
    {actionError && <div className="form-error admin-message" role="alert">{actionError}</div>}
    {notice && <div className="admin-success" role="status">{notice}</div>}
    {section === "overview" && <Overview snapshot={snapshot} navigate={navigate} />}
    {section === "fleet" && <Panel title="Moving campus vehicles" eyebrow="FLEET MAP"><FleetMapPanel snapshot={snapshot} /></Panel>}
    {section === "buses" && <BusManagement snapshot={snapshot} act={act} />}
    {section === "routes" && <RouteManagement snapshot={snapshot} act={act} />}
    {section === "trips" && <TripManagement snapshot={snapshot} act={act} />}
    {section === "drivers" && <Drivers snapshot={snapshot} />}
    {section === "attendance" && <Attendance snapshot={snapshot} act={act} />}
    {section === "analytics" && <Analytics snapshot={snapshot} />}
    {section === "lora" && <LoraTopology snapshot={snapshot} act={act} />}
  </DashboardLayout>;
}
