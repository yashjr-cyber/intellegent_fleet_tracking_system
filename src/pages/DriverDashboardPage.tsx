import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Icon } from "../components/Icons";
import { demoFleetService } from "../services/demoFleetService";
import { getSimulatedBusPositions } from "../services/simulatedTrackingService";
import { useFleetSnapshot } from "../services/useFleetSnapshot";
import { getTrackingStatus } from "../services/trackingStatus";
import type { DriverIncident } from "../types/models";

const driverId = "driver-mira";

function displayTime(value: string): string {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function DriverDashboardPage() {
  const { snapshot, loading, error } = useFleetSnapshot(8_000);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [incidentNote, setIncidentNote] = useState("");
  const [incidentCategory, setIncidentCategory] = useState<DriverIncident["category"]>("vehicle");
  const [busy, setBusy] = useState(false);

  const tripContext = useMemo(() => {
    if (!snapshot) return null;
    const assignments = snapshot.tripAssignments.filter((item) => item.driverId === driverId);
    const trips = assignments
      .map((assignment) => ({
        assignment,
        trip: snapshot.trips.find((item) => item.id === assignment.tripId),
      }))
      .filter((item): item is typeof item & { trip: NonNullable<typeof item.trip> } => Boolean(item.trip))
      .sort((a, b) => {
        const rank = { in_progress: 0, paused: 1, boarding: 2, scheduled: 3, completed: 4 };
        return rank[a.trip.status] - rank[b.trip.status] || a.trip.scheduledStart.localeCompare(b.trip.scheduledStart);
      });
    const selected = trips.find((item) => item.trip.id === selectedTripId) ??
      trips.find((item) => item.trip.status !== "completed") ?? trips[0];
    if (!selected) return null;
    const route = snapshot.routes.find((item) => item.id === selected.trip.routeId);
    const bus = snapshot.buses.find((item) => item.id === selected.assignment.busId);
    const tracker = snapshot.trackers.find((item) => item.id === selected.assignment.trackerId);
    const driver = snapshot.drivers.find((item) => item.id === selected.assignment.driverId);
    const stops = route?.stopIds.flatMap((stopId) => {
      const stop = snapshot.stops.find((item) => item.id === stopId);
      return stop ? [stop] : [];
    }) ?? [];
    const position = getSimulatedBusPositions(snapshot).find((item) => item.tripId === selected.trip.id);
    const lastTelemetry = snapshot.gpsTelemetry
      .filter((item) => item.trackerId === tracker?.id)
      .sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt))[0];
    const trackingStatus = tracker?.status === "active"
      ? getTrackingStatus(lastTelemetry?.recordedAt ?? tracker.lastSeenAt)
      : "OFFLINE";
    return { ...selected, trips, route, bus, tracker, driver, stops, position, lastTelemetry, trackingStatus };
  }, [snapshot, selectedTripId]);

  async function runAction(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "That trip action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tripContext || !incidentNote.trim()) return;
    await runAction(async () => {
      await demoFleetService.reportIncident({
        tripId: tripContext.trip.id,
        driverId,
        category: incidentCategory,
        note: incidentNote.trim(),
      });
      setIncidentNote("");
    });
  }

  async function sendDemoGpsPing() {
    if (!tripContext?.bus || !tripContext.tracker || !tripContext.position) return;
    const eventId = `demo-gps-${Date.now()}`;
    await runAction(() => demoFleetService.recordGpsTelemetry({
      eventId,
      eventType: "gps.telemetry.v1",
      schemaVersion: 1,
      timestamp: new Date().toISOString(),
      source: { kind: "simulator", deviceId: tripContext.tracker!.serialNumber, adapter: "browser-simulator" },
      idempotencyKey: eventId,
      payload: {
        tripId: tripContext.trip.id,
        trackerId: tripContext.tracker!.id,
        busId: tripContext.bus!.id,
        latitude: tripContext.position!.latitude,
        longitude: tripContext.position!.longitude,
        speedKph: tripContext.position!.speedKph,
      },
    }));
  }

  if (loading) return <div className="loading-state" role="status">Preparing today's driver workspace…</div>;
  if (error) return <div className="load-error" role="alert">{error}</div>;
  if (!snapshot) return <div className="student-empty-state glass-panel"><h3>No driver workspace</h3><p>There is no shared demo snapshot to display.</p></div>;

  const trip = tripContext;
  const freshness = trip?.position?.status ?? trip?.trackingStatus ?? "OFFLINE";
  const latestUpdate = trip?.position?.recordedAt ?? (trip?.lastTelemetry ? new Date(trip.lastTelemetry.recordedAt) : null);

  return (
    <DashboardLayout role="driver" title="Good morning, Mira" subtitle="Your assigned trips, vehicle readiness and route updates in one place.">
      <section className="stats-grid" aria-label="Driver trip summary">
        <article className="stat-card glass-panel"><div className="stat-card__top"><span>Today's assignments</span><span className="stat-icon stat-icon--mint"><Icon name="map" size={18} /></span></div><strong className="stat-card__value">{trip?.trips.filter((item) => item.trip.status !== "completed").length ?? 0}</strong><span className="stat-card__note">Connected to your driver account</span></article>
        <article className="stat-card glass-panel"><div className="stat-card__top"><span>Vehicle</span><span className="stat-icon stat-icon--blue"><Icon name="bus" size={18} /></span></div><strong className="stat-card__value">{trip?.bus?.label ?? "Unassigned"}</strong><span className="stat-card__note">{trip?.bus?.registration ?? "Choose a scheduled trip"}</span></article>
        <article className="stat-card glass-panel"><div className="stat-card__top"><span>GPS freshness</span><span className="stat-icon stat-icon--violet"><Icon name="pin" size={18} /></span></div><strong className="stat-card__value">{trip?.trackingStatus ?? "OFFLINE"}</strong><span className="stat-card__note">{latestUpdate ? `Updated ${displayTime(latestUpdate.toISOString())}` : "No telemetry available"}</span></article>
      </section>

      <section className="dashboard-grid driver-grid">
        <article className="glass-panel feature-card">
          <div className="card-heading">
            <div><p className="eyebrow">ASSIGNED JOURNEY</p><h2>{trip?.route?.name ?? "No trip selected"}</h2></div>
            {trip && <span className={`freshness-badge freshness-badge--${freshness.toLowerCase()}`}>{freshness}{trip.position ? " · SIMULATED" : ""}</span>}
          </div>
          {!trip ? (
            <div className="student-empty-state"><h3>No assigned trips</h3><p>Ask the transport team to assign a trip, bus, tracker and route.</p></div>
          ) : (
            <>
              <div className="driver-trip-meta"><span><small>TRIP</small>{trip.trip.id}</span><span><small>DEPARTURE</small>{trip.trip.scheduledStart}</span><span><small>BUS</small>{trip.bus?.registration ?? "Unavailable"}</span></div>
              <div className="driver-stop-list" aria-label="Ordered route stops">
                {trip.stops.map((stop, index) => <div className="driver-stop" key={stop.id}><span className={`driver-stop__marker${trip.position?.nextStop.id === stop.id ? " driver-stop__marker--next" : ""}`}>{index + 1}</span><span><strong>{stop.name}</strong><small>{trip.position?.nextStop.id === stop.id ? "Next stop" : `Stop ${index + 1}`}</small></span></div>)}
              </div>
              <div className="driver-actions">
                {(trip.trip.status === "scheduled" || trip.trip.status === "boarding") && <button className="primary-button" disabled={busy} onClick={() => void runAction(() => demoFleetService.startTrip(trip.trip.id))}>Start trip</button>}
                {trip.trip.status === "in_progress" && <button className="soft-button" disabled={busy} onClick={() => void runAction(() => demoFleetService.pauseTrip(trip.trip.id))}>Pause</button>}
                {trip.trip.status === "paused" && <button className="primary-button" disabled={busy} onClick={() => void runAction(() => demoFleetService.resumeTrip(trip.trip.id))}>Resume</button>}
                {(trip.trip.status === "in_progress" || trip.trip.status === "paused") && <button className="soft-button" disabled={busy} onClick={() => void runAction(() => demoFleetService.endTrip(trip.trip.id))}>End trip</button>}
                <button className="soft-button" disabled={busy || !trip.position} onClick={() => void sendDemoGpsPing()}>Send simulated GPS ping</button>
              </div>
            </>
          )}
          {actionError && <p className="form-error" role="alert">{actionError}</p>}
        </article>

        <article className="glass-panel feature-card">
          <div className="card-heading"><div><p className="eyebrow">TRIP SELECTOR</p><h2>Today's schedule</h2></div></div>
          {trip?.trips.length ? <div className="driver-trip-list">{trip.trips.map((item) => {
            const route = snapshot.routes.find((candidate) => candidate.id === item.trip.routeId);
            return <button key={item.trip.id} className={`driver-trip-option${item.trip.id === trip.trip.id ? " driver-trip-option--selected" : ""}`} onClick={() => setSelectedTripId(item.trip.id)}><span><strong>{route?.name ?? "Route unavailable"}</strong><small>{item.trip.scheduledStart} · {item.trip.id}</small></span><span className="schedule-tag">{item.trip.status.replace("_", " ")}</span></button>;
          })}</div> : <div className="student-empty-state"><h3>Schedule is clear</h3><p>No trips are currently assigned to this profile.</p></div>}
          {trip && <div className="driver-vehicle-status"><span>Network and GPS</span><strong className={`freshness-badge freshness-badge--${trip.trackingStatus.toLowerCase()}`}>{trip.trackingStatus}</strong><small>{trip.position ? `Simulated location · next ${trip.position.nextStop.shortName}` : trip.tracker ? `Last device heartbeat ${displayTime(trip.tracker.lastSeenAt)}` : "No tracker assigned"}</small></div>}
        </article>
      </section>

      <section className="bottom-grid">
        <article className="glass-panel feature-card">
          <div className="card-heading"><div><p className="eyebrow">SAFETY & OPERATIONS</p><h2>Report an incident</h2></div></div>
          <form className="admin-form" onSubmit={(event) => void submitIncident(event)}>
            <label>Category<select value={incidentCategory} onChange={(event) => setIncidentCategory(event.target.value as DriverIncident["category"])}><option value="safety">Safety</option><option value="vehicle">Vehicle</option><option value="route">Route</option><option value="other">Other</option></select></label>
            <label>Note<textarea required value={incidentNote} onChange={(event) => setIncidentNote(event.target.value)} placeholder="Briefly describe the issue" rows={3} /></label>
            <button className="soft-button" disabled={busy || !trip}>Submit incident</button>
          </form>
          {snapshot.driverIncidents.filter((item) => item.driverId === driverId).length === 0 ? <p className="subtle-copy">No incidents have been recorded in this demo.</p> : <div className="driver-trip-list">{snapshot.driverIncidents.filter((item) => item.driverId === driverId).slice(0, 3).map((item) => <p className="audit-row" key={item.id}><strong>{item.category}</strong><span>{item.note}</span><small>{displayTime(item.reportedAt)}</small></p>)}</div>}
        </article>
        <article className="glass-panel feature-card">
          <p className="eyebrow">DEMO BOUNDARY</p><h2>Operational status, clearly shown</h2>
          <p className="subtle-copy">Map movement and GPS pings are simulated in this browser. A stale or offline tracker is never reported as live. Trip changes and incident notes are shared with the other demo roles on this browser.</p>
          <span className="freshness-badge freshness-badge--stale">Not connected to vehicle hardware</span>
        </article>
      </section>
    </DashboardLayout>
  );
}
