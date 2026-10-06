import type { FleetService } from "./FleetService";
import type { FleetSnapshot } from "../types/models";

const demoSnapshot: FleetSnapshot = {
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
    },
    {
      id: "trip-morning-02",
      routeId: "route-garden",
      scheduledStart: "09:00",
      scheduledEnd: "09:34",
      status: "scheduled",
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
    },
    {
      id: "event-isha",
      studentId: "student-isha",
      tripId: "trip-morning-02",
      cardId: "card-isha",
      stopId: "stop-garden",
      eventType: "boarded",
      occurredAt: "2026-10-06T08:27:00+05:30",
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
  ],
  loraNodes: [
    {
      id: "lora-library",
      name: "Library node",
      stopId: "stop-library",
      status: "active",
      lastSeenAt: "2026-10-06T08:30:00+05:30",
    },
    {
      id: "lora-garden",
      name: "Garden node",
      stopId: "stop-garden",
      status: "active",
      lastSeenAt: "2026-10-06T08:27:00+05:30",
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
  ],
};

const clone = <T,>(value: T): T => structuredClone(value);

export const demoFleetService: FleetService = {
  async getSnapshot() {
    return clone(demoSnapshot);
  },
  async getRoutes() {
    return clone(demoSnapshot.routes);
  },
  async getTrips() {
    return clone(demoSnapshot.trips);
  },
  async getBuses() {
    return clone(demoSnapshot.buses);
  },
  async getTrackers() {
    return clone(demoSnapshot.trackers);
  },
  async getDrivers() {
    return clone(demoSnapshot.drivers);
  },
  async getStudents() {
    return clone(demoSnapshot.students);
  },
  async getStops() {
    return clone(demoSnapshot.stops);
  },
  async getRfidCards() {
    return clone(demoSnapshot.rfidCards);
  },
  async getAttendanceEvents() {
    return clone(demoSnapshot.attendanceEvents);
  },
  async getGpsTelemetry() {
    return clone(demoSnapshot.gpsTelemetry);
  },
  async getLoraNodes() {
    return clone(demoSnapshot.loraNodes);
  },
  async getNotifications() {
    return clone(demoSnapshot.notifications);
  },
  async getTripAssignments() {
    return clone(demoSnapshot.tripAssignments);
  },
};
