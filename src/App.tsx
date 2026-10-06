import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { SignInPage } from "./pages/SignInPage";
import type { UserRole } from "./types/models";

function ProtectedDashboard({ role }: { role: UserRole }) {
  const { role: signedInRole } = useAuth();
  if (!signedInRole) return <Navigate to="/" replace />;
  if (signedInRole !== role) return <Navigate to={`/${signedInRole}`} replace />;
  return <DashboardPage role={role} />;
}

export function App() {
  const { role } = useAuth();
  return (
    <Routes>
      <Route path="/" element={role ? <Navigate to={`/${role}`} replace /> : <SignInPage />} />
      <Route path="/student" element={<ProtectedDashboard role="student" />} />
      <Route path="/driver" element={<ProtectedDashboard role="driver" />} />
      <Route path="/admin" element={<ProtectedDashboard role="admin" />} />
      <Route path="*" element={<Navigate to={role ? `/${role}` : "/"} replace />} />
    </Routes>
  );
}
