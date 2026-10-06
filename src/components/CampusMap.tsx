import { useEffect } from "react";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { ArrivalPrediction } from "../services/ArrivalPredictionService";
import type { SimulatedBusPosition } from "../services/simulatedTrackingService";
import type { Route, Stop, Trip } from "../types/models";

interface BusMapDetails {
  busLabel: string;
  route: Route;
  trip: Trip;
  position: SimulatedBusPosition;
  prediction: ArrivalPrediction | null;
}

function BusMarker({
  bus,
  selected,
  onSelect,
}: {
  bus: BusMapDetails;
  selected: boolean;
  onSelect: () => void;
}) {
  const icon = L.divIcon({
    className: "map-bus-marker",
    html: `<span class="map-bus-marker__pin map-bus-marker__pin--${bus.position.status.toLowerCase()}${selected ? " map-bus-marker__pin--selected" : ""}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14a2 2 0 0 0 2-2V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a2 2 0 0 0 2 2ZM3 11h18m-14 6v3m10-3v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

  return (
    <Marker
      position={[bus.position.latitude, bus.position.longitude]}
      icon={icon}
      eventHandlers={{ click: onSelect }}
    >
      <Popup>
        <div className="map-popup">
          <strong>{bus.busLabel}</strong>
          <span>{bus.route.name} · {bus.trip.direction === "homebound" ? "Homebound" : "Campus bound"}</span>
          <span>Next stop: {bus.position.nextStop.name}</span>
          <span>
            {bus.prediction
              ? `ETA ${bus.prediction.minutes} min`
              : `${bus.position.status === "STALE" ? "Stale" : "Offline"} · ETA unavailable`} · updated{" "}
            {bus.position.recordedAt.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
      </Popup>
    </Marker>
  );
}

function MapSizeObserver() {
  const map = useMap();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => map.invalidateSize());
    return () => window.cancelAnimationFrame(frame);
  }, [map]);

  return null;
}

export function CampusMap({
  routes,
  positions,
  selectedBusId,
  stops,
  assignedStop,
  detailsByBusId,
  onSelectBus,
}: {
  routes: readonly Route[];
  positions: readonly SimulatedBusPosition[];
  selectedBusId: string | null;
  stops: readonly Stop[];
  assignedStop: Stop;
  detailsByBusId: ReadonlyMap<string, BusMapDetails>;
  onSelectBus: (busId: string) => void;
}) {
  const stopsById = new Map(stops.map((stop) => [stop.id, stop]));
  const campusCenter: L.LatLngExpression = [12.9722, 77.601];

  return (
    <MapContainer
      center={campusCenter}
      zoom={15}
      scrollWheelZoom={false}
      zoomControl
      className="student-map__leaflet"
      aria-label="Simulated Northstar campus bus map"
    >
      <MapSizeObserver />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routes.map((route) => {
        const routeStops = route.stopIds.flatMap((stopId) => {
          const stop = stopsById.get(stopId);
          return stop ? [[stop.latitude, stop.longitude] as [number, number]] : [];
        });
        return (
          <Polyline
            key={route.id}
            positions={routeStops}
            pathOptions={{
              color: route.id === "route-north" ? "#5bd8b4" : "#8a9be9",
              weight: 4,
              opacity: 0.8,
              dashArray: route.id === "route-north" ? undefined : "7 7",
            }}
          />
        );
      })}
      {stops.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={[stop.latitude, stop.longitude]}
          radius={stop.id === assignedStop.id ? 8 : 5}
          pathOptions={{
            color: stop.id === assignedStop.id ? "#9cf2d8" : "#d6e4e9",
            fillColor: stop.id === assignedStop.id ? "#55caa4" : "#546c77",
            fillOpacity: 1,
            weight: stop.id === assignedStop.id ? 3 : 2,
          }}
        >
          <Popup>{stop.name}{stop.id === assignedStop.id ? " · your stop" : ""}</Popup>
        </CircleMarker>
      ))}
      {positions.map((position) => {
        const details = detailsByBusId.get(position.busId);
        if (!details) return null;
        return (
          <BusMarker
            key={`${position.busId}-${position.tripId}`}
            bus={details}
            selected={position.busId === selectedBusId}
            onSelect={() => onSelectBus(position.busId)}
          />
        );
      })}
      <CircleMarker
        center={[assignedStop.latitude, assignedStop.longitude]}
        radius={15}
        pathOptions={{
          color: "#70e3bd",
          fillColor: "#70e3bd",
          fillOpacity: 0.12,
          weight: 1,
        }}
        interactive={false}
      />
    </MapContainer>
  );
}
