import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { setWorkerUrl } from "maplibre-gl";
import mapLibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { App } from "./App";
import { AuthProvider } from "./auth/AuthContext";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";

setWorkerUrl(mapLibreWorkerUrl);

const redirect = new URLSearchParams(window.location.search).get("redirect");
if (redirect?.startsWith(import.meta.env.BASE_URL)) {
  window.history.replaceState(null, "", redirect);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
