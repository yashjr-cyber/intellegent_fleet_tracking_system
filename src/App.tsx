import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RouteMetadata } from "./components/RouteMetadata";
import { useAuth } from "./auth/AuthContext";
import { PublicLandingPage } from "./pages/PublicLandingPage";
import { SignInPage } from "./pages/SignInPage";
import type { UserRole } from "./types/models";

const AdminDashboardPage = lazy(() =>
  import("./pages/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })),
);
const DriverDashboardPage = lazy(() =>
  import("./pages/DriverDashboardPage").then((module) => ({ default: module.DriverDashboardPage })),
);
const StudentAttendancePage = lazy(() =>
  import("./pages/StudentAttendancePage").then((module) => ({ default: module.StudentAttendancePage })),
);
const StudentDashboardPage = lazy(() =>
  import("./pages/StudentDashboardPage").then((module) => ({ default: module.StudentDashboardPage })),
);

function ProtectedDashboard({
  role,
  children,
}: {
  role: UserRole;
  children?: ReactNode;
}) {
  const { role: signedInRole } = useAuth();
  if (!signedInRole) return <Navigate to="/" replace />;
  if (signedInRole !== role) return <Navigate to={`/${signedInRole}`} replace />;
  if (children) return children;
  if (role === "student") return <StudentDashboardPage />;
  if (role === "driver") return <DriverDashboardPage />;
  return <AdminDashboardPage />;
}

function NotFoundPage() {
  return (
    <main className="public-not-found">
      <p className="public-home__eyebrow">404 · PAGE NOT FOUND</p>
      <h1>This page isn't here.</h1>
      <p>The address may be outdated, or the page may have moved.</p>
      <a className="public-home__primary" href={import.meta.env.BASE_URL}>Return to Wayfinder Mobility</a>
    </main>
  );
}

export function App() {
  return (
    <>
      <RouteMetadata />
      <Suspense fallback={<div className="loading-state" role="status">Opening your workspace…</div>}>
        <Routes>
          <Route path="/" element={<PublicLandingPage />} />
          <Route path="/demo" element={<SignInPage />} />
          <Route path="/student" element={<ProtectedDashboard role="student" />} />
          <Route
            path="/student/attendance"
            element={
              <ProtectedDashboard role="student">
                <StudentAttendancePage />
              </ProtectedDashboard>
            }
          />
          <Route path="/driver/*" element={<ProtectedDashboard role="driver" />} />
          <Route path="/admin/*" element={<ProtectedDashboard role="admin" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
