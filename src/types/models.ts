export type Identifier = string;

export type UserRole = "student" | "driver" | "admin";
export type RecordStatus = "active" | "inactive" | "maintenance";
export type TripStatus = "scheduled" | "boarding" | "in_progress" | "completed";

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
}

export interface GpsTelemetry {
  id: Identifier;
  trackerId: Identifier;
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
  notifications: Notification[];
  tripAssignments: TripAssignment[];
}
