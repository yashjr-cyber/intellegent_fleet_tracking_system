import type { FleetService } from "./FleetService";
import type {
  DriverIncident,
  FleetSnapshot,
  GpsTelemetryPayload,
  IntegrationEvent,
  LoRaHealthPayload,
  RfidTapPayload,
  Route,
  Trip,
  TripAssignment,
} from "../types/models";

export const demoSnapshot: FleetSnapshot = {
  routes: [
    {
      id: "route-north",
      name: "North loop",
      code: "N-01",
      stopIds: ["stop-library", "stop-residences", "stop-gate"],
      estimatedDurationMinutes: 28,
      status: "active",
    },
    {
      id: "route-garden",
      name: "Garden district",
      code: "G-02",
      stopIds: ["stop-garden", "stop-library", "stop-gate"],
      estimatedDurationMinutes: 34,
      status: "active",
    },
  ],
  trips: [
    {
      id: "trip-morning-01",
      routeId: "route-north",
      scheduledStart: "08:15",
      scheduledEnd: "08:43",
      status: "in_progress",
      direction: "outbound",
    },
    {
      id: "trip-morning-02",
      routeId: "route-garden",
      scheduledStart: "09:00",
      scheduledEnd: "09:34",
      status: "scheduled",
      direction: "outbound",
    },
    {
      id: "trip-next-01",
      routeId: "route-north",
      scheduledStart: "09:25",
      scheduledEnd: "09:53",
      status: "scheduled",
      direction: "outbound",
    },
    {
      id: "trip-homebound-01",
      routeId: "route-north",
      scheduledStart: "17:15",
      scheduledEnd: "17:49",
      status: "scheduled",
      direction: "homebound",
    },
    {
      id: "trip-cedar-maintenance-01",
      routeId: "route-garden",
      scheduledStart: "06:30",
      scheduledEnd: "07:04",
      status: "completed",
      direction: "outbound",
      scheduledDate: "2026-10-05",
    },
  ],
  buses: [
    {
      id: "bus-aurora",
      registration: "DEMO-101",
      label: "Aurora",
      capacity: 42,
      status: "active",
    },
    {
      id: "bus-cascade",
      registration: "DEMO-204",
      label: "Cascade",
      capacity: 36,
      status: "active",
    },
    {
      id: "bus-cedar",
      registration: "DEMO-308",
      label: "Cedar",
      capacity: 40,
      status: "maintenance",
    },
  ],
  trackers: [
    {
      id: "tracker-17",
      serialNumber: "DEMO-GPS-017",
      busId: "bus-aurora",
      status: "active",
      lastSeenAt: "2026-10-06T08:31:00+05:30",
    },
    {
      id: "tracker-22",
      serialNumber: "DEMO-GPS-022",
      busId: "bus-cascade",
      status: "active",
      lastSeenAt: "2026-10-06T08:29:00+05:30",
    },
    {
      id: "tracker-spare",
      serialNumber: "DEMO-GPS-031",
      busId: null,
      status: "active",
      lastSeenAt: "2026-10-06T08:12:00+05:30",
    },
    {
      id: "tracker-cedar",
      serialNumber: "DEMO-GPS-044",
      busId: "bus-cedar",
      status: "inactive",
      lastSeenAt: "2026-10-05T07:06:00+05:30",
    },
  ],
  drivers: [
    {
      id: "driver-mira",
      name: "Mira Sen",
      email: "mira.sen@example.test",
      phone: "+91 90000 10001",
      status: "active",
    },
    {
      id: "driver-rohan",
      name: "Rohan Das",
      email: "rohan.das@example.test",
      phone: "+91 90000 10002",
      status: "active",
    },
  ],
  students: [
    {
      id: "student-anaya",
      name: "Anaya Rao",
      email: "anaya.rao@example.test",
      studentNumber: "DEMO-24018",
      stopId: "stop-residences",
    },
    {
      id: "student-isha",
      name: "Isha Menon",
      email: "isha.menon@example.test",
      studentNumber: "DEMO-24106",
      stopId: "stop-garden",
    },
    {
      id: "student-kabir",
      name: "Kabir Shah",
      email: "kabir.shah@example.test",
      studentNumber: "DEMO-24231",
      stopId: "stop-library",
    },
  ],
  stops: [
    {
      id: "stop-library",
      name: "Founders Library",
      shortName: "Library",
      latitude: 12.9719,
      longitude: 77.5948,
      sequence: 1,
    },
    {
      id: "stop-residences",
      name: "North Residences",
      shortName: "Residences",
      latitude: 12.9762,
      longitude: 77.6014,
      sequence: 2,
    },
    {
      id: "stop-garden",
      name: "Garden Quarter",
      shortName: "Garden",
      latitude: 12.9681,
      longitude: 77.6071,
      sequence: 1,
    },
    {
      id: "stop-gate",
      name: "East Campus Gate",
      shortName: "East gate",
      latitude: 12.9648,
      longitude: 77.5972,
      sequence: 3,
    },
  ],
  rfidCards: [
    {
      id: "card-anaya",
      studentId: "student-anaya",
      cardNumber: "DEMO-RFID-018",
      status: "active",
    },
    {
      id: "card-isha",
      studentId: "student-isha",
      cardNumber: "DEMO-RFID-106",
      status: "active",
    },
  ],
  attendanceEvents: [
    {
      id: "event-anaya",
      studentId: "student-anaya",
      tripId: "trip-morning-01",
      cardId: "card-anaya",
      stopId: "stop-residences",
      eventType: "boarded",
      occurredAt: "2026-10-06T08:21:00+05:30",
      readerId: "reader-residences",
      source: "simulated",
      eventStatus: "recorded",
    },
    {
      id: "event-isha",
      studentId: "student-isha",
      tripId: "trip-morning-02",
      cardId: "card-isha",
      stopId: "stop-garden",
      eventType: "boarded",
      occurredAt: "2026-10-06T08:27:00+05:30",
      readerId: "reader-garden",
      source: "simulated",
      eventStatus: "recorded",
    },
  ],
  gpsTelemetry: [
    {
      id: "gps-aurora-now",
      trackerId: "tracker-17",
      latitude: 12.9738,
      longitude: 77.5984,
      speedKph: 24,
      recordedAt: "2026-10-06T08:31:00+05:30",
    },
    {
      id: "gps-cascade-now",
      trackerId: "tracker-22",
      latitude: 12.9702,
      longitude: 77.6031,
      speedKph: 18,
      recordedAt: "2026-10-06T08:29:00+05:30",
    },
    {
      id: "gps-cedar-last-seen",
      trackerId: "tracker-cedar",
      latitude: 12.9693,
      longitude: 77.6038,
      speedKph: 0,
      recordedAt: "2026-10-05T07:06:00+05:30",
    },
  ],
  loraNodes: [
    {
      id: "lora-reader-library",
      name: "Library reader",
      stopId: "stop-library",
      status: "active",
      lastSeenAt: "2026-10-06T08:30:00+05:30",
      parentNodeId: "lora-relay-north",
      gatewayId: "gateway-northstar",
      batteryPercent: 87,
      rssiDbm: -61,
      snrDb: 9.4,
      deviceId: "demo-reader-library",
      readerId: "reader-library",
    },
    {
      id: "lora-relay-north",
      name: "North relay",
      stopId: "stop-residences",
      status: "active",
      lastSeenAt: "2026-10-06T08:30:00+05:30",
      parentNodeId: "lora-relay-east",
      gatewayId: "gateway-northstar",
      batteryPercent: 74,
      rssiDbm: -72,
      snrDb: 6.2,
      deviceId: "demo-relay-north",
    },
    {
      id: "lora-relay-east",
      name: "East relay",
      stopId: "stop-garden",
      status: "active",
      lastSeenAt: "2026-10-06T08:30:00+05:30",
      parentNodeId: null,
      gatewayId: "gateway-northstar",
      batteryPercent: 92,
      rssiDbm: -66,
      snrDb: 8.1,
      deviceId: "demo-relay-east",
    },
    {
      id: "lora-reader-garden",
      name: "Garden reader",
      stopId: "stop-garden",
      status: "active",
      lastSeenAt: "2026-10-06T08:30:00+05:30",
      parentNodeId: "lora-relay-east",
      gatewayId: "gateway-northstar",
      batteryPercent: 63,
      rssiDbm: -78,
      snrDb: 4.6,
      deviceId: "demo-reader-garden",
      readerId: "reader-garden",
    },
  ],
  loraGateways: [
    {
      id: "gateway-northstar",
      name: "Northstar campus gateway",
      status: "active",
      lastSeenAt: "2026-10-06T08:30:00+05:30",
      backendConnected: true,
    },
  ],
  notifications: [
    {
      id: "notice-arrival",
      recipientId: "student-anaya",
      title: "Your bus is nearby",
      message: "Aurora is a few minutes from North Residences.",
      createdAt: "2026-10-06T08:29:00+05:30",
      read: false,
    },
    {
      id: "notice-route",
      recipientId: "student-isha",
      title: "A calm start to your day",
      message: "Garden Quarter pickup is running to schedule.",
      createdAt: "2026-10-06T08:25:00+05:30",
      read: true,
    },
  ],
  tripAssignments: [
    {
      id: "assignment-01",
      tripId: "trip-morning-01",
      busId: "bus-aurora",
      trackerId: "tracker-17",
      driverId: "driver-mira",
      assignedAt: "2026-10-06T07:45:00+05:30",
    },
    {
      id: "assignment-02",
      tripId: "trip-morning-02",
      busId: "bus-cascade",
      trackerId: "tracker-22",
      driverId: "driver-rohan",
      assignedAt: "2026-10-06T08:00:00+05:30",
    },
    {
      id: "assignment-next-01",
      tripId: "trip-next-01",
      busId: "bus-aurora",
      trackerId: "tracker-17",
      driverId: "driver-mira",
      assignedAt: "2026-10-06T07:45:00+05:30",
    },
    {
      id: "assignment-homebound-01",
      tripId: "trip-homebound-01",
      busId: "bus-aurora",
      trackerId: "tracker-17",
      driverId: "driver-mira",
      assignedAt: "2026-10-06T07:45:00+05:30",
    },
    {
      id: "assignment-cedar-01",
      tripId: "trip-cedar-maintenance-01",
      busId: "bus-cedar",
      trackerId: "tracker-cedar",
      driverId: "driver-rohan",
      assignedAt: "2026-10-05T06:15:00+05:30",
    },
  ],
  ingestionAudit: [],
  driverIncidents: [],
  tripLifecycleEvents: [],
};

const clone = <T,>(value: T): T => structuredClone(value);

function scheduledTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

const snapshotStorageKey = "wayfinder.demo-fleet.v1";
const snapshotUpdatedEvent = "wayfinder:demo-fleet-updated";

export interface DemoSnapshotStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function browserStorage(): DemoSnapshotStorage | null {
  if (typeof window === "undefined") return null;
  return {
    getItem(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        throw new Error("Browser storage is unavailable. Enable local storage and refresh.");
      }
    },
    setItem(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        throw new Error("Browser storage is unavailable. Enable local storage and try again.");
      }
    },
  };
}

function mergeRecords<T extends { id: string }>(value: unknown, defaults: readonly T[]): T[] | null {
  if (value !== undefined && (!Array.isArray(value) || value.some((item) => !item || typeof item.id !== "string"))) {
    return null;
  }
  const records = clone((value ?? []) as T[]);
  const ids = new Set(records.map((item) => item.id));
  return [...records, ...clone(defaults.filter((item) => !ids.has(item.id)))];
}

function normalizeSnapshot(value: unknown): FleetSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<FleetSnapshot>;
  const coreKeys = [
    "routes", "trips", "buses", "trackers", "drivers", "students", "stops",
    "rfidCards", "attendanceEvents", "gpsTelemetry", "loraNodes", "notifications",
    "tripAssignments",
  ] as const;
  if (!coreKeys.every((key) => Array.isArray(candidate[key]))) return null;

  const routes = mergeRecords(candidate.routes, demoSnapshot.routes);
  const trips = mergeRecords(candidate.trips, demoSnapshot.trips);
  const buses = mergeRecords(candidate.buses, demoSnapshot.buses);
  const trackers = mergeRecords(candidate.trackers, demoSnapshot.trackers);
  const drivers = mergeRecords(candidate.drivers, demoSnapshot.drivers);
  const students = mergeRecords(candidate.students, demoSnapshot.students);
  const stops = mergeRecords(candidate.stops, demoSnapshot.stops);
  const rfidCards = mergeRecords(candidate.rfidCards, demoSnapshot.rfidCards);
  const attendanceEvents = mergeRecords(candidate.attendanceEvents, demoSnapshot.attendanceEvents);
  const gpsTelemetry = mergeRecords(candidate.gpsTelemetry, demoSnapshot.gpsTelemetry);
  const notifications = mergeRecords(candidate.notifications, demoSnapshot.notifications);
  const tripAssignments = mergeRecords(candidate.tripAssignments, demoSnapshot.tripAssignments);
  const ingestionAudit = mergeRecords(candidate.ingestionAudit, []);
  const driverIncidents = mergeRecords(candidate.driverIncidents, []);
  const tripLifecycleEvents = mergeRecords(candidate.tripLifecycleEvents, []);
  const gatewayDefaults = mergeRecords(candidate.loraGateways, demoSnapshot.loraGateways);
  const rawNodes = Array.isArray(candidate.loraNodes) ? candidate.loraNodes.map((node) => {
    if (!node || typeof node !== "object" || typeof node.id !== "string") return node;
    const legacyId = node.id === "lora-library" ? "lora-reader-library" : node.id === "lora-garden" ? "lora-reader-garden" : node.id;
    const seeded = demoSnapshot.loraNodes.find((item) => item.id === legacyId);
    return {
      ...seeded,
      ...node,
      id: legacyId,
      parentNodeId: node.parentNodeId ?? seeded?.parentNodeId ?? null,
      gatewayId: node.gatewayId ?? seeded?.gatewayId ?? demoSnapshot.loraGateways[0]?.id,
      batteryPercent: node.batteryPercent ?? seeded?.batteryPercent,
      rssiDbm: node.rssiDbm ?? seeded?.rssiDbm,
      snrDb: node.snrDb ?? seeded?.snrDb,
      deviceId: node.deviceId ?? seeded?.deviceId ?? `migrated-${legacyId}`,
      readerId: node.readerId ?? seeded?.readerId,
    };
  }) : null;
  const loraNodes = mergeRecords(rawNodes, demoSnapshot.loraNodes);
  if (!routes || !trips || !buses || !trackers || !drivers || !students || !stops ||
    !rfidCards || !attendanceEvents || !gpsTelemetry || !notifications || !tripAssignments ||
    !ingestionAudit || !driverIncidents || !tripLifecycleEvents || !gatewayDefaults || !loraNodes) {
    return null;
  }
  const tripRecords = trips.map((trip) => {
    const seeded = demoSnapshot.trips.find((item) => item.id === trip.id);
    return { ...trip, direction: trip.direction ?? seeded?.direction };
  });

  return {
    routes,
    trips: tripRecords,
    buses,
    trackers,
    drivers,
    students,
    stops,
    rfidCards,
    attendanceEvents,
    gpsTelemetry,
    loraNodes,
    loraGateways: gatewayDefaults,
    notifications,
    tripAssignments,
    ingestionAudit,
    driverIncidents,
    tripLifecycleEvents,
  };
}

function createId(prefix: string): string {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`}`;
}

function eventIsValid<T>(event: IntegrationEvent<T>): boolean {
  const timestamp = Date.parse(event?.timestamp ?? "");
  return Boolean(
    event &&
      typeof event.eventId === "string" &&
      event.eventId.length > 0 &&
      typeof event.eventType === "string" &&
      event.schemaVersion === 1 &&
      Number.isFinite(timestamp) &&
      timestamp <= Date.now() + 5 * 60_000 &&
      event.source &&
      (event.source.kind === "device" || event.source.kind === "gateway" || event.source.kind === "simulator" || event.source.kind === "backend") &&
      typeof event.source.deviceId === "string" &&
      event.source.deviceId.length > 0 &&
      typeof event.source.adapter === "string" &&
      event.source.adapter.length > 0 &&
      event.payload &&
      typeof event.payload === "object",
  );
}

function minutesSinceMidnight(time: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function tripInterval(trip: Trip, fallbackDate: string): { start: number; end: number } | null {
  const startMinutes = minutesSinceMidnight(trip.scheduledStart);
  const endMinutes = minutesSinceMidnight(trip.scheduledEnd);
  if (startMinutes === null || endMinutes === null || startMinutes === endMinutes) return null;
  const [year, month, day] = (trip.scheduledDate ?? fallbackDate).split("-").map(Number);
  if (!year || !month || !day) return null;
  const dayStart = new Date(year, month - 1, day).getTime();
  const start = dayStart + startMinutes * 60_000;
  let end = dayStart + endMinutes * 60_000;
  if (endMinutes < startMinutes) end += 24 * 60 * 60_000;
  return { start, end };
}

function isRecordStatus(value: unknown): value is FleetSnapshot["buses"][number]["status"] {
  return value === "active" || value === "inactive" || value === "idle" || value === "maintenance";
}

export class DemoFleetService implements FleetService {
  private readonly storage: DemoSnapshotStorage | null;
  private memorySnapshot: FleetSnapshot | null = null;
  private readonly listeners = new Set<() => void>();

  constructor(storage: DemoSnapshotStorage | null = browserStorage()) {
    this.storage = storage;
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.onStorage);
      window.addEventListener(snapshotUpdatedEvent, this.onStorage);
    }
  }

  private onStorage = () => {
    this.listeners.forEach((listener) => listener());
  };

  private async readSnapshot(): Promise<FleetSnapshot> {
    if (this.storage) {
      const saved = this.storage.getItem(snapshotStorageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        const normalized = normalizeSnapshot(parsed);
        if (!normalized) {
          throw new Error("Saved demo fleet data is invalid. Clear the local demo storage and reload.");
        }
        this.memorySnapshot = normalized;
      }
    }
    const snapshot = clone(this.memorySnapshot ?? demoSnapshot);
    this.applyDemoClock(snapshot);
    return snapshot;
  }

  private async writeSnapshot(snapshot: FleetSnapshot): Promise<void> {
    if (this.storage) this.storage.setItem(snapshotStorageKey, JSON.stringify(snapshot));
    this.memorySnapshot = clone(snapshot);
    if (typeof window !== "undefined") window.dispatchEvent(new Event(snapshotUpdatedEvent));
    else this.listeners.forEach((listener) => listener());
  }

  private async mutate<T>(operation: (snapshot: FleetSnapshot) => T): Promise<T> {
    const snapshot = await this.readSnapshot();
    const result = operation(snapshot);
    await this.writeSnapshot(snapshot);
    return result;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private applyDemoClock(snapshot: FleetSnapshot): void {
    const now = new Date();
    for (const [tripId, startOffset, duration] of [
      ["trip-morning-02", 38, 34],
      ["trip-next-01", 18, 28],
      ["trip-homebound-01", 90, 34],
    ] as const) {
      const trip = snapshot.trips.find((item) => item.id === tripId);
      if (trip && trip.status === "scheduled") {
        const departure = addMinutes(now, startOffset);
        trip.scheduledDate = localDateKey(departure);
        trip.scheduledStart = scheduledTime(departure);
        trip.scheduledEnd = scheduledTime(addMinutes(departure, duration));
      }
    }
    const activeTrip = snapshot.trips.find((trip) => trip.id === "trip-morning-01");
    if (activeTrip?.status === "in_progress") {
      const departure = addMinutes(now, -15);
      activeTrip.scheduledDate = localDateKey(departure);
      activeTrip.scheduledStart = scheduledTime(departure);
      activeTrip.scheduledEnd = scheduledTime(addMinutes(now, 13));
    }
    for (const tracker of snapshot.trackers) {
      const hasDeviceTelemetry = snapshot.ingestionAudit.some(
        (event) => event.status === "accepted" && event.eventType === "gps.telemetry.v1" &&
          event.sourceDeviceId === tracker.serialNumber,
      );
      if (tracker.status === "active" && !hasDeviceTelemetry) tracker.lastSeenAt = now.toISOString();
    }
    for (const node of snapshot.loraNodes) {
      const hasDeviceHealth = snapshot.ingestionAudit.some(
        (event) => event.status === "accepted" && event.eventType === "lora.health.v1" &&
          event.sourceDeviceId === node.deviceId,
      );
      if (node.status === "active" && !hasDeviceHealth) node.lastSeenAt = now.toISOString();
    }
    for (const gateway of snapshot.loraGateways) {
      if (gateway.status === "active") gateway.lastSeenAt = now.toISOString();
    }
  }

  async getSnapshot(): Promise<FleetSnapshot> {
    return this.readSnapshot();
  }

  async getRoutes() { return (await this.getSnapshot()).routes; }
  async getTrips() { return (await this.getSnapshot()).trips; }
  async getBuses() { return (await this.getSnapshot()).buses; }
  async getTrackers() { return (await this.getSnapshot()).trackers; }
  async getDrivers() { return (await this.getSnapshot()).drivers; }
  async getStudents() { return (await this.getSnapshot()).students; }
  async getStops() { return (await this.getSnapshot()).stops; }
  async getRfidCards() { return (await this.getSnapshot()).rfidCards; }
  async getAttendanceEvents() { return (await this.getSnapshot()).attendanceEvents; }
  async getGpsTelemetry() { return (await this.getSnapshot()).gpsTelemetry; }
  async getLoraNodes() { return (await this.getSnapshot()).loraNodes; }
  async getLoraGateways() { return (await this.getSnapshot()).loraGateways; }
  async getNotifications() { return (await this.getSnapshot()).notifications; }
  async getTripAssignments() { return (await this.getSnapshot()).tripAssignments; }

  async createRoute(input: Omit<Route, "id">): Promise<Route> {
    return this.mutate((snapshot) => {
      if (input.stopIds.length < 2 || input.stopIds.some((id) => !snapshot.stops.some((stop) => stop.id === id))) {
        throw new Error("A route must include at least two existing stops.");
      }
      if (new Set(input.stopIds).size !== input.stopIds.length) throw new Error("A route cannot repeat the same stop.");
      if (!input.name.trim() || !input.code.trim() || input.estimatedDurationMinutes <= 0) throw new Error("Route name, code and a positive duration are required.");
      if (snapshot.routes.some((route) => route.code.toLowerCase() === input.code.trim().toLowerCase())) throw new Error("Route codes must be unique.");
      const route = { ...input, id: createId("route") };
      snapshot.routes.push(route);
      return route;
    });
  }

  async updateRoute(routeId: string, changes: Partial<Omit<Route, "id">>): Promise<Route> {
    return this.mutate((snapshot) => {
      const route = snapshot.routes.find((item) => item.id === routeId);
      if (!route) throw new Error("Route was not found.");
      if (changes.stopIds && (changes.stopIds.length < 2 || changes.stopIds.some((id) => !snapshot.stops.some((stop) => stop.id === id)))) {
        throw new Error("A route must include at least two existing stops.");
      }
      if (changes.stopIds && new Set(changes.stopIds).size !== changes.stopIds.length) throw new Error("A route cannot repeat the same stop.");
      if (changes.stopIds && snapshot.trips.some((trip) => trip.routeId === routeId && trip.status === "in_progress")) {
        throw new Error("Pause or end the active trip before changing its route stops.");
      }
      if (changes.code && snapshot.routes.some((item) => item.id !== routeId && item.code.toLowerCase() === changes.code?.trim().toLowerCase())) {
        throw new Error("Route codes must be unique.");
      }
      Object.assign(route, changes);
      return route;
    });
  }

  async createTrip(input: Omit<Trip, "id">): Promise<Trip> {
    return this.mutate((snapshot) => {
      if (!snapshot.routes.some((route) => route.id === input.routeId)) throw new Error("Choose an existing route for this trip.");
      const start = minutesSinceMidnight(input.scheduledStart);
      const end = minutesSinceMidnight(input.scheduledEnd);
      if (start === null || end === null || end === start) {
        throw new Error("Trip times must be valid 24-hour times and cannot be identical.");
      }
      if (input.scheduledDate && (!/^\d{4}-\d{2}-\d{2}$/.test(input.scheduledDate) || Number.isNaN(Date.parse(`${input.scheduledDate}T00:00:00`)))) {
        throw new Error("Trip date must use a valid YYYY-MM-DD date.");
      }
      const trip = { ...input, id: createId("trip") };
      snapshot.trips.push(trip);
      return trip;
    });
  }

  async assignTrip(input: Omit<TripAssignment, "id" | "assignedAt">): Promise<TripAssignment> {
    return this.mutate((snapshot) => {
      const trip = snapshot.trips.find((item) => item.id === input.tripId);
      const bus = snapshot.buses.find((item) => item.id === input.busId);
      const tracker = snapshot.trackers.find((item) => item.id === input.trackerId);
      const driver = snapshot.drivers.find((item) => item.id === input.driverId);
      if (!trip || !bus || !tracker || !driver) throw new Error("Select an existing trip, bus, tracker and driver.");
      if (trip.status !== "scheduled") throw new Error("Only scheduled trips can be assigned or reassigned.");
      if (bus.status !== "active" || tracker.status !== "active" || driver.status !== "active") {
        throw new Error("Trips can only use active buses, trackers and drivers.");
      }
      const date = trip.scheduledDate ?? localDateKey(new Date());
      const selectedInterval = tripInterval(trip, date);
      if (!selectedInterval) throw new Error("This trip has invalid scheduled times.");
      const overlaps = snapshot.tripAssignments.some((assignment) => {
        if (assignment.tripId === trip.id || assignment.busId !== bus.id) return false;
        const other = snapshot.trips.find((item) => item.id === assignment.tripId);
        if (!other || other.status === "completed") return false;
        const otherInterval = tripInterval(other, date);
        return otherInterval !== null && selectedInterval.start < otherInterval.end && selectedInterval.end > otherInterval.start;
      });
      if (overlaps) throw new Error("This bus is already assigned to an overlapping trip.");
      const resourceOverlaps = snapshot.tripAssignments.some((assignment) => {
        if (assignment.tripId === trip.id) return false;
        const other = snapshot.trips.find((item) => item.id === assignment.tripId);
        if (!other || other.status === "completed") return false;
        const otherInterval = tripInterval(other, date);
        if (!otherInterval || selectedInterval.start >= otherInterval.end || selectedInterval.end <= otherInterval.start) return false;
        return assignment.trackerId === tracker.id || assignment.driverId === driver.id;
      });
      if (resourceOverlaps) throw new Error("The selected tracker or driver is assigned to an overlapping trip.");
      const prior = snapshot.tripAssignments.find((assignment) => assignment.tripId === trip.id);
      const previousTrackerId = prior?.trackerId;
      const assignment: TripAssignment = {
        id: prior?.id ?? createId("assignment"),
        assignedAt: new Date().toISOString(),
        ...input,
      };
      if (prior) Object.assign(prior, assignment);
      else snapshot.tripAssignments.push(assignment);
      const oldTracker = snapshot.trackers.find((item) => item.id === previousTrackerId);
      if (oldTracker && oldTracker.id !== tracker.id && !snapshot.tripAssignments.some((item) => item.trackerId === oldTracker.id)) oldTracker.busId = null;
      tracker.busId = bus.id;
      return assignment;
    });
  }

  async updateBusStatus(busId: string, status: FleetSnapshot["buses"][number]["status"]): Promise<void> {
    await this.mutate((snapshot) => {
      const bus = snapshot.buses.find((item) => item.id === busId);
      if (!bus) throw new Error("Bus was not found.");
      if (status !== "active" && snapshot.tripAssignments.some((assignment) =>
        assignment.busId === busId && snapshot.trips.some((trip) => trip.id === assignment.tripId && trip.status === "in_progress"),
      )) throw new Error("End or pause this bus's active trip before changing its status.");
      bus.status = status;
    });
  }

  async updateTrackerStatus(trackerId: string, status: FleetSnapshot["trackers"][number]["status"]): Promise<void> {
    await this.mutate((snapshot) => {
      const tracker = snapshot.trackers.find((item) => item.id === trackerId);
      if (!tracker) throw new Error("Tracker was not found.");
      if (status !== "active" && snapshot.tripAssignments.some((assignment) =>
        assignment.trackerId === trackerId && snapshot.trips.some((trip) => trip.id === assignment.tripId && trip.status === "in_progress"),
      )) throw new Error("End or pause this tracker's active trip before taking it offline.");
      tracker.status = status;
      if (status === "active") tracker.lastSeenAt = new Date().toISOString();
    });
  }

  async updateLoraNodeStatus(nodeId: string, status: FleetSnapshot["loraNodes"][number]["status"]): Promise<void> {
    await this.mutate((snapshot) => {
      const node = snapshot.loraNodes.find((item) => item.id === nodeId);
      if (!node) throw new Error("LoRa node was not found.");
      node.status = status;
      if (status === "active") node.lastSeenAt = new Date().toISOString();
    });
  }

  async updateGatewayStatus(gatewayId: string, status: FleetSnapshot["loraGateways"][number]["status"]): Promise<void> {
    await this.mutate((snapshot) => {
      const gateway = snapshot.loraGateways.find((item) => item.id === gatewayId);
      if (!gateway) throw new Error("Gateway was not found.");
      gateway.status = status;
      if (status === "active") {
        gateway.backendConnected = true;
        gateway.lastSeenAt = new Date().toISOString();
      } else {
        gateway.backendConnected = false;
      }
    });
  }

  private async changeTripStatus(
    tripId: string,
    allowed: Trip["status"][],
    status: Trip["status"],
    eventType: "started" | "paused" | "resumed" | "ended",
  ): Promise<void> {
    await this.mutate((snapshot) => {
      const trip = snapshot.trips.find((item) => item.id === tripId);
      if (!trip) throw new Error("Trip was not found.");
      if (!allowed.includes(trip.status)) throw new Error(`Cannot ${eventType} a ${trip.status} trip.`);
      if ((status === "in_progress" || status === "paused") && !snapshot.tripAssignments.some((item) => item.tripId === tripId)) {
        throw new Error("Assign a bus, tracker and driver before starting the trip.");
      }
      if (status === "in_progress") {
        const date = trip.scheduledDate ?? localDateKey(new Date());
        const selectedInterval = tripInterval(trip, date);
        if (!selectedInterval) throw new Error("This trip has invalid scheduled times.");
        const assignment = snapshot.tripAssignments.find((item) => item.tripId === tripId);
        const bus = snapshot.buses.find((item) => item.id === assignment?.busId);
        const tracker = snapshot.trackers.find((item) => item.id === assignment?.trackerId);
        const driver = snapshot.drivers.find((item) => item.id === assignment?.driverId);
        if (bus?.status !== "active" || tracker?.status !== "active" || driver?.status !== "active") {
          throw new Error("An active bus, tracker and driver are required to start or resume this trip.");
        }
        const busAlreadyInUse = snapshot.tripAssignments.some((item) => {
          if (item.tripId === tripId || item.busId !== bus.id) return false;
          const other = snapshot.trips.find((candidate) => candidate.id === item.tripId);
          if (!other || other.status !== "in_progress") return false;
          const otherInterval = tripInterval(other, date);
          return otherInterval !== null && selectedInterval.start < otherInterval.end && selectedInterval.end > otherInterval.start;
        });
        if (busAlreadyInUse) throw new Error("This bus is already in use on an overlapping active trip.");
      }
      trip.status = status;
      snapshot.tripLifecycleEvents.push({ id: createId("lifecycle"), tripId, type: eventType, occurredAt: new Date().toISOString() });
    });
  }

  async startTrip(tripId: string) { return this.changeTripStatus(tripId, ["scheduled", "boarding"], "in_progress", "started"); }
  async pauseTrip(tripId: string) { return this.changeTripStatus(tripId, ["in_progress"], "paused", "paused"); }
  async resumeTrip(tripId: string) { return this.changeTripStatus(tripId, ["paused"], "in_progress", "resumed"); }
  async endTrip(tripId: string) { return this.changeTripStatus(tripId, ["in_progress", "paused"], "completed", "ended"); }

  async reportIncident(input: Omit<DriverIncident, "id" | "reportedAt">): Promise<DriverIncident> {
    return this.mutate((snapshot) => {
      if (!snapshot.trips.some((trip) => trip.id === input.tripId) || !snapshot.drivers.some((driver) => driver.id === input.driverId)) {
        throw new Error("The incident must reference an existing trip and driver.");
      }
      const incident = { ...input, id: createId("incident"), reportedAt: new Date().toISOString() };
      snapshot.driverIncidents.push(incident);
      snapshot.tripLifecycleEvents.push({ id: createId("lifecycle"), tripId: input.tripId, type: "incident_reported", occurredAt: incident.reportedAt, note: input.note });
      return incident;
    });
  }

  private audit(snapshot: FleetSnapshot, event: IntegrationEvent<unknown>, status: "accepted" | "rejected" | "duplicate", message: string) {
    snapshot.ingestionAudit.unshift({
      id: createId("audit"),
      eventType: event?.eventType ?? "unknown",
      timestamp: new Date().toISOString(),
      sourceDeviceId: event?.source?.deviceId ?? "unknown",
      status,
      message,
      idempotencyKey: event?.idempotencyKey ?? event?.eventId,
    });
    return status;
  }

  private isDuplicate(snapshot: FleetSnapshot, event: IntegrationEvent<unknown>): boolean {
    const key = event.idempotencyKey ?? event.eventId;
    return snapshot.ingestionAudit.some((item) =>
      item.status === "accepted" &&
      item.eventType === event.eventType &&
      item.sourceDeviceId === event.source.deviceId &&
      item.idempotencyKey === key,
    );
  }

  async recordRfidTap(event: IntegrationEvent<RfidTapPayload>) {
    return this.mutate((snapshot) => {
      if (!eventIsValid(event) || event.eventType !== "rfid.tap.v1" || event.source.kind !== "device" || event.payload.eventType !== "boarded" && event.payload.eventType !== "alighted") {
        return this.audit(snapshot, event, "rejected", "Invalid RFID event envelope or payload.");
      }
      if (!event.payload.cardNumber || !event.payload.readerId || !event.payload.tripId || !event.payload.stopId) {
        return this.audit(snapshot, event, "rejected", "RFID event is missing a required identifier.");
      }
      if (this.isDuplicate(snapshot, event)) return this.audit(snapshot, event, "duplicate", "Duplicate RFID event ignored.");
      const card = snapshot.rfidCards.find((item) => item.cardNumber === event.payload.cardNumber && item.status === "active");
      const student = snapshot.students.find((item) => item.id === card?.studentId);
      const trip = snapshot.trips.find((item) => item.id === event.payload.tripId);
      const assignment = snapshot.tripAssignments.find((item) => item.tripId === event.payload.tripId);
      const route = snapshot.routes.find((item) => item.id === trip?.routeId);
      const reader = snapshot.loraNodes.find((node) => node.readerId === event.payload.readerId && node.status === "active");
      const gateway = snapshot.loraGateways.find((item) => item.id === reader?.gatewayId && item.status === "active" && item.backendConnected);
      if (!card || !student || !trip || trip.status === "completed" || !assignment || !route?.stopIds.includes(event.payload.stopId) || !reader || !gateway) {
        return this.audit(snapshot, event, "rejected", "Card, trip assignment, route stop, active reader or gateway could not be verified.");
      }
      snapshot.attendanceEvents.unshift({
        id: createId("attendance"),
        studentId: card.studentId,
        cardId: card.id,
        tripId: trip.id,
        stopId: event.payload.stopId,
        readerId: event.payload.readerId,
        eventType: event.payload.eventType,
        occurredAt: event.timestamp,
        source: "device",
        eventStatus: "recorded",
      });
      return this.audit(snapshot, event, "accepted", "RFID attendance tap recorded.");
    });
  }

  async recordGpsTelemetry(event: IntegrationEvent<GpsTelemetryPayload>) {
    return this.mutate((snapshot) => {
      const payload = event?.payload;
      if (!eventIsValid(event) || event.eventType !== "gps.telemetry.v1" ||
        event.source.kind !== "device" && event.source.kind !== "simulator" ||
        !payload || !Number.isFinite(payload.latitude) || payload.latitude < -90 || payload.latitude > 90 ||
        !Number.isFinite(payload.longitude) || payload.longitude < -180 || payload.longitude > 180 ||
        payload.speedKph !== undefined && (!Number.isFinite(payload.speedKph) || payload.speedKph < 0 || payload.speedKph > 180)) {
        return this.audit(snapshot, event, "rejected", "Invalid GPS telemetry envelope or coordinates.");
      }
      if (!payload.tripId || !payload.trackerId || !payload.busId || !event.source.deviceId) {
        return this.audit(snapshot, event, "rejected", "GPS telemetry is missing an assignment identifier.");
      }
      if (this.isDuplicate(snapshot, event)) return this.audit(snapshot, event, "duplicate", "Duplicate GPS event ignored.");
      const tracker = snapshot.trackers.find((item) => item.id === payload.trackerId && item.status === "active");
      const assignment = snapshot.tripAssignments.find((item) => item.tripId === payload.tripId && item.trackerId === payload.trackerId && item.busId === payload.busId);
      if (!tracker || !assignment || tracker.busId !== payload.busId) return this.audit(snapshot, event, "rejected", "GPS tracker is not assigned to this bus and trip.");
      snapshot.gpsTelemetry.unshift({
        id: createId("gps-ingested"),
        trackerId: tracker.id,
        tripId: payload.tripId,
        busId: payload.busId,
        latitude: payload.latitude,
        longitude: payload.longitude,
        speedKph: payload.speedKph ?? 0,
        recordedAt: event.timestamp,
      });
      tracker.lastSeenAt = event.timestamp;
      return this.audit(snapshot, event, "accepted", "GPS telemetry recorded.");
    });
  }

  async recordLoraHealth(event: IntegrationEvent<LoRaHealthPayload>) {
    return this.mutate((snapshot) => {
      const payload = event?.payload;
      if (!eventIsValid(event) || event.eventType !== "lora.health.v1" || !payload || !isRecordStatus(payload.status) ||
        payload.batteryPercent !== undefined && (!Number.isFinite(payload.batteryPercent) || payload.batteryPercent < 0 || payload.batteryPercent > 100) ||
        payload.rssiDbm !== undefined && (!Number.isFinite(payload.rssiDbm) || payload.rssiDbm < -150 || payload.rssiDbm > 0) ||
        payload.snrDb !== undefined && (!Number.isFinite(payload.snrDb) || payload.snrDb < -30 || payload.snrDb > 30)) {
        return this.audit(snapshot, event, "rejected", "Invalid LoRa health envelope or measurements.");
      }
      if (!payload.nodeId || !payload.gatewayId) return this.audit(snapshot, event, "rejected", "LoRa health event is missing a node or gateway identifier.");
      if (this.isDuplicate(snapshot, event)) return this.audit(snapshot, event, "duplicate", "Duplicate LoRa health event ignored.");
      const node = snapshot.loraNodes.find((item) => item.id === payload.nodeId && item.gatewayId === payload.gatewayId);
      const gateway = snapshot.loraGateways.find((item) => item.id === payload.gatewayId && item.status === "active");
      if (!node || !gateway) return this.audit(snapshot, event, "rejected", "LoRa node and active gateway association could not be verified.");
      node.status = payload.status;
      node.lastSeenAt = event.timestamp;
      if (payload.batteryPercent !== undefined) node.batteryPercent = payload.batteryPercent;
      if (payload.rssiDbm !== undefined) node.rssiDbm = payload.rssiDbm;
      if (payload.snrDb !== undefined) node.snrDb = payload.snrDb;
      return this.audit(snapshot, event, "accepted", "LoRa node health recorded.");
    });
  }
}

export const demoFleetService: FleetService = new DemoFleetService();
