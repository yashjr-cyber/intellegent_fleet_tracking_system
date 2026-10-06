import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Brand } from "./Brand";
import { Icon } from "./Icons";
import type { UserRole } from "../types/models";

const roleInfo: Record<UserRole, { label: string; displayName: string; initials: string }> = {
  student: { label: "STUDENT", displayName: "Anaya Rao", initials: "AR" },
  driver: { label: "DRIVER", displayName: "Mira Sen", initials: "MS" },
  admin: { label: "CAMPUS ADMIN", displayName: "Avery Chen", initials: "AC" },
};

const navItems: Record<UserRole, { id: string; label: string; icon: "grid" | "map" | "users" | "bus" | "clock" }[]> = {
  student: [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "my-journey", label: "My journey", icon: "map" },
    { id: "ride-history", label: "Ride history", icon: "clock" },
  ],
  driver: [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "today", label: "Today's trips", icon: "map" },
    { id: "vehicle", label: "My vehicle", icon: "bus" },
  ],
  admin: [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "fleet", label: "Fleet map", icon: "map" },
    { id: "people", label: "People", icon: "users" },
    { id: "attendance", label: "Attendance", icon: "clock" },
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
  const [activeSection, setActiveSection] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const info = roleInfo[role];

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
                setActiveSection(item.id);
                setMenuOpen(false);
                const targetId = item.id === "overview"
                  ? "dashboard-overview"
                  : role === "student"
                    ? item.id === "my-journey" ? "mobility-map" : "campus-schedule"
                    : role === "driver"
                      ? item.id === "today" ? "campus-schedule" : "mobility-map"
                      : item.id === "fleet" ? "mobility-map" : item.id === "people" ? "route-community" : "campus-activity";
                document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" });
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
              <p className="eyebrow">{activeSection === "overview" ? "TUESDAY, OCTOBER 6" : info.label}</p>
              <h1>{activeSection === "overview" ? title : navItems[role].find((item) => item.id === activeSection)?.label}</h1>
              <p>{activeSection === "overview" ? subtitle : "A helpful snapshot of your campus mobility experience."}</p>
            </div>
            <div className="page-heading__actions">
              <button className="soft-button"><Icon name="clock" size={16} /> Today <Icon name="chevron" size={14} /></button>
              <button className="primary-button" onClick={() => setActiveSection("overview")}><Icon name="grid" size={16} /> Overview</button>
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
