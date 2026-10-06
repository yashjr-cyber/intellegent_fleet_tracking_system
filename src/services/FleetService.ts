import type {
  AttendanceEvent,
  Bus,
  Driver,
  FleetSnapshot,
  GpsTelemetry,
  LoRaNode,
  Notification,
  RfidCard,
  Route,
  Stop,
  Student,
  Tracker,
  Trip,
  TripAssignment,
} from "../types/models";

export interface FleetService {
  getSnapshot(): Promise<FleetSnapshot>;
  getRoutes(): Promise<Route[]>;
  getTrips(): Promise<Trip[]>;
  getBuses(): Promise<Bus[]>;
  getTrackers(): Promise<Tracker[]>;
  getDrivers(): Promise<Driver[]>;
  getStudents(): Promise<Student[]>;
  getStops(): Promise<Stop[]>;
  getRfidCards(): Promise<RfidCard[]>;
  getAttendanceEvents(): Promise<AttendanceEvent[]>;
  getGpsTelemetry(): Promise<GpsTelemetry[]>;
  getLoraNodes(): Promise<LoRaNode[]>;
  getNotifications(): Promise<Notification[]>;
  getTripAssignments(): Promise<TripAssignment[]>;
}
