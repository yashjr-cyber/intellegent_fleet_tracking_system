import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { Icon } from "../components/Icons";
import { demoFleetService } from "../services/demoFleetService";
import type { FleetSnapshot, UserRole } from "../types/models";

const headings: Record<UserRole, { title: string; subtitle: string }> = {
  student: {
    title: "Good morning, Anaya",
    subtitle: "Your campus journey is looking good today.",
  },
  driver: {
    title: "Good morning, Mira",
    subtitle: "A clear view of your route and the day ahead.",
  },
  admin: {
    title: "Good morning, Avery",
    subtitle: "Here’s what’s moving across campus today.",
  },
};

export function DashboardPage({ role }: { role: UserRole }) {
  const [snapshot, setSnapshot] = useState<FleetSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isCurrent = true;
    demoFleetService.getSnapshot().then(
      (data) => {
        if (isCurrent) setSnapshot(data);
      },
      () => {
        if (isCurrent) setLoadError("We couldn't load the demo campus snapshot. Please refresh to try again.");
      },
    );
    return () => {
      isCurrent = false;
    };
  }, []);

  if (loadError) {
    return <div className="load-error" role="alert">{loadError}</div>;
  }

  if (!snapshot) {
    return <div className="loading-state" role="status">Preparing your campus snapshot…</div>;
  }

  const assignment = role === "student"
    ? snapshot.tripAssignments[0]
    : role === "driver"
      ? snapshot.tripAssignments.find((item) => item.driverId === "driver-mira")
      : snapshot.tripAssignments[0];
  const trip = snapshot.trips.find((item) => item.id === assignment?.tripId);
  const route = snapshot.routes.find((item) => item.id === trip?.routeId);
  const bus = snapshot.buses.find((item) => item.id === assignment?.busId);
  const telemetry = snapshot.gpsTelemetry.find((item) => item.trackerId === assignment?.trackerId);

  const stats = role === "student"
    ? [
        { label: "Next pickup", value: "08:15", note: "North Residences", icon: "clock" as const, tone: "mint" },
        { label: "Your route", value: route?.code ?? "N-01", note: route?.name ?? "North loop", icon: "map" as const, tone: "blue" },
        { label: "On the way", value: "4 min", note: `${bus?.label ?? "Aurora"} · ${bus?.registration ?? "DEMO-101"}`, icon: "bus" as const, tone: "violet" },
      ]
    : role === "driver"
      ? [
          { label: "Today's trips", value: "4", note: "1 trip in progress", icon: "map" as const, tone: "mint" },
          { label: "Next departure", value: "09:00", note: "Garden district · G-02", icon: "clock" as const, tone: "blue" },
          { label: "Assigned vehicle", value: bus?.label ?? "Aurora", note: bus?.registration ?? "DEMO-101", icon: "bus" as const, tone: "violet" },
        ]
      : [
          { label: "Active routes", value: `${snapshot.routes.length}`, note: "Across campus", icon: "map" as const, tone: "mint" },
          { label: "Buses moving", value: "2", note: "1 vehicle in service", icon: "bus" as const, tone: "blue" },
          { label: "Students today", value: "286", note: "Attendance is up to date", icon: "users" as const, tone: "violet" },
        ];

  return (
    <DashboardLayout role={role} title={headings[role].title} subtitle={headings[role].subtitle}>
      <section className="stats-grid" aria-label="Mobility overview">
        {stats.map((stat) => (
          <article className="stat-card glass-panel" key={stat.label}>
            <div className="stat-card__top"><span>{stat.label}</span><span className={`stat-icon stat-icon--${stat.tone}`}><Icon name={stat.icon} size={18} /></span></div>
            <strong className="stat-card__value">{stat.value}</strong>
            <span className="stat-card__note"><span className="mini-check"><Icon name="check" size={11} /></span>{stat.note}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="map-card glass-panel" id="mobility-map">
          <div className="card-heading">
            <div><p className="eyebrow">LIVE CAMPUS VIEW</p><h2>{role === "student" ? "Your ride is on the way" : role === "driver" ? "Your route today" : "Mobility at a glance"}</h2></div>
            <span className="live-badge"><span className="live-dot" /> LIVE DEMO</span>
          </div>
          <div className="map-visual">
            <div className="map-grid" />
            <svg className="map-route" viewBox="0 0 700 280" preserveAspectRatio="none" aria-hidden="true">
              <path d="M57 200 C130 200 118 108 218 108 S323 195 390 154 459 71 521 98 593 192 653 122" fill="none" stroke="rgba(82,220,183,.16)" strokeWidth="15" strokeLinecap="round" />
              <path d="M57 200 C130 200 118 108 218 108 S323 195 390 154 459 71 521 98 593 192 653 122" fill="none" stroke="#57d8b5" strokeWidth="3" strokeDasharray="5 8" strokeLinecap="round" />
            </svg>
            <span className="map-label map-label--one"><Icon name="pin" size={13} /> Library</span>
            <span className="map-label map-label--two"><Icon name="pin" size={13} /> North residences</span>
            <span className="map-label map-label--three"><Icon name="pin" size={13} /> East gate</span>
            <span className="map-bus map-bus--one"><Icon name="bus" size={17} /></span>
            <span className="map-bus map-bus--two"><Icon name="bus" size={17} /></span>
            <div className="map-campus-label">NORTHSTAR<br />CAMPUS</div>
            <div className="map-scale"><span /> 500 m</div>
          </div>
          <div className="map-card__footer">
            <div className="route-status"><span className="route-status__dot" /><span><strong>{route?.name ?? "North loop"}</strong><small>{route?.code ?? "N-01"} <span>·</span> {bus?.label ?? "Aurora"} <span>·</span> {telemetry?.speedKph ?? 24} km/h</small></span></div>
            <button className="text-button" onClick={() => navigate(`/${role}`)}>View route <Icon name="arrow" size={16} /></button>
          </div>
        </article>

        <article className="activity-card glass-panel" id="campus-activity">
          <div className="card-heading">
            <div><p className="eyebrow">A LITTLE HEADS-UP</p><h2>{role === "student" ? "On your way" : "The next few hours"}</h2></div>
            <button className="more-button" aria-label="More activity options">···</button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-item__icon activity-item__icon--mint"><Icon name="bus" size={17} /></span>
              <span className="activity-item__body"><strong>{role === "student" ? "Aurora is nearby" : "North loop in progress"}</strong><small>{role === "student" ? "Your bus is a few minutes away" : "Mira Sen · 6 stops remaining"}</small></span>
              <span className="activity-item__time">4 min</span>
            </div>
            <div className="activity-item">
              <span className="activity-item__icon activity-item__icon--blue"><Icon name="pin" size={17} /></span>
              <span className="activity-item__body"><strong>{role === "driver" ? "Next: North Residences" : "Pickup at Residences"}</strong><small>North loop · stop 2 of 3</small></span>
              <span className="activity-item__time">08:21</span>
            </div>
            <div className="activity-item">
              <span className="activity-item__icon activity-item__icon--violet"><Icon name="check" size={17} /></span>
              <span className="activity-item__body"><strong>Everything looks good</strong><small>{role === "admin" ? "2 trackers reporting" : "No changes to your journey"}</small></span>
              <span className="activity-item__time">Now</span>
            </div>
          </div>
          <div className="activity-note"><span className="activity-note__mark"><Icon name="spark" size={15} /></span><span><strong>Good to know</strong><br />Today's schedule is running smoothly.</span></div>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="schedule-card glass-panel" id="campus-schedule">
          <div className="card-heading">
            <div><p className="eyebrow">COMING UP</p><h2>{role === "student" ? "Your campus day" : "Upcoming trips"}</h2></div>
            <button className="text-button" onClick={() => navigate(`/${role}`)}>Full schedule <Icon name="arrow" size={16} /></button>
          </div>
          <div className="schedule-row">
            <span className="schedule-time">08:15<small>AM</small></span>
            <span className="schedule-timeline"><i /></span>
            <span className="schedule-details"><strong>{role === "student" ? "North Residences pickup" : "North loop"}</strong><small>{route?.name ?? "North loop"} · {route?.estimatedDurationMinutes ?? 28} min</small></span>
            <span className="schedule-tag schedule-tag--active">In progress</span>
          </div>
          <div className="schedule-row">
            <span className="schedule-time">09:00<small>AM</small></span>
            <span className="schedule-timeline"><i /></span>
            <span className="schedule-details"><strong>{role === "student" ? "Class at North Hall" : "Garden district"}</strong><small>Garden Quarter · {bus?.label === "Cascade" ? "DEMO-204" : "Cascade"}</small></span>
            <span className="schedule-tag">Upcoming</span>
          </div>
        </article>
        <article className="people-card glass-panel" id="route-community">
          <div className="people-card__head"><div className="avatar-stack"><span>AR</span><span>IM</span><span>KS</span><span>+8</span></div><span className="people-card__count">11 <small>on this route</small></span></div>
          <h2>{role === "student" ? "Good company." : "Every journey, connected."}</h2>
          <p>{role === "driver" ? "Your passenger list is ready when you are." : "A little easier when the whole campus moves together."}</p>
          <div className="people-card__foot"><span><Icon name="users" size={16} /> {role === "admin" ? "People & attendance" : "North loop community"}</span><Icon name="chevron" size={16} /></div>
        </article>
      </section>
    </DashboardLayout>
  );
}
