export type Identifier = string;

export type UserRole = "student" | "driver" | "admin";
export type RecordStatus = "active" | "inactive" | "idle" | "maintenance";
export type TripStatus = "scheduled" | "boarding" | "in_progress" | "paused" | "completed";
export type TripDirection = "outbound" | "homebound";

export interface Route {
  id: Identifier;
  name: string;
  code: string;
  stopIds: Identifier[];
  estimatedDurationMinutes: number;
  status: RecordStatus;
}

export interface Trip {
  id: Identifier;
  routeId: Identifier;
  scheduledStart: string;
  scheduledEnd: string;
  status: TripStatus;
  direction?: TripDirection;
  scheduledDate?: string;
}

export interface Bus {
  id: Identifier;
  registration: string;
  label: string;
  capacity: number;
  status: RecordStatus;
}

export interface Tracker {
  id: Identifier;
  serialNumber: string;
  busId: Identifier | null;
  status: RecordStatus;
  lastSeenAt: string;
}

export interface Driver {
  id: Identifier;
  name: string;
  email: string;
  phone: string;
  status: RecordStatus;
}

export interface Student {
  id: Identifier;
  name: string;
  email: string;
  studentNumber: string;
  stopId: Identifier;
}

export interface Stop {
  id: Identifier;
  name: string;
  shortName: string;
  latitude: number;
  longitude: number;
  sequence: number;
}

export interface RfidCard {
  id: Identifier;
  studentId: Identifier;
  cardNumber: string;
  status: RecordStatus;
}

export interface AttendanceEvent {
  id: Identifier;
  studentId: Identifier;
  tripId: Identifier;
  cardId: Identifier;
  stopId: Identifier;
  eventType: "boarded" | "alighted";
  occurredAt: string;
  readerId?: Identifier;
  source?: "simulated" | "device";
  eventStatus?: "recorded" | "unmatched" | "duplicate" | "failed";
}

export interface GpsTelemetry {
  id: Identifier;
  trackerId: Identifier;
  tripId?: Identifier;
  busId?: Identifier;
  latitude: number;
  longitude: number;
  speedKph: number;
  recordedAt: string;
}

export interface LoRaNode {
  id: Identifier;
  name: string;
  stopId: Identifier;
  status: RecordStatus;
  lastSeenAt: string;
  parentNodeId?: Identifier | null;
  gatewayId?: Identifier;
  batteryPercent?: number;
  rssiDbm?: number;
  snrDb?: number;
  deviceId?: string;
  readerId?: Identifier;
}

export interface LoRaGateway {
  id: Identifier;
  name: string;
  status: RecordStatus;
  lastSeenAt: string;
  backendConnected: boolean;
}

export interface Notification {
  id: Identifier;
  recipientId: Identifier;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface TripAssignment {
  id: Identifier;
  tripId: Identifier;
  busId: Identifier;
  trackerId: Identifier;
  driverId: Identifier;
  assignedAt: string;
}

export interface FleetSnapshot {
  routes: Route[];
  trips: Trip[];
  buses: Bus[];
  trackers: Tracker[];
  drivers: Driver[];
  students: Student[];
  stops: Stop[];
  rfidCards: RfidCard[];
  attendanceEvents: AttendanceEvent[];
  gpsTelemetry: GpsTelemetry[];
  loraNodes: LoRaNode[];
  loraGateways: LoRaGateway[];
  notifications: Notification[];
  tripAssignments: TripAssignment[];
  ingestionAudit: IngestionAuditEvent[];
  driverIncidents: DriverIncident[];
  tripLifecycleEvents: TripLifecycleEvent[];
}

export type EventSourceKind = "device" | "gateway" | "simulator" | "backend";

export interface IntegrationEvent<TPayload> {
  eventId: Identifier;
  eventType: string;
  schemaVersion: 1;
  timestamp: string;
  source: {
    kind: EventSourceKind;
    deviceId: string;
    adapter: string;
  };
  idempotencyKey?: string;
  payload: TPayload;
}

export interface GpsTelemetryPayload {
  tripId: Identifier;
  trackerId: Identifier;
  busId: Identifier;
  latitude: number;
  longitude: number;
  speedKph?: number;
}

export interface RfidTapPayload {
  cardNumber: string;
  readerId: Identifier;
  tripId: Identifier;
  stopId: Identifier;
  eventType: AttendanceEvent["eventType"];
}

export interface LoRaHealthPayload {
  nodeId: Identifier;
  gatewayId: Identifier;
  status: RecordStatus;
  batteryPercent?: number;
  rssiDbm?: number;
  snrDb?: number;
}

export interface IngestionAuditEvent {
  id: Identifier;
  eventType: string;
  timestamp: string;
  sourceDeviceId: string;
  status: "accepted" | "rejected" | "duplicate";
  message: string;
  idempotencyKey?: string;
}

export interface DriverIncident {
  id: Identifier;
  tripId: Identifier;
  driverId: Identifier;
  category: "safety" | "vehicle" | "route" | "other";
  note: string;
  reportedAt: string;
}

export interface TripLifecycleEvent {
  id: Identifier;
  tripId: Identifier;
  type: "started" | "paused" | "resumed" | "ended" | "incident_reported";
  occurredAt: string;
  note?: string;
}
