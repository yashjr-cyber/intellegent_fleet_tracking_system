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

Routes, trips, buses, and trackers are separate records. A trip references a route, while `TripAssignment` connects a trip to its currently assigned bus, tracker, and driver. Assignments can change without changing the route or the trip identity.

## Demo-only notice

Names, locations, schedules, identifiers, telemetry, and attendance in this milestone are fictional sample data. Demo role selection is **not authentication or authorization** and provides no production security. Backend, identity-provider, and hardware integrations are intentionally not part of Milestone 1.
