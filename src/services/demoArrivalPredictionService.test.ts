import { describe, expect, it } from "vitest";
import { demoArrivalPredictionService } from "./demoArrivalPredictionService";
import {
  getAlertDeduplicationKey,
  etaChangedMaterially,
  isEveningAlertSettings,
} from "./arrivalAlertUtils";
import { getTrackingStatus } from "./trackingStatus";
import { getSimulatedBusPositions, stopsUntilDestination } from "./simulatedTrackingService";
import { demoFleetService } from "./demoFleetService";

const destination = {
  id: "stop-destination",
  name: "Destination",
  shortName: "Destination",
  latitude: 12.9762,
  longitude: 77.6014,
  sequence: 2,
};

describe("prototype arrival predictions", () => {
  const input = {
    latitude: 12.9719,
    longitude: 77.5948,
    destination,
    stopsRemaining: 1,
    historicalMinutesPerStop: [6, 8, 7],
    currentTime: new Date("2026-10-06T08:00:00"),
    isWeekday: true,
    traffic: "moderate" as const,
  };

  it("returns a bounded prediction and arrival time from route, distance, and historical inputs", () => {
    const prediction = demoArrivalPredictionService.predict(input);

    expect(prediction.minutes).toBeGreaterThan(0);
    expect(prediction.distanceKm).toBeGreaterThan(0);
    expect(prediction.range.earliestMinutes).toBeLessThanOrEqual(prediction.minutes);
    expect(prediction.range.latestMinutes).toBeGreaterThanOrEqual(prediction.minutes);
    expect(prediction.arrivalAt.getTime()).toBe(
      input.currentTime.getTime() + prediction.minutes * 60_000,
    );
  });

  it("accounts for busier conditions and rush-hour travel time", () => {
    const clearOffPeak = demoArrivalPredictionService.predict({
      ...input,
      currentTime: new Date("2026-10-06T11:00:00"),
      traffic: "light",
    });
    const busyRushHour = demoArrivalPredictionService.predict({
      ...input,
      traffic: "heavy",
    });

    expect(busyRushHour.minutes).toBeGreaterThan(clearOffPeak.minutes);
  });
});

describe("tracking freshness", () => {
  const now = Date.parse("2026-10-06T08:00:00Z");

  it("never labels stale or missing tracker updates as live", () => {
    expect(getTrackingStatus(new Date(now - 25_000), now)).toBe("LIVE");
    expect(getTrackingStatus(new Date(now - 60_000), now)).toBe("STALE");
    expect(getTrackingStatus(new Date(now - 150_000), now)).toBe("OFFLINE");
    expect(getTrackingStatus("not-a-date", now)).toBe("OFFLINE");
  });
});

describe("simulated map positions", () => {
  it("interpolates demo bus coordinates and resolves an assigned stop ahead", async () => {
    const snapshot = await demoFleetService.getSnapshot();
    const startedAt = 1_800_000_000_000;
    const positions = getSimulatedBusPositions(snapshot, startedAt + 60_000, startedAt);
    const aurora = positions.find((position) => position.busId === "bus-aurora");
    const route = snapshot.routes.find((item) => item.id === aurora?.routeId);
    const routeStops = snapshot.stops.filter((stop) => route?.stopIds.includes(stop.id));

    expect(positions).toHaveLength(5);
    expect(aurora?.latitude).toBeGreaterThan(12.9719);
    expect(aurora?.longitude).toBeGreaterThan(77.5948);
    expect(
      positions.find((position) => position.tripId === "trip-homebound-01")?.status,
    ).toBe("LIVE");
    expect(
      stopsUntilDestination(routeStops, aurora?.segmentIndex ?? 0, "stop-residences"),
    ).toBe(1);
  });

  it("labels delayed garden-route telemetry stale and then offline without calling it live", async () => {
    const snapshot = await demoFleetService.getSnapshot();
    const startedAt = 1_800_000_000_000;
    const positions = getSimulatedBusPositions(snapshot, startedAt + 60_000, startedAt);
    const homebound = positions.find(
      (position) => position.tripId === "trip-homebound-01",
    );
    const staleGarden = positions.find(
      (position) => position.tripId === "trip-morning-02",
    );
    const laterPositions = getSimulatedBusPositions(
      snapshot,
      startedAt + 300_001,
      startedAt,
    );
    const freshHomebound = laterPositions.find(
      (position) => position.tripId === "trip-homebound-01",
    );
    const offlineGarden = laterPositions.find(
      (position) => position.tripId === "trip-morning-02",
    );

    expect(homebound?.status).toBe("LIVE");
    expect(staleGarden?.status).toBe("STALE");
    expect(freshHomebound?.status).toBe("LIVE");
    expect(offlineGarden?.status).toBe("OFFLINE");
  });
});

describe("arrival alert helpers", () => {
  it("deduplicates a trip and pickup on the same day but allows the next day", () => {
    const first = getAlertDeduplicationKey(
      "trip-homebound-01",
      "stop-garden",
      new Date(2026, 9, 6),
    );
    const sameDay = getAlertDeduplicationKey(
      "trip-homebound-01",
      "stop-garden",
      new Date(2026, 9, 6, 18),
    );
    const nextDay = getAlertDeduplicationKey(
      "trip-homebound-01",
      "stop-garden",
      new Date(2026, 9, 7),
    );

    expect(first).toBe(sameDay);
    expect(first).not.toBe(nextDay);
  });

  it("recalculates an alert after a material ETA change", () => {
    expect(etaChangedMaterially(12, 10)).toBe(true);
    expect(etaChangedMaterially(12, 11)).toBe(false);
    expect(etaChangedMaterially(null, 11)).toBe(true);
  });

  it("accepts supported lead times and rejects invalid saved preferences", () => {
    expect(isEveningAlertSettings({
      enabled: true,
      tripId: "trip-homebound-01",
      pickupStopId: "stop-library",
      dropStopId: "stop-residences",
      leadMinutes: 15,
    })).toBe(true);
    expect(isEveningAlertSettings({
      enabled: true,
      tripId: "trip-homebound-01",
      pickupStopId: "stop-library",
      dropStopId: "stop-residences",
      leadMinutes: 12,
    })).toBe(false);
  });
});
