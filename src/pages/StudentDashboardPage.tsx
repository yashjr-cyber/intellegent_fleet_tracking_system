import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { CampusMap } from "../components/CampusMap";
import { Icon } from "../components/Icons";
import type {
  ArrivalPrediction,
  TrafficCondition,
} from "../services/ArrivalPredictionService";
import { demoArrivalPredictionService } from "../services/demoArrivalPredictionService";
import {
  etaChangedMaterially,
  getAlertDeduplicationKey,
  isEveningAlertSettings,
  type EveningAlertSettings,
} from "../services/arrivalAlertUtils";
import {
  getSimulatedBusPositions,
  stopsUntilDestination,
  type SimulatedBusPosition,
} from "../services/simulatedTrackingService";
import { getTrackingStatus } from "../services/trackingStatus";
import { demoFleetService } from "../services/demoFleetService";
import type { FleetSnapshot, Route, Stop, Trip } from "../types/models";

const defaultAlertSettings: EveningAlertSettings = {
  enabled: false,
  tripId: "trip-homebound-01",
  pickupStopId: "stop-library",
  dropStopId: "stop-residences",
  leadMinutes: 10,
};

const leadTimeOptions: EveningAlertSettings["leadMinutes"][] = [5, 10, 15, 20];
const historicalMinutesPerStop: Readonly<Record<string, readonly number[]>> = {
  "route-north": [6, 8, 7, 9, 7, 8],
  "route-garden": [8, 9, 7, 10, 8, 9],
};
const settingsStorageKey = "wayfinder-evening-arrival-settings";

function readAlertSettings(): { settings: EveningAlertSettings; error: string | null } {
  try {
    const stored = window.localStorage.getItem(settingsStorageKey);
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    if (parsed === null) {
      return { settings: defaultAlertSettings, error: null };
    }
    if (!isEveningAlertSettings(parsed)) {
      return {
        settings: defaultAlertSettings,
        error: "Saved alert preferences could not be read; default settings are shown.",
      };
    }
    return { settings: parsed, error: null };
  } catch {
    return {
      settings: defaultAlertSettings,
      error: "Saved alert preferences are unavailable; default settings are shown.",
    };
  }
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTripTime(time: string, scheduledDate?: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  if (scheduledDate) {
    const [year, month, day] = scheduledDate.split("-").map(Number);
    if (year && month && day) date.setFullYear(year, month - 1, day);
  }
  date.setHours(hours, minutes, 0, 0);
  const timeLabel = formatClock(date);
  return scheduledDate && scheduledDate !== localDateKey(new Date())
    ? `${timeLabel} · ${date.toLocaleDateString([], { month: "short", day: "numeric" })}`
    : timeLabel;
}

function getArrivalPrediction(
  position: SimulatedBusPosition,
  destination: Stop,
  route: Route,
  stops: readonly Stop[],
  now: Date,
): ArrivalPrediction {
  const routeStops = route.stopIds.flatMap((stopId) => {
    const stop = stops.find((item) => item.id === stopId);
    return stop ? [stop] : [];
  });
  return demoArrivalPredictionService.predict({
    latitude: position.latitude,
    longitude: position.longitude,
    destination,
    stopsRemaining: stopsUntilDestination(
      routeStops,
      position.segmentIndex,
      destination.id,
    ),
    historicalMinutesPerStop: historicalMinutesPerStop[route.id] ?? [8],
    currentTime: now,
    isWeekday: ![0, 6].includes(now.getDay()),
    traffic: position.traffic,
  });
}

function getTimeSensitiveGreeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function mapStatus(status: SimulatedBusPosition["status"]): string {
  if (status === "LIVE") return "LIVE · simulated";
  return status;
}

export function StudentDashboardPage() {
  const [snapshot, setSnapshot] = useState<FleetSnapshot | null>(null);
  const [positions, setPositions] = useState<SimulatedBusPosition[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [storedSettings] = useState(readAlertSettings);
  const [settings, setSettings] = useState(storedSettings.settings);
  const [settingsError, setSettingsError] = useState<string | null>(storedSettings.error);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );
  const [now, setNow] = useState(() => new Date());
  const lastEtaRef = useRef<number | null>(null);
  const alertSessionKeysRef = useRef(new Set<string>());
  const lastAlertConfigurationRef = useRef<string | null>(null);
  const alertsWereEnabledRef = useRef(false);
  const simulationStartedAtRef = useRef(Date.now());

  useEffect(() => {
    let isCurrent = true;
    const loadSnapshot = () => {
      demoFleetService.getSnapshot().then(
        (data) => {
          if (!isCurrent) return;
          setSnapshot(data);
          setPositions(
            getSimulatedBusPositions(
              data,
              Date.now(),
              simulationStartedAtRef.current,
            ),
          );
          setLoadError(null);
        },
        () => {
          if (!isCurrent) return;
          setLoadError("We couldn't load your demo journey. Please refresh to try again.");
        },
      );
    };
    loadSnapshot();
    const unsubscribe = demoFleetService.subscribe(loadSnapshot);
    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!snapshot) return;
    const refresh = () => {
      const timestamp = Date.now();
      setNow(new Date(timestamp));
      setPositions(
        getSimulatedBusPositions(
          snapshot,
          timestamp,
          simulationStartedAtRef.current,
        ),
      );
    };
    const interval = window.setInterval(refresh, 5_000);
    return () => window.clearInterval(interval);
  }, [snapshot]);

  useEffect(() => {
    try {
      window.localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
      setSettingsError(null);
    } catch {
      setSettingsError("We couldn't save your alert preferences on this device.");
    }
  }, [settings]);

  const student = snapshot?.students.find((item) => item.id === "student-anaya");
  const studentTrip = snapshot?.trips.find((item) => item.id === "trip-next-01");
  const studentAssignment = snapshot?.tripAssignments.find(
    (item) => item.tripId === studentTrip?.id,
  );
  const studentBus = snapshot?.buses.find(
    (item) => item.id === studentAssignment?.busId,
  );
  const activeTripOnAssignedBus = snapshot?.trips.find((trip) =>
    trip.status === "in_progress" &&
    trip.routeId === studentTrip?.routeId &&
    snapshot.tripAssignments.some(
      (assignment) => assignment.tripId === trip.id && assignment.busId === studentAssignment?.busId,
    ),
  );
  const studentPosition = positions.find(
    (position) => position.tripId === (activeTripOnAssignedBus?.id ?? studentTrip?.id),
  );
  const studentRoute = snapshot?.routes.find(
    (item) => item.id === studentTrip?.routeId,
  );
  const assignedStop = snapshot?.stops.find(
    (item) => item.id === student?.stopId,
  );

  const homeboundTrips = useMemo(
    () => snapshot?.trips.filter((trip) => trip.direction === "homebound") ?? [],
    [snapshot],
  );
  const alertTrip =
    homeboundTrips.find((trip) => trip.id === settings.tripId) ??
    homeboundTrips[0];
  const alertAssignment = snapshot?.tripAssignments.find(
    (item) => item.tripId === alertTrip?.id,
  );
  const alertRoute = snapshot?.routes.find(
    (item) => item.id === alertTrip?.routeId,
  );
  const alertPickup = snapshot?.stops.find(
    (item) => item.id === settings.pickupStopId,
  );
  const alertPosition = positions.find(
    (position) => position.tripId === alertTrip?.id,
  );
  const alertPrediction =
    alertPosition?.status === "LIVE" && alertPickup && alertRoute && snapshot
      ? getArrivalPrediction(
          alertPosition,
          alertPickup,
          alertRoute,
          snapshot.stops,
          now,
        )
      : null;

  const mapPositions = useMemo(() => {
    const uniqueBusIds = new Set<string>();
    return positions.filter((position) => {
        if (uniqueBusIds.has(position.busId)) return false;
        uniqueBusIds.add(position.busId);
        return true;
    });
  }, [positions]);

  const selectedPosition = positions.find(
    (position) => position.busId === selectedBusId,
  );
  const selectedTrip = snapshot?.trips.find(
    (trip) => trip.id === selectedPosition?.tripId,
  );
  const selectedRoute = snapshot?.routes.find(
    (route) => route.id === selectedPosition?.routeId,
  );
  const selectedBus = snapshot?.buses.find(
    (bus) => bus.id === selectedPosition?.busId,
  );
  const selectedPrediction =
    selectedPosition?.status === "LIVE" && selectedRoute && snapshot
      ? getArrivalPrediction(
          selectedPosition,
          selectedPosition.nextStop,
          selectedRoute,
          snapshot.stops,
          now,
        )
      : null;
  const mapDetailsByBusId = useMemo(() => {
    const result = new Map<
      string,
      {
        busLabel: string;
        route: Route;
        trip: Trip;
        position: SimulatedBusPosition;
        prediction: ArrivalPrediction | null;
      }
    >();

    if (!snapshot) return result;
    for (const position of mapPositions) {
      const bus = snapshot.buses.find((item) => item.id === position.busId);
      const route = snapshot.routes.find((item) => item.id === position.routeId);
      const trip = snapshot.trips.find((item) => item.id === position.tripId);
      if (!bus || !route || !trip) continue;
      result.set(position.busId, {
        busLabel: bus.label,
        route,
        trip,
        position,
        prediction: position.status === "LIVE"
          ? getArrivalPrediction(
              position,
              position.nextStop,
              route,
              snapshot.stops,
              now,
            )
          : null,
      });
    }
    return result;
  }, [mapPositions, now, snapshot]);

  useEffect(() => {
    const configurationKey = alertTrip && alertPickup
      ? `${alertTrip.id}:${alertPickup.id}:${settings.leadMinutes}`
      : null;
    const configurationChanged =
      configurationKey !== null &&
      configurationKey !== lastAlertConfigurationRef.current;
    lastAlertConfigurationRef.current = configurationKey;

    if (!settings.enabled || !alertTrip || !alertPickup || !alertPrediction) {
      alertsWereEnabledRef.current = false;
      lastEtaRef.current = alertPrediction?.minutes ?? null;
      return;
    }

    const previousEta = lastEtaRef.current;
    const materiallyChanged =
      !alertsWereEnabledRef.current ||
      configurationChanged ||
      etaChangedMaterially(previousEta, alertPrediction.minutes);
    alertsWereEnabledRef.current = true;
    lastEtaRef.current = alertPrediction.minutes;
    if (!materiallyChanged || alertPrediction.minutes > settings.leadMinutes) {
      return;
    }

    const deduplicationKey = getAlertDeduplicationKey(
      alertTrip.id,
      alertPickup.id,
    );
    try {
      if (alertSessionKeysRef.current.has(deduplicationKey)) return;
      if (window.localStorage.getItem(deduplicationKey)) {
        alertSessionKeysRef.current.add(deduplicationKey);
        return;
      }
      window.localStorage.setItem(deduplicationKey, "sent");
    } catch {
      setAlertMessage(
        `Your ${settings.leadMinutes}-minute arrival alert for ${alertPickup.shortName} is due soon. We couldn't save its duplicate-protection record.`,
      );
    }
    alertSessionKeysRef.current.add(deduplicationKey);

    const message = `${studentBus?.label ?? "Your bus"} is about ${alertPrediction.minutes} minutes from ${alertPickup.name}.`;
    setAlertMessage(message);
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification("Your bus is on its way", {
          body: message,
          tag: deduplicationKey,
        });
      } catch {
        setPermission("denied");
      }
    }
  }, [
    alertPickup,
    alertPrediction,
    alertTrip,
    settings.enabled,
    settings.leadMinutes,
    studentBus?.label,
  ]);

  function updateSettings(change: Partial<EveningAlertSettings>) {
    setSettings((current) => ({ ...current, ...change }));
  }

  async function enableAlerts() {
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
      updateSettings({ enabled: true });
      setAlertMessage(
        "Arrival alerts are enabled in this dashboard. This browser does not support system notifications.",
      );
      return;
    }
    if (Notification.permission === "default") {
      try {
        setPermission(await Notification.requestPermission());
      } catch {
        setPermission("denied");
      }
    } else {
      setPermission(Notification.permission);
    }
    updateSettings({ enabled: true });
  }

  function trackMyBus() {
    setSelectedBusId(studentBus?.id ?? null);
    document
      .getElementById("student-live-map")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (loadError) {
    return (
      <DashboardLayout
        role="student"
        title="Your journey"
        subtitle="Your campus mobility, all in one place."
      >
        <div className="student-state student-state--error" role="alert">
          <Icon name="bell" size={20} />
          <span>{loadError}</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!snapshot) {
    return (
      <DashboardLayout
        role="student"
        title="Your journey"
        subtitle="Your campus mobility, all in one place."
      >
        <div className="student-state" role="status">
          <span className="student-loading-dot" />
          Preparing your journey and campus map…
        </div>
      </DashboardLayout>
    );
  }

  if (!student || !studentTrip || !studentBus || !studentRoute || !assignedStop || !studentPosition) {
    return (
      <DashboardLayout
        role="student"
        title="Your journey"
        subtitle="Your campus mobility, all in one place."
      >
        <div className="student-no-trip glass-panel" role="status">
          <span className="stat-icon stat-icon--mint"><Icon name="bus" size={19} /></span>
          <div>
            <h2>No bus trip assigned yet</h2>
            <p>Your next trip and live vehicle details will appear here once a campus team assigns your route.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const freshness = getTrackingStatus(
    studentPosition.recordedAt,
    now.getTime(),
  );
  const studentPrediction = freshness === "LIVE"
    ? getArrivalPrediction(
        studentPosition,
        assignedStop,
        studentRoute,
        snapshot.stops,
        now,
      )
    : null;
  const homeboundRouteStops =
    alertRoute?.stopIds.flatMap((stopId) => {
      const stop = snapshot.stops.find((item) => item.id === stopId);
      return stop ? [stop] : [];
    }) ?? [];
  const pickupIndex = homeboundRouteStops.findIndex(
    (stop) => stop.id === settings.pickupStopId,
  );
  const allowedDropStops = homeboundRouteStops.filter(
    (_, index) => pickupIndex < 0 || index > pickupIndex,
  );
  const notifications = snapshot.notifications.filter(
    (notification) => notification.recipientId === student.id,
  );

  return (
    <DashboardLayout
      role="student"
      title={`${getTimeSensitiveGreeting()}, ${student.name.split(" ")[0]}`}
      subtitle="Your next campus journey, with a little more clarity."
    >
      <section className="student-journey-hero glass-panel" aria-labelledby="next-trip-heading">
        <div className="student-journey-hero__main">
          <div className="student-journey-hero__topline">
            <span className="eyebrow">YOUR NEXT TRIP</span>
            <span className={`tracking-pill tracking-pill--${freshness.toLowerCase()}`}>
              <span className="status-indicator" /> {mapStatus(freshness)}
            </span>
          </div>
          <div className="student-journey__arrival">
            <span className="student-journey__eta">{studentPrediction?.minutes ?? "—"}</span>
            <span className="student-journey__eta-label">{studentPrediction ? <>min<br />away</> : <>ETA<br />paused</>}</span>
          </div>
          <h2 id="next-trip-heading">
            {studentPrediction ? `${studentBus.label} is heading your way` : `${studentBus.label}'s last known location`}
          </h2>
          <p className="student-journey__range">
            {studentPrediction
              ? <>Predicted arrival {formatClock(studentPrediction.arrivalAt)} · estimated range {studentPrediction.range.earliestMinutes}–{studentPrediction.range.latestMinutes} min</>
              : "Arrival estimate unavailable until the bus sends a fresh location."}
          </p>
          <div className="student-journey__facts">
            <div><span>ROUTE</span><strong>{studentRoute.code} · {studentRoute.name}</strong></div>
            <div><span>PICKUP STOP</span><strong><Icon name="pin" size={14} /> {assignedStop.name}</strong></div>
            <div><span>SCHEDULED DEPARTURE</span><strong>{formatTripTime(studentTrip.scheduledStart, studentTrip.scheduledDate)}</strong></div>
          </div>
          <div className="student-journey__actions">
            <button className="primary-button student-track-button" onClick={trackMyBus}>
              <Icon name="map" size={17} /> Track my bus
            </button>
            <span className="student-journey__freshness">
              <span className="status-indicator" />
              Last updated {studentPosition.recordedAt.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>
        <div className="student-journey-hero__side">
          <div className="student-simulated-chip"><Icon name="spark" size={15} /> SIMULATED {studentPrediction ? "BUS LOCATION" : "LAST-KNOWN LOCATION"}</div>
          <div className="student-route-preview" aria-hidden="true">
            <div className="student-route-preview__line" />
            <span className="student-route-preview__stop student-route-preview__stop--start"><Icon name="pin" size={15} /></span>
            <span className="student-route-preview__stop student-route-preview__stop--assigned"><Icon name="pin" size={17} /></span>
            <span className="student-route-preview__stop student-route-preview__stop--end"><Icon name="pin" size={15} /></span>
            <span className="student-route-preview__bus"><Icon name="bus" size={18} /></span>
          </div>
          <div className="student-route-preview__labels"><span>Founders Library</span><strong>Your stop · {assignedStop.shortName}</strong><span>East Campus Gate</span></div>
          <div className="student-traffic"><span className={`traffic-dot traffic-dot--${studentPosition.traffic}`} /> Simulated traffic: {studentPosition.traffic}</div>
        </div>
      </section>

      <section className="student-map-card glass-panel" id="student-live-map" aria-labelledby="student-map-heading">
        <div className="student-card-heading">
          <div>
            <p className="eyebrow">CAMPUS BUS TRACKING</p>
            <h2 id="student-map-heading">A clearer view of your ride</h2>
            <p>Fictional bus locations move around the campus route for this demo.</p>
          </div>
          <span className={`tracking-pill tracking-pill--${(selectedPosition?.status ?? freshness).toLowerCase()}`}>
            <span className="status-indicator" /> {mapStatus(selectedPosition?.status ?? freshness)}
          </span>
        </div>
        <div className="student-map-layout">
          <div className="student-map">
            <CampusMap
              routes={snapshot.routes}
              positions={mapPositions}
              selectedBusId={selectedBusId}
              stops={snapshot.stops}
              assignedStop={assignedStop}
              detailsByBusId={mapDetailsByBusId}
              onSelectBus={setSelectedBusId}
            />
            <span className="student-map__attribution">Map data © OpenStreetMap contributors</span>
          </div>
          <aside className="student-map-details" aria-live="polite">
            {selectedPosition && selectedTrip && selectedRoute && selectedBus ? (
              <>
                <div className="student-map-details__top">
                  <span className="stat-icon stat-icon--mint"><Icon name="bus" size={18} /></span>
                  <span className={`tracking-pill tracking-pill--${selectedPosition.status.toLowerCase()}`}>
                    <span className="status-indicator" /> {mapStatus(selectedPosition.status)}
                  </span>
                </div>
                <p className="eyebrow">SELECTED VEHICLE</p>
                <h3>{selectedBus.label}</h3>
                <p className="student-map-details__registration">{selectedBus.registration} · {selectedRoute.code}</p>
                <dl className="student-map-details__list">
                  <div><dt>Route</dt><dd>{selectedRoute.name}</dd></div>
                  <div><dt>Trip</dt><dd>{selectedTrip.direction === "homebound" ? "Homebound" : "Campus bound"} · {formatTripTime(selectedTrip.scheduledStart, selectedTrip.scheduledDate)}</dd></div>
                  <div><dt>Next stop</dt><dd>{selectedPosition.nextStop.name}</dd></div>
                  <div><dt>Estimated arrival</dt><dd>{selectedPrediction
                    ? `${selectedPrediction.minutes} min · ${formatClock(selectedPrediction.arrivalAt)}`
                    : "Unavailable until a fresh location is received"}</dd></div>
                  <div><dt>Last updated</dt><dd>{selectedPosition.recordedAt.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                  })}</dd></div>
                </dl>
                <p className="student-map-details__notice">
                  {selectedPosition.status === "LIVE"
                    ? "Live here means recently refreshed demo telemetry, not real GPS."
                    : "This vehicle has no current live update. Its last position may be out of date."}
                </p>
              </>
            ) : (
              <div className="student-empty-state">
                <span className="stat-icon stat-icon--mint"><Icon name="map" size={18} /></span>
                <h3>{positions.length === 0 ? "No bus location available" : "Select a bus"}</h3>
                <p>
                  {positions.length === 0
                    ? "There are no vehicle updates to show right now. A last-seen bus may be offline."
                    : "Choose a bus on the map to see its trip, next stop and estimated arrival."}
                </p>
              </div>
            )}
          </aside>
        </div>
        <div className="student-map-legend">
          <span><i className="map-legend__bus map-legend__bus--mint" /> North loop</span>
          <span><i className="map-legend__bus map-legend__bus--blue" /> Garden district</span>
          <span><i className="map-legend__stop" /> Your assigned stop</span>
          <span className="student-map-legend__disclaimer">Predictions are illustrative prototype estimates, not validated machine-learning results.</span>
        </div>
      </section>

      <section className="student-bottom-grid">
        <article className="student-alert-card glass-panel" aria-labelledby="student-alert-heading">
          <div className="student-card-heading">
            <div>
              <p className="eyebrow">BE THERE AT THE RIGHT TIME</p>
              <h2 id="student-alert-heading">Evening arrival alerts</h2>
              <p>Get a heads-up when your homebound bus is nearing your stop.</p>
            </div>
            <span className="student-alert-card__icon"><Icon name="bell" size={19} /></span>
          </div>
          {!alertTrip || !alertRoute || !alertPickup ? (
            <div className="student-empty-state">
              No homebound trip is assigned yet. Your campus team can add one.
            </div>
          ) : (
            <div className="student-alert-form">
              <label>
                <span>HOMEBOUND TRIP</span>
                <select
                  value={alertTrip.id}
                  onChange={(event) => {
                    const nextTrip = homeboundTrips.find((trip) => trip.id === event.target.value);
                    const nextRoute = snapshot.routes.find((route) => route.id === nextTrip?.routeId);
                    const routeStops = nextRoute?.stopIds.flatMap((stopId) => {
                      const stop = snapshot.stops.find((item) => item.id === stopId);
                      return stop ? [stop] : [];
                    }) ?? [];
                    updateSettings({
                      tripId: event.target.value,
                      pickupStopId: routeStops[0]?.id ?? "",
                      dropStopId: routeStops[1]?.id ?? "",
                    });
                  }}
                >
                  {homeboundTrips.map((trip) => {
                    const route = snapshot.routes.find((item) => item.id === trip.routeId);
                    return (
                      <option key={trip.id} value={trip.id}>
                        {route?.name ?? "Campus route"} · {formatTripTime(trip.scheduledStart, trip.scheduledDate)}
                      </option>
                    );
                  })}
                </select>
              </label>
              <div className="student-alert-form__stops">
                <label>
                  <span>PICKUP STOP</span>
                  <select
                    value={homeboundRouteStops.some((stop) => stop.id === settings.pickupStopId) ? settings.pickupStopId : homeboundRouteStops[0]?.id ?? ""}
                    onChange={(event) => {
                      const nextPickupIndex = homeboundRouteStops.findIndex((stop) => stop.id === event.target.value);
                      const nextDrop = homeboundRouteStops.find((_, index) => index > nextPickupIndex);
                      updateSettings({
                        pickupStopId: event.target.value,
                        ...(nextDrop ? { dropStopId: nextDrop.id } : {}),
                      });
                    }}
                  >
                    {homeboundRouteStops.map((stop) => <option key={stop.id} value={stop.id}>{stop.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>DROP-OFF STOP</span>
                  <select
                    value={allowedDropStops.some((stop) => stop.id === settings.dropStopId) ? settings.dropStopId : allowedDropStops[0]?.id ?? ""}
                    onChange={(event) => updateSettings({ dropStopId: event.target.value })}
                    disabled={allowedDropStops.length === 0}
                  >
                    {allowedDropStops.map((stop) => <option key={stop.id} value={stop.id}>{stop.name}</option>)}
                  </select>
                </label>
              </div>
              <label>
                <span>NOTIFY ME</span>
                <select
                  value={settings.leadMinutes}
                  onChange={(event) => updateSettings({
                    leadMinutes: Number(event.target.value) as EveningAlertSettings["leadMinutes"],
                  })}
                >
                  {leadTimeOptions.map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes before arrival</option>)}
                </select>
              </label>
              <div className="student-alert-form__footer">
                <button
                  className={settings.enabled ? "soft-button student-alert-toggle" : "primary-button student-alert-toggle"}
                  aria-pressed={settings.enabled}
                  onClick={() => settings.enabled ? updateSettings({ enabled: false }) : void enableAlerts()}
                >
                  <Icon name={settings.enabled ? "check" : "bell"} size={16} />
                  {settings.enabled ? "Alerts enabled" : "Enable arrival alerts"}
                </button>
                <span>Lead time is based on the changing predicted arrival.</span>
              </div>
              {permission === "denied" && settings.enabled && (
                <p className="student-inline-note" role="status">
                  Browser notifications are blocked; arrival alerts will appear in this dashboard. Change site permissions to allow system notifications.
                </p>
              )}
              {permission === "unsupported" && settings.enabled && (
                <p className="student-inline-note" role="status">
                  This browser does not support system notifications; alerts appear in this dashboard while it is open.
                </p>
              )}
              {settingsError && <p className="student-inline-error" role="alert">{settingsError}</p>}
            </div>
          )}
          <div className="student-alert-limit">
            <Icon name="spark" size={15} />
            <p>
              {alertPosition && alertPosition.status !== "LIVE"
                ? `${snapshot.buses.find((bus) => bus.id === alertAssignment?.busId)?.label ?? "Your bus"} GPS is ${alertPosition.status.toLowerCase()}; arrival alerts are paused until a fresh location is available.`
                : alertPrediction && alertTrip && alertPickup
                  ? `${snapshot.buses.find((bus) => bus.id === alertAssignment?.busId)?.label ?? "Your bus"} is currently estimated to reach ${alertPickup.name} in about ${alertPrediction.minutes} min.`
                  : "Arrival time is estimated from simulated bus position and demo traffic."}
              {" "}Browser notifications need permission and only work while this demo is open; they cannot run in the background after it closes.
            </p>
          </div>
          {alertMessage && (
            <div className="student-in-app-alert" role="status">
              <span className="stat-icon stat-icon--mint"><Icon name="bell" size={16} /></span>
              <span>{alertMessage}</span>
              <button aria-label="Dismiss arrival alert" onClick={() => setAlertMessage(null)}>Dismiss</button>
            </div>
          )}
        </article>

        <article className="student-notifications-card glass-panel" aria-labelledby="student-notifications-heading">
          <div className="student-card-heading">
            <div><p className="eyebrow">A LITTLE HEADS-UP</p><h2 id="student-notifications-heading">Important notifications</h2></div>
            <span className="notification-count">{notifications.filter((item) => !item.read).length} new</span>
          </div>
          {notifications.length === 0 ? (
            <div className="student-empty-state">You're all caught up. New journey updates will show up here.</div>
          ) : (
            <div className="student-notification-list">
              {notifications.map((notification) => (
                <article className="student-notification" key={notification.id}>
                  <span className="activity-item__icon activity-item__icon--mint"><Icon name="bell" size={16} /></span>
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <time dateTime={notification.createdAt}>
                      {new Date(notification.createdAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  {!notification.read && <span className="student-notification__unread" aria-label="Unread" />}
                </article>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="student-trip-summary glass-panel" aria-label="Next scheduled trip details">
        <div><span className="eyebrow">SCHEDULED JOURNEY</span><strong>{studentRoute.name} · {studentRoute.code}</strong></div>
        <div><span>Bus</span><strong>{studentBus.label} · {studentBus.registration}</strong></div>
        <div><span>Pickup</span><strong>{assignedStop.name}</strong></div>
        <div><span>Departure</span><strong>{formatTripTime(studentTrip.scheduledStart, studentTrip.scheduledDate)}</strong></div>
        <div><span>Traffic</span><strong>{studentPosition.traffic as TrafficCondition} · simulated</strong></div>
      </section>
    </DashboardLayout>
  );
}
