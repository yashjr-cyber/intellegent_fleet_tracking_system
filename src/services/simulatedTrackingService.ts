import type { FleetSnapshot, Stop } from "../types/models";
import type { TrafficCondition } from "./ArrivalPredictionService";
import { getTrackingStatus, type TrackingStatus } from "./trackingStatus";

export interface SimulatedBusPosition {
  busId: string;
  trackerId: string;
  tripId: string;
  routeId: string;
  latitude: number;
  longitude: number;
  speedKph: number;
  traffic: TrafficCondition;
  segmentIndex: number;
  nextStop: Stop;
  recordedAt: Date;
  status: TrackingStatus;
}

const segmentDurationMilliseconds = 4 * 60_000;
const homeboundHeartbeatMilliseconds = 3 * 60_000;

function interpolate(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function fromLastKnownLocation(
  tripId: string,
  busId: string,
  trackerId: string,
  routeId: string,
  routeStops: readonly Stop[],
  telemetry: FleetSnapshot["gpsTelemetry"][number],
  now: number,
  inService: boolean,
): SimulatedBusPosition {
  const nearestStopIndex = routeStops.reduce((closest, stop, index) => {
    const distance = (stop.latitude - telemetry.latitude) ** 2 + (stop.longitude - telemetry.longitude) ** 2;
    const closestStop = routeStops[closest];
    const closestDistance = (closestStop.latitude - telemetry.latitude) ** 2 + (closestStop.longitude - telemetry.longitude) ** 2;
    return distance < closestDistance ? index : closest;
  }, 0);
  const recordedAt = new Date(telemetry.recordedAt);
  return {
    busId,
    trackerId,
    tripId,
    routeId,
    latitude: telemetry.latitude,
    longitude: telemetry.longitude,
    speedKph: telemetry.speedKph,
    traffic: "moderate",
    segmentIndex: nearestStopIndex,
    nextStop: routeStops[(nearestStopIndex + 1) % routeStops.length],
    recordedAt,
    status: inService ? getTrackingStatus(recordedAt, now) : "OFFLINE",
  };
}

export function getSimulatedBusPositions(
  snapshot: FleetSnapshot,
  now = Date.now(),
  simulationStartedAt = now,
): SimulatedBusPosition[] {
  const busesById = new Map(snapshot.buses.map((bus) => [bus.id, bus]));
  const trackersById = new Map(snapshot.trackers.map((tracker) => [tracker.id, tracker]));
  const routesById = new Map(snapshot.routes.map((route) => [route.id, route]));
  const stopsById = new Map(snapshot.stops.map((stop) => [stop.id, stop]));
  const simulatedTrips = snapshot.trips.filter(
    (trip) => trip.direction === "outbound" || trip.direction === "homebound",
  );

  return simulatedTrips.flatMap((trip, tripIndex) => {
    const assignment = snapshot.tripAssignments.find((item) => item.tripId === trip.id);
    if (!assignment) return [];
    const route = routesById.get(trip.routeId);
    const tracker = trackersById.get(assignment.trackerId);
    const bus = busesById.get(assignment.busId);
    if (!route || !tracker || !bus) return [];
    const routeStops = route.stopIds.flatMap((stopId) => {
      const stop = stopsById.get(stopId);
      return stop ? [stop] : [];
    });
    if (routeStops.length < 2) return [];

    const telemetry = snapshot.gpsTelemetry
      .filter((item) => item.trackerId === tracker.id)
      .sort((left, right) => Date.parse(right.recordedAt) - Date.parse(left.recordedAt));
    const latestIngested = telemetry.find((item) => item.id.startsWith("gps-ingested-"));
    if (bus.status === "active" && tracker.status === "active" && latestIngested) {
      const activeAssignment = snapshot.tripAssignments.find((item) =>
        item.trackerId === tracker.id &&
        item.busId === bus.id &&
        snapshot.trips.some((candidate) => candidate.id === item.tripId && candidate.status === "in_progress"),
      );
      const recordedTripId = latestIngested.tripId ?? activeAssignment?.tripId;
      const recordedBusId = latestIngested.busId ?? tracker.busId ?? activeAssignment?.busId;
      if (recordedTripId !== trip.id || recordedBusId !== bus.id) return [];
      return [fromLastKnownLocation(
        trip.id,
        bus.id,
        tracker.id,
        route.id,
        routeStops,
        latestIngested,
        now,
        true,
      )];
    }
    const lastKnownLocation = bus.status !== "active" || tracker.status !== "active"
      ? telemetry[0]
      : undefined;
    if (lastKnownLocation) {
      return [fromLastKnownLocation(
        trip.id,
        bus.id,
        tracker.id,
        route.id,
        routeStops,
        lastKnownLocation,
        now,
        bus.status === "active" && tracker.status === "active",
      )];
    }
    if (bus.status !== "active" || tracker.status !== "active") return [];

    const recordedAt = trip.id === "trip-morning-02"
      ? Math.floor(
          (now - 45_000) / homeboundHeartbeatMilliseconds,
        ) * homeboundHeartbeatMilliseconds
      : now;
    const elapsed = Math.max(
      0,
      recordedAt - simulationStartedAt + tripIndex * 2 * 60_000,
    ) % (routeStops.length * segmentDurationMilliseconds);
    const segmentIndex = Math.floor(elapsed / segmentDurationMilliseconds);
    const progress =
      (elapsed % segmentDurationMilliseconds) / segmentDurationMilliseconds;
    const from = routeStops[segmentIndex];
    const nextStop = routeStops[(segmentIndex + 1) % routeStops.length];
    const trafficIndex = Math.floor(now / 60_000) % 3;
    const trafficConditions: TrafficCondition[] = ["light", "moderate", "heavy"];
    const traffic = trafficConditions[trafficIndex];
    const recordedAtDate = new Date(recordedAt);

    return [
      {
        busId: bus.id,
        trackerId: tracker.id,
        tripId: trip.id,
        routeId: route.id,
        latitude: interpolate(from.latitude, nextStop.latitude, progress),
        longitude: interpolate(from.longitude, nextStop.longitude, progress),
        speedKph: traffic === "heavy" ? 13 : traffic === "moderate" ? 19 : 26,
        traffic,
        segmentIndex,
        nextStop,
        recordedAt: recordedAtDate,
        status: getTrackingStatus(recordedAtDate, now),
      },
    ];
  });
}

export function stopsUntilDestination(
  routeStops: readonly Stop[],
  segmentIndex: number,
  destinationStopId: string,
): number {
  const destinationIndex = routeStops.findIndex((stop) => stop.id === destinationStopId);
  if (destinationIndex < 0 || routeStops.length === 0) return 1;
  const stopsAhead = (destinationIndex - segmentIndex + routeStops.length) % routeStops.length;
  return Math.max(1, stopsAhead);
}
