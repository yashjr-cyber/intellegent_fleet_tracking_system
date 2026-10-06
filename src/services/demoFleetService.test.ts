import { describe, expect, it } from "vitest";
import { DemoFleetService, demoSnapshot, type DemoSnapshotStorage } from "./demoFleetService";
import { getSimulatedBusPositions } from "./simulatedTrackingService";
import type { GpsTelemetryPayload, IntegrationEvent, LoRaHealthPayload, RfidTapPayload } from "../types/models";

class MemoryStorage implements DemoSnapshotStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

function rfidEvent(overrides: Partial<RfidTapPayload> = {}): IntegrationEvent<RfidTapPayload> {
  return {
    eventId: "event-rfid-1",
    eventType: "rfid.tap.v1",
    schemaVersion: 1,
    timestamp: new Date().toISOString(),
    source: { kind: "device", deviceId: "demo-reader-library", adapter: "test-adapter" },
    idempotencyKey: "reader-1:sequence-42",
    payload: {
      cardNumber: "DEMO-RFID-018",
      readerId: "reader-library",
      tripId: "trip-morning-01",
      stopId: "stop-library",
      eventType: "boarded",
      ...overrides,
    },
  };
}

describe("DemoFleetService", () => {
  it("persists shared changes between service instances while keeping route and assignment separate", async () => {
    const storage = new MemoryStorage();
    const first = new DemoFleetService(storage);
    const routeBefore = (await first.getSnapshot()).trips.find((trip) => trip.id === "trip-next-01")?.routeId;
    const trip = await first.createTrip({
      routeId: "route-north",
      scheduledDate: "2099-05-01",
      scheduledStart: "10:00",
      scheduledEnd: "10:30",
      direction: "outbound",
      status: "scheduled",
    });
    await first.assignTrip({ tripId: trip.id, busId: "bus-cascade", trackerId: "tracker-22", driverId: "driver-rohan" });

    const second = new DemoFleetService(storage);
    const snapshot = await second.getSnapshot();
    expect(snapshot.trips.find((item) => item.id === "trip-next-01")?.routeId).toBe(routeBefore);
    expect(snapshot.tripAssignments.find((item) => item.tripId === trip.id)).toMatchObject({
      busId: "bus-cascade",
      trackerId: "tracker-22",
      driverId: "driver-rohan",
    });
  });

  it("upgrades a saved student-only snapshot to the current shared schema", async () => {
    const storage = new MemoryStorage();
    const legacy = JSON.parse(JSON.stringify(demoSnapshot)) as Record<string, unknown>;
    delete legacy.loraGateways;
    delete legacy.ingestionAudit;
    delete legacy.driverIncidents;
    delete legacy.tripLifecycleEvents;
    legacy.loraNodes = [
      { id: "lora-library", name: "Library node", stopId: "stop-library", status: "active", lastSeenAt: new Date().toISOString() },
    ];
    storage.setItem("wayfinder.demo-fleet.v1", JSON.stringify(legacy));

    const snapshot = await new DemoFleetService(storage).getSnapshot();
    expect(snapshot.trips.find((trip) => trip.id === "trip-morning-01")?.direction).toBe("outbound");
    expect(snapshot.loraGateways).toHaveLength(1);
    expect(snapshot.loraNodes.find((node) => node.id === "lora-reader-library")).toMatchObject({
      gatewayId: "gateway-northstar",
      readerId: "reader-library",
    });
    expect(snapshot.tripLifecycleEvents).toEqual([]);
  });

  it("reassigns a scheduled trip to free resources without changing its route", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    const initial = await service.getSnapshot();
    const routeId = initial.trips.find((trip) => trip.id === "trip-homebound-01")?.routeId;
    await service.assignTrip({
      tripId: "trip-homebound-01",
      busId: "bus-cascade",
      trackerId: "tracker-spare",
      driverId: "driver-rohan",
    });
    const updated = await service.getSnapshot();
    expect(updated.trips.find((trip) => trip.id === "trip-homebound-01")?.routeId).toBe(routeId);
    expect(updated.tripAssignments.find((item) => item.tripId === "trip-homebound-01")).toMatchObject({
      busId: "bus-cascade",
      trackerId: "tracker-spare",
      driverId: "driver-rohan",
    });
  });

  it("rejects assignments that overlap on a bus", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    const snapshot = await service.getSnapshot();
    const currentTrip = snapshot.trips.find((item) => item.id === "trip-morning-01");
    if (!currentTrip) throw new Error("Fixture active trip is missing.");
    const windowStart = new Date(`${currentTrip.scheduledDate}T${currentTrip.scheduledStart}:00`);
    const windowEnd = new Date(`${currentTrip.scheduledDate}T${currentTrip.scheduledEnd}:00`);
    const tripStart = new Date(Math.max(Date.now(), windowStart.getTime() + 60_000));
    const tripEnd = new Date(Math.min(windowEnd.getTime(), tripStart.getTime() + 5 * 60_000));
    const formatClock = (date: Date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    const trip = await service.createTrip({
      routeId: "route-north",
      scheduledDate: currentTrip.scheduledDate,
      scheduledStart: formatClock(tripStart),
      scheduledEnd: formatClock(tripEnd),
      direction: "outbound",
      status: "scheduled",
    });
    await expect(service.assignTrip({
      tripId: trip.id,
      busId: "bus-aurora",
      trackerId: "tracker-17",
      driverId: "driver-mira",
    })).rejects.toThrow("overlapping trip");
  });

  it("records a valid RFID tap once and audits a duplicate", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    const before = (await service.getSnapshot()).attendanceEvents.length;
    expect(await service.recordRfidTap(rfidEvent())).toBe("accepted");
    expect(await service.recordRfidTap(rfidEvent())).toBe("duplicate");
    const snapshot = await service.getSnapshot();
    expect(snapshot.attendanceEvents).toHaveLength(before + 1);
    expect(snapshot.ingestionAudit.map((event) => event.status)).toEqual(["duplicate", "accepted"]);
  });

  it("rejects invalid RFID event payloads without altering the attendance ledger", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    const before = (await service.getSnapshot()).attendanceEvents.length;
    const status = await service.recordRfidTap(rfidEvent({ stopId: "stop-not-on-route" }));
    expect(status).toBe("rejected");
    const snapshot = await service.getSnapshot();
    expect(snapshot.attendanceEvents).toHaveLength(before);
    expect(snapshot.ingestionAudit[0]?.status).toBe("rejected");
  });

  it("enforces the driver trip lifecycle and stores its audit trail", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    await expect(service.pauseTrip("trip-next-01")).rejects.toThrow("Cannot paused a scheduled trip");
    await service.startTrip("trip-next-01");
    await service.pauseTrip("trip-next-01");
    await service.resumeTrip("trip-next-01");
    await service.endTrip("trip-next-01");
    const snapshot = await service.getSnapshot();
    expect(snapshot.trips.find((trip) => trip.id === "trip-next-01")?.status).toBe("completed");
    expect(snapshot.tripLifecycleEvents.filter((event) => event.tripId === "trip-next-01").map((event) => event.type)).toEqual([
      "started", "paused", "resumed", "ended",
    ]);
  });

  it("validates, deduplicates and preserves the freshness timestamp of GPS messages", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    const eventId = "gps-sequence-51";
    const event: IntegrationEvent<GpsTelemetryPayload> = {
      eventId,
      eventType: "gps.telemetry.v1",
      schemaVersion: 1,
      timestamp: new Date(Date.now() - 180_000).toISOString(),
      source: { kind: "simulator", deviceId: "DEMO-GPS-017", adapter: "test-gps-adapter" },
      idempotencyKey: eventId,
      payload: { tripId: "trip-morning-01", trackerId: "tracker-17", busId: "bus-aurora", latitude: 12.972, longitude: 77.596, speedKph: 12 },
    };
    expect(await service.recordGpsTelemetry(event)).toBe("accepted");
    expect(await service.recordGpsTelemetry(event)).toBe("duplicate");
    const snapshot = await service.getSnapshot();
    expect(snapshot.gpsTelemetry[0]?.id.startsWith("gps-ingested-")).toBe(true);
    expect(snapshot.trackers.find((tracker) => tracker.id === "tracker-17")?.lastSeenAt).toBe(event.timestamp);
    const positions = getSimulatedBusPositions(snapshot);
    expect(positions.find((position) => position.tripId === "trip-morning-01")?.status).toBe("OFFLINE");
    expect(positions.some((position) => position.tripId === "trip-homebound-01")).toBe(false);
  });

  it("validates LoRa node health against its gateway association", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    const event: IntegrationEvent<LoRaHealthPayload> = {
      eventId: "lora-sequence-12",
      eventType: "lora.health.v1",
      schemaVersion: 1,
      timestamp: new Date().toISOString(),
      source: { kind: "device", deviceId: "demo-reader-garden", adapter: "test-radio-adapter" },
      idempotencyKey: "lora-sequence-12",
      payload: { nodeId: "lora-reader-garden", gatewayId: "gateway-northstar", status: "active", batteryPercent: 58, rssiDbm: -74, snrDb: 5.1 },
    };
    expect(await service.recordLoraHealth(event)).toBe("accepted");
    const snapshot = await service.getSnapshot();
    expect(snapshot.loraNodes.find((node) => node.id === "lora-reader-garden")?.batteryPercent).toBe(58);
  });

  it("keeps a manually offline tracker's last location explicitly offline", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    await service.updateTrackerStatus("tracker-22", "inactive");
    const snapshot = await service.getSnapshot();
    const position = getSimulatedBusPositions(snapshot).find((item) => item.tripId === "trip-morning-02");
    expect(position?.status).toBe("OFFLINE");
    expect(position?.recordedAt.toISOString()).toBe("2026-10-06T02:59:00.000Z");
  });

  it("keeps legacy unassociated GPS telemetry on the active assigned trip only", () => {
    const snapshot = structuredClone(demoSnapshot);
    snapshot.gpsTelemetry = [{
      id: "gps-ingested-legacy",
      trackerId: "tracker-17",
      latitude: 12.9719,
      longitude: 77.5948,
      speedKph: 13,
      recordedAt: new Date().toISOString(),
    }];

    const positions = getSimulatedBusPositions(snapshot);
    expect(positions.find((position) => position.tripId === "trip-morning-01")?.status).toBe("LIVE");
    expect(positions.some((position) => position.tripId === "trip-next-01")).toBe(false);
    expect(positions.some((position) => position.tripId === "trip-homebound-01")).toBe(false);
  });
});
