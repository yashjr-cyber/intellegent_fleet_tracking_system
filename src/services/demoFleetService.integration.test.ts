import { describe, expect, it } from "vitest";
import { DemoFleetService, type DemoSnapshotStorage } from "./demoFleetService";
import type {
  GpsTelemetryPayload,
  IntegrationEvent,
  LoRaHealthPayload,
  RfidTapPayload,
} from "../types/models";

class MemoryStorage implements DemoSnapshotStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

function gpsEvent(
  payload: Partial<GpsTelemetryPayload> = {},
  overrides: Partial<IntegrationEvent<GpsTelemetryPayload>> = {},
): IntegrationEvent<GpsTelemetryPayload> {
  const eventId = overrides.eventId ?? `gps-${Math.random()}`;
  return {
    eventId,
    eventType: "gps.telemetry.v1",
    schemaVersion: 1,
    timestamp: new Date().toISOString(),
    source: { kind: "device", deviceId: "DEMO-GPS-017", adapter: "test-gps-adapter" },
    idempotencyKey: eventId,
    ...overrides,
    payload: {
      tripId: "trip-morning-01",
      trackerId: "tracker-17",
      busId: "bus-aurora",
      latitude: 13.16,
      longitude: 80.3,
      speedKph: 18,
      ...payload,
    },
  };
}

function loraEvent(
  payload: Partial<LoRaHealthPayload> = {},
  overrides: Partial<IntegrationEvent<LoRaHealthPayload>> = {},
): IntegrationEvent<LoRaHealthPayload> {
  const eventId = overrides.eventId ?? `lora-${Math.random()}`;
  return {
    eventId,
    eventType: "lora.health.v1",
    schemaVersion: 1,
    timestamp: new Date().toISOString(),
    source: { kind: "device", deviceId: "demo-reader-library", adapter: "test-radio-adapter" },
    idempotencyKey: eventId,
    ...overrides,
    payload: {
      nodeId: "lora-reader-library",
      gatewayId: "gateway-rec-south",
      status: "active",
      batteryPercent: 80,
      rssiDbm: -70,
      snrDb: 7,
      ...payload,
    },
  };
}

function rfidEvent(
  payload: Partial<RfidTapPayload> = {},
  overrides: Partial<IntegrationEvent<RfidTapPayload>> = {},
): IntegrationEvent<RfidTapPayload> {
  const eventId = overrides.eventId ?? `rfid-${Math.random()}`;
  return {
    eventId,
    eventType: "rfid.tap.v1",
    schemaVersion: 1,
    timestamp: new Date().toISOString(),
    source: { kind: "device", deviceId: "demo-reader-library", adapter: "test-reader-adapter" },
    idempotencyKey: eventId,
    ...overrides,
    payload: {
      cardNumber: "DEMO-RFID-018",
      readerId: "reader-library",
      tripId: "trip-morning-01",
      stopId: "stop-r1-thiruvottiyur",
      eventType: "boarded",
      ...payload,
    },
  };
}

describe("integration event boundary validation", () => {
  it.each([
    ["latitude below range", { latitude: -90.01 }],
    ["latitude above range", { latitude: 90.01 }],
    ["longitude below range", { longitude: -180.01 }],
    ["longitude above range", { longitude: 180.01 }],
    ["negative speed", { speedKph: -0.01 }],
    ["speed above range", { speedKph: 180.01 }],
    ["non-finite speed", { speedKph: Number.NaN }],
  ])("rejects GPS telemetry with %s", async (_label, payload) => {
    const service = new DemoFleetService(new MemoryStorage());

    expect(await service.recordGpsTelemetry(gpsEvent(payload))).toBe("rejected");
    const snapshot = await service.getSnapshot();
    expect(snapshot.gpsTelemetry.filter((item) => item.id.startsWith("gps-ingested-"))).toHaveLength(0);
    expect(snapshot.ingestionAudit[0]?.status).toBe("rejected");
  });

  it("rejects GPS events with the wrong event type, source, or an implausibly future timestamp", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    const wrongType = gpsEvent({}, { eventType: "gps.unknown.v1" });
    const gatewaySource = gpsEvent({}, {
      source: { kind: "gateway", deviceId: "gateway-rec-south", adapter: "test-gps-adapter" },
    });
    const futureEvent = gpsEvent({}, {
      timestamp: new Date(Date.now() + 6 * 60_000).toISOString(),
    });

    expect(await service.recordGpsTelemetry(wrongType)).toBe("rejected");
    expect(await service.recordGpsTelemetry(gatewaySource)).toBe("rejected");
    expect(await service.recordGpsTelemetry(futureEvent)).toBe("rejected");
  });

  it("rejects GPS telemetry from inactive or incorrectly assigned trackers", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    const wrongAssignment = gpsEvent({ busId: "bus-cascade" });
    await service.pauseTrip("trip-morning-01");
    await service.updateTrackerStatus("tracker-17", "inactive");

    expect(await service.recordGpsTelemetry(wrongAssignment)).toBe("rejected");
    expect(await service.recordGpsTelemetry(gpsEvent())).toBe("rejected");
    expect((await service.getSnapshot()).gpsTelemetry.filter((item) => item.id.startsWith("gps-ingested-"))).toHaveLength(0);
  });

  it.each([
    ["battery below range", { batteryPercent: -1 }],
    ["battery above range", { batteryPercent: 101 }],
    ["RSSI below range", { rssiDbm: -151 }],
    ["RSSI above range", { rssiDbm: 1 }],
    ["SNR below range", { snrDb: -31 }],
    ["SNR above range", { snrDb: 31 }],
  ])("rejects LoRa health with %s", async (_label, payload) => {
    const service = new DemoFleetService(new MemoryStorage());

    expect(await service.recordLoraHealth(loraEvent(payload))).toBe("rejected");
    const snapshot = await service.getSnapshot();
    expect(snapshot.loraNodes.find((node) => node.id === "lora-reader-library")?.batteryPercent).toBe(87);
    expect(snapshot.ingestionAudit[0]?.status).toBe("rejected");
  });

  it("rejects LoRa health with an unknown node or inactive gateway", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    await service.updateGatewayStatus("gateway-rec-south", "inactive");

    expect(await service.recordLoraHealth(loraEvent())).toBe("rejected");
    expect(await service.recordLoraHealth(loraEvent({ nodeId: "unknown-node" }))).toBe("rejected");
  });

  it("does not add RFID attendance for an unknown card or an unsupported event type", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    const before = (await service.getSnapshot()).attendanceEvents.length;

    expect(await service.recordRfidTap(rfidEvent({ cardNumber: "UNKNOWN-CARD" }))).toBe("rejected");
    expect(await service.recordRfidTap(rfidEvent({}, { eventType: "rfid.unknown.v1" }))).toBe("rejected");
    expect((await service.getSnapshot()).attendanceEvents).toHaveLength(before);
  });

  it("keeps device-event identifiers idempotent across repeated GPS and LoRa messages", async () => {
    const service = new DemoFleetService(new MemoryStorage());
    const gps = gpsEvent({}, { eventId: "stable-gps-event", idempotencyKey: "device-17:42" });
    const lora = loraEvent({}, { eventId: "stable-lora-event", idempotencyKey: "reader-library:42" });

    expect(await service.recordGpsTelemetry(gps)).toBe("accepted");
    expect(await service.recordGpsTelemetry(gps)).toBe("duplicate");
    expect(await service.recordLoraHealth(lora)).toBe("accepted");
    expect(await service.recordLoraHealth(lora)).toBe("duplicate");
    const snapshot = await service.getSnapshot();
    expect(snapshot.gpsTelemetry.filter((item) => item.id.startsWith("gps-ingested-"))).toHaveLength(1);
    expect(snapshot.ingestionAudit.filter((item) => item.status === "duplicate")).toHaveLength(2);
  });
});
