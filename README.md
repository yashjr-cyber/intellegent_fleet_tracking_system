# Wayfinder Mobility

Milestone 1 foundation for **Dynamic Institutional Mobility Intelligence**: a responsive, role-separated campus mobility experience built with React, TypeScript, and Vite.

## Run locally

```sh
npm install
npm run dev
```

Use the sign-in screen to enter the Student, Driver, or Campus team demo. Demo role selection is stored for the current browser tab; sign out from the profile control to switch roles.

## Foundation

- `src/types/models.ts` defines the typed domain records and `FleetSnapshot`.
- `src/services/FleetService.ts` is the async service contract; `demoFleetService.ts` provides isolated fictional sample data for the first milestone.
- `src/auth/AuthContext.tsx` and `src/App.tsx` provide demo role selection and separate `/student`, `/driver`, and `/admin` shells.
- `src/components/` contains shared branding, icons, and responsive dashboard navigation.
- Student pages provide a simulated campus map, replaceable ETA service, notification preferences and a read-only RFID attendance view.
- Driver pages expose assignment-driven trip lifecycle controls and incident reporting. Admin routes cover fleet, routes, trips, drivers, attendance, summary analytics and simulated LoRa topology.
- `DemoFleetService` persists this fictional snapshot in browser local storage and publishes same-tab/cross-tab refresh events so role demos share changes. Reset the browser's `wayfinder.demo-fleet.v1` local-storage key to restore its initial snapshot.

Routes, trips, buses, and trackers are separate records. A trip references a route, while `TripAssignment` connects a trip to its currently assigned bus, tracker, and driver. Assignments can change without changing the route or the trip identity.

## Demo-only notice

Names, locations, schedules, identifiers, telemetry, and attendance are fictional sample data. The student map uses OpenStreetMap tiles with simulated vehicle locations; ETAs are illustrative prototype estimates, not validated machine-learning predictions. Browser arrival alerts require notification permission and this page to remain open; they are not background push notifications. Demo role selection is **not authentication or authorization** and provides no production security. Backend, identity-provider, real GPS, and hardware integrations are not included.

## Integration boundary (prototype only)

The TypeScript contracts in `src/types/models.ts` define versioned `IntegrationEvent<T>` envelopes and example GPS, RFID and LoRa payloads. `DemoFleetService` validates event shape, coordinate/measurement ranges, record associations and idempotency keys; accepted and rejected attempts are visible in the demo attendance audit. These local checks are illustrative service-boundary behavior, not a secure ingestion endpoint.

Example GPS telemetry envelope:

```json
{
  "eventId": "gps-demo-001",
  "eventType": "gps.telemetry.v1",
  "schemaVersion": 1,
  "timestamp": "2026-10-06T08:30:00Z",
  "source": { "kind": "device", "deviceId": "DEMO-GPS-017", "adapter": "vehicle-gps-adapter" },
  "idempotencyKey": "DEMO-GPS-017:sequence-42",
  "payload": {
    "tripId": "trip-morning-01",
    "trackerId": "tracker-17",
    "busId": "bus-aurora",
    "latitude": 12.972,
    "longitude": 77.596,
    "speedKph": 18
  }
}
```

RFID tap payload:

```json
{
  "eventId": "rfid-demo-001",
  "eventType": "rfid.tap.v1",
  "schemaVersion": 1,
  "timestamp": "2026-10-06T08:30:00Z",
  "source": { "kind": "device", "deviceId": "demo-reader-library", "adapter": "lora-reader-adapter" },
  "idempotencyKey": "demo-reader-library:sequence-42",
  "payload": {
    "cardNumber": "DEMO-RFID-018",
    "readerId": "reader-library",
    "tripId": "trip-morning-01",
    "stopId": "stop-library",
    "eventType": "boarded"
  }
}
```

LoRa node health payload:

```json
{
  "eventId": "lora-demo-001",
  "eventType": "lora.health.v1",
  "schemaVersion": 1,
  "timestamp": "2026-10-06T08:30:00Z",
  "source": { "kind": "device", "deviceId": "demo-reader-library", "adapter": "lora-gateway-adapter" },
  "idempotencyKey": "gateway-northstar:sequence-42",
  "payload": {
    "nodeId": "lora-reader-library",
    "gatewayId": "gateway-northstar",
    "status": "active",
    "batteryPercent": 87,
    "rssiDbm": -61,
    "snrDb": 9.4
  }
}
```

The same envelope version supports `rfid.tap.v1` (`cardNumber`, `readerId`, `tripId`, `stopId`, `eventType`) and `lora.health.v1` (`nodeId`, `gatewayId`, `status`, and optional battery/RSSI/SNR measurements). Device adapters, radio protocols, gateway transport, backend persistence, real authorization, server-side replay protection, and production credential management are intentionally not implemented. No screen or demo action communicates with real vehicle, RFID or LoRa hardware.
