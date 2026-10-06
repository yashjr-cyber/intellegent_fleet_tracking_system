import type {
  AttendanceEvent,
  Bus,
  Driver,
  DriverIncident,
  FleetSnapshot,
  GpsTelemetry,
  GpsTelemetryPayload,
  IntegrationEvent,
  LoRaGateway,
  LoRaHealthPayload,
  LoRaNode,
  Notification,
  RfidTapPayload,
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
  getLoraGateways(): Promise<LoRaGateway[]>;
  getNotifications(): Promise<Notification[]>;
  getTripAssignments(): Promise<TripAssignment[]>;
  subscribe(listener: () => void): () => void;
  createRoute(route: Omit<Route, "id">): Promise<Route>;
  updateRoute(routeId: string, changes: Partial<Omit<Route, "id">>): Promise<Route>;
  createTrip(trip: Omit<Trip, "id">): Promise<Trip>;
  assignTrip(assignment: Omit<TripAssignment, "id" | "assignedAt">): Promise<TripAssignment>;
  updateBusStatus(busId: string, status: Bus["status"]): Promise<void>;
  updateTrackerStatus(trackerId: string, status: Tracker["status"]): Promise<void>;
  updateLoraNodeStatus(nodeId: string, status: LoRaNode["status"]): Promise<void>;
  updateGatewayStatus(gatewayId: string, status: LoRaGateway["status"]): Promise<void>;
  startTrip(tripId: string): Promise<void>;
  pauseTrip(tripId: string): Promise<void>;
  resumeTrip(tripId: string): Promise<void>;
  endTrip(tripId: string): Promise<void>;
  reportIncident(incident: Omit<DriverIncident, "id" | "reportedAt">): Promise<DriverIncident>;
  recordRfidTap(event: IntegrationEvent<RfidTapPayload>): Promise<"accepted" | "rejected" | "duplicate">;
  recordGpsTelemetry(event: IntegrationEvent<GpsTelemetryPayload>): Promise<"accepted" | "rejected" | "duplicate">;
  recordLoraHealth(event: IntegrationEvent<LoRaHealthPayload>): Promise<"accepted" | "rejected" | "duplicate">;
}
