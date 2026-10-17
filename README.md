# REC South Campus Mobility

**Dynamic Institutional Mobility Intelligence** is a responsive, role-separated campus mobility MVP built with React, TypeScript, and Vite. Its student, driver, and campus-team workflows use explicitly fictional demo data.

The demo's campus endpoint is at **RMZ Millenia Business Park, Perungudi, Chennai** (approximately 12.9731, 80.2431), representing the new South Chennai campus branch. It is not the Rajalakshmi main campus in Thandalam. The map's zoom-out limit and bounds are sized to the full extent of the six supplied route corridors.

The six route stop names and morning times are entered from the supplied timetable screenshots. The return timetable starts at the campus at 4:00 PM, reverses each route's stop order, and reuses the corresponding gap between adjacent morning stops. Coordinates for listed stops are illustrative map placements and should be checked against the institution's actual pickup points before operational use.

## Run locally

```sh
npm install
npm run dev
```

Use the sign-in screen to enter the Student, Driver, or Campus team demo. Demo role selection is stored for the current browser tab; sign out from the profile control to switch roles.

To preview the development server from a phone on the same Wi-Fi, run `npm run dev -- --host 0.0.0.0` and open `http://<computer-lan-ip>:5173` on the phone. Network/firewall settings may block LAN access; `http://localhost:5173` is only reachable from the computer itself.

## Free MVP hosting

The repository includes a GitHub Actions workflow that builds, tests, and deploys the static Vite app to GitHub Pages on pushes to `main` or the mobility feature branch. Once Pages is enabled for the repository and the workflow completes, the project URL is:

`https://yashjr-cyber.github.io/intellegent_fleet_tracking_system/`

Direct role URLs are restored through the Pages 404 fallback. The hosted site remains a public demo: its role picker is not authentication, each browser has its own local demo data, and no backend, real GPS/GNSS, or LoRa API is connected. Do not enter personal or sensitive data. The student map uses GPU-rendered OpenFreeMap vector tiles, based on OpenStreetMap data, and requires no API key; the public tile service has no SLA. Route coordinates remain illustrative and should be verified before operational use. For shared live fleet data, real users, or device ingestion, add a separately secured backend and database before scaling those capabilities.

The first deployment requires GitHub Pages to be enabled with **Build and deployment: GitHub Actions** in repository settings. Deployment status is available in the Actions tab.

## Foundation

- `src/types/models.ts` defines the typed domain records and `FleetSnapshot`.
- `src/services/FleetService.ts` is the async service contract; `demoFleetService.ts` provides isolated fictional sample data and mock integration boundaries.
- `src/auth/AuthContext.tsx` and `src/App.tsx` provide demo role selection and separate `/student`, `/driver`, and `/admin` shells.
- `src/components/` contains shared branding, icons, and responsive dashboard navigation.
- Student pages provide the six REC route lists with stop selection, morning stop times and computed 4:00 PM return times, a simulated campus map, replaceable ETA service, notification preferences and a read-only RFID attendance view.
- Driver pages expose assignment-driven trip lifecycle controls and incident reporting. Admin routes cover fleet, routes, trips, drivers, attendance, summary analytics and simulated LoRa topology.
- `DemoFleetService` persists this fictional snapshot in browser local storage and publishes same-tab/cross-tab refresh events so role demos share changes. Reset the browser's `wayfinder.demo-fleet.v1` local-storage key to restore its initial snapshot.

Routes, trips, buses, and trackers are separate records. A trip references a route, while `TripAssignment` connects a trip to its currently assigned bus, tracker, and driver. Assignments can change without changing the route or the trip identity.

## Demo-only notice

Names, locations, schedules, identifiers, telemetry, and attendance are fictional sample data. The student map uses OpenFreeMap vector tiles with simulated vehicle locations; its OpenStreetMap-derived data and illustrative route coordinates are not guaranteed to match Google Maps or ground truth. ETAs are illustrative prototype estimates, not validated machine-learning predictions. Browser arrival alerts require notification permission and this page to remain open; they are not background push notifications. Demo role selection is **not authentication or authorization** and provides no production security. Backend, identity-provider, real GPS, and hardware integrations are not included.

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
    "longitude": 80.3,
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
    "stopId": "stop-r1-thiruvottiyur",
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
  "idempotencyKey": "gateway-rec-south:sequence-42",
  "payload": {
    "nodeId": "lora-reader-library",
    "gatewayId": "gateway-rec-south",
    "status": "active",
    "batteryPercent": 87,
    "rssiDbm": -61,
    "snrDb": 9.4
  }
}
```

The same envelope version supports `rfid.tap.v1` (`cardNumber`, `readerId`, `tripId`, `stopId`, `eventType`) and `lora.health.v1` (`nodeId`, `gatewayId`, `status`, and optional battery/RSSI/SNR measurements). Device adapters, radio protocols, gateway transport, backend persistence, real authorization, server-side replay protection, and production credential management are intentionally not implemented. No screen or demo action communicates with real vehicle, RFID or LoRa hardware.
