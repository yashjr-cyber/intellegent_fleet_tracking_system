import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { PublicLandingPage } from "./pages/PublicLandingPage";
import "./styles.css";

const redirect = new URLSearchParams(window.location.search).get("redirect");
if (redirect?.startsWith(import.meta.env.BASE_URL)) {
  window.history.replaceState(null, "", redirect);
}

const baseUrl = import.meta.env.BASE_URL;
const appPath = window.location.pathname.startsWith(baseUrl)
  ? `/${window.location.pathname.slice(baseUrl.length)}`
  : window.location.pathname;
const root = document.getElementById("root")!;

if (appPath === "/") {
  hydrateRoot(root, <React.StrictMode><PublicLandingPage /></React.StrictMode>);
} else {
  createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter basename={baseUrl}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}
