import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./auth/AuthContext";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { DriverDashboardPage } from "./pages/DriverDashboardPage";
import { SignInPage } from "./pages/SignInPage";
import { StudentAttendancePage } from "./pages/StudentAttendancePage";
import { StudentDashboardPage } from "./pages/StudentDashboardPage";
import type { UserRole } from "./types/models";

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

export function App() {
  const { role } = useAuth();
  return (
    <Routes>
      <Route path="/" element={role ? <Navigate to={`/${role}`} replace /> : <SignInPage />} />
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
      <Route path="*" element={<Navigate to={role ? `/${role}` : "/"} replace />} />
    </Routes>
  );
}
