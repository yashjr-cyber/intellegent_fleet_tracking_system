import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Brand } from "./Brand";
import { Icon } from "./Icons";
import type { UserRole } from "../types/models";

const roleInfo: Record<UserRole, { label: string; displayName: string; initials: string }> = {
  student: { label: "STUDENT", displayName: "Anaya Rao", initials: "AR" },
  driver: { label: "DRIVER", displayName: "Mira Sen", initials: "MS" },
  admin: { label: "CAMPUS ADMIN", displayName: "Avery Chen", initials: "AC" },
};

const navItems: Record<UserRole, { id: string; label: string; icon: "grid" | "map" | "users" | "bus" | "clock"; href?: string }[]> = {
  student: [
    { id: "overview", label: "Overview", icon: "grid", href: "/student" },
    { id: "my-journey", label: "My journey", icon: "map", href: "/student?section=my-journey" },
    { id: "attendance", label: "My attendance", icon: "clock", href: "/student/attendance" },
  ],
  driver: [
    { id: "overview", label: "Overview", icon: "grid", href: "/driver" },
    { id: "today", label: "Today's trips", icon: "map", href: "/driver/trips" },
    { id: "vehicle", label: "My vehicle", icon: "bus", href: "/driver/vehicle" },
  ],
  admin: [
    { id: "overview", label: "Overview", icon: "grid", href: "/admin" },
    { id: "fleet", label: "Fleet map", icon: "map", href: "/admin/fleet" },
    { id: "vehicles", label: "Buses & trackers", icon: "bus", href: "/admin/buses" },
    { id: "routes", label: "Routes & stops", icon: "map", href: "/admin/routes" },
    { id: "trips", label: "Trips & assignments", icon: "clock", href: "/admin/trips" },
    { id: "people", label: "Drivers", icon: "users", href: "/admin/drivers" },
    { id: "attendance", label: "Attendance", icon: "clock", href: "/admin/attendance" },
    { id: "analytics", label: "Analytics", icon: "grid", href: "/admin/analytics" },
    { id: "lora", label: "LoRa network", icon: "map", href: "/admin/lora" },
  ],
};

export function DashboardLayout({
  role,
  title,
  subtitle,
  children,
}: {
  role: UserRole;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [selectedSection, setSelectedSection] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const info = roleInfo[role];
  const requestedSection = new URLSearchParams(location.search).get("section");
  const routeSection = navItems[role].find((item) => item.href === location.pathname)?.id;
  const activeSection = role === "student" && requestedSection === "my-journey"
    ? "my-journey"
    : routeSection ?? selectedSection;

  useEffect(() => {
    if (role !== "student" || location.pathname !== "/student" || activeSection !== "my-journey") {
      return;
    }
    document.getElementById("student-live-map")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSection, location.pathname, role]);

  function leaveDemo() {
    signOut();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar${menuOpen ? " sidebar--open" : ""}`}>
        <div className="sidebar__brand"><Brand /></div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-pill">
          <span className="workspace-pill__crest">N</span>
          <span><strong>Northstar Institute</strong><small>Campus mobility</small></span>
          <Icon name="chevron" size={16} />
        </div>
        <div className="sidebar__section-label">YOUR SPACE</div>
        <nav className="sidebar__nav" aria-label={`${info.label} navigation`}>
          {navItems[role].map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeSection === item.id ? " nav-item--active" : ""}`}
              onClick={() => {
                setMenuOpen(false);
                setSelectedSection(item.id);
                if (item.href) navigate(item.href);
              }}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {item.id === "overview" && <span className="nav-item__active-mark" />}
            </button>
          ))}
        </nav>
        <div className="sidebar__bottom">
          <div className="help-card">
            <span className="help-card__icon"><Icon name="spark" size={17} /></span>
            <strong>A smoother day starts here.</strong>
            <p>Your campus mobility, all in one place.</p>
          </div>
          <button className="profile-button" onClick={leaveDemo}>
            <span className="avatar">{info.initials}</span>
            <span className="profile-button__copy"><strong>{info.displayName}</strong><small>{info.label}</small></span>
            <Icon name="logout" size={17} />
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name="menu" size={21} />
          </button>
          <div className="breadcrumb"><span>Northstar Institute</span><Icon name="chevron" size={15} /><strong>{info.label.toLowerCase()}</strong></div>
          <div className="topbar__right">
            <div className="system-live"><span className="live-dot" /> DEMO SYSTEM</div>
            <button className="icon-button" aria-label="Notifications"><Icon name="bell" size={19} /><span className="notification-dot" /></button>
            <span className="avatar avatar--small">{info.initials}</span>
          </div>
        </header>

        <div className="dashboard-content" id="dashboard-overview">
          <div className="page-heading">
            <div>
              <p className="eyebrow">{activeSection === "overview" ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase() : info.label}</p>
              <h1>{activeSection === "overview" ? title : navItems[role].find((item) => item.id === activeSection)?.label}</h1>
              <p>
                {activeSection === "overview"
                  ? subtitle
                  : activeSection === "attendance"
                    ? "A read-only record of your RFID check-ins for campus rides."
                    : "Your campus journey, in view from pickup through arrival."}
              </p>
            </div>
            <div className="page-heading__actions">
              <button className="soft-button"><Icon name="clock" size={16} /> Today <Icon name="chevron" size={14} /></button>
              <button
                className="primary-button"
                onClick={() => {
                  setSelectedSection("overview");
                  if (role === "student") {
                    navigate("/student");
                    return;
                  }
                  document.getElementById("dashboard-overview")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Icon name="grid" size={16} /> Overview
              </button>
            </div>
          </div>
          {children}
          <div className="demo-footer"><span>WAYFINDER · NORTHSTAR INSTITUTE</span><span>FICTIONAL DEMO DATA — PREVIEW ONLY</span></div>
        </div>
      </main>
      {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}
