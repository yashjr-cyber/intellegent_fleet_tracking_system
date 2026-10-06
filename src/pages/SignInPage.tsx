import { useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { Icon } from "../components/Icons";
import { useAuth } from "../auth/AuthContext";
import type { UserRole } from "../types/models";

const roles: {
  id: UserRole;
  title: string;
  detail: string;
  icon: "users" | "bus" | "grid";
  initials: string;
}[] = [
  {
    id: "student",
    title: "Student",
    detail: "Your ride, at a glance",
    icon: "users",
    initials: "AR",
  },
  {
    id: "driver",
    title: "Driver",
    detail: "The day, in your hands",
    icon: "bus",
    initials: "MS",
  },
  {
    id: "admin",
    title: "Campus team",
    detail: "A clearer view of every route",
    icon: "grid",
    initials: "AC",
  },
];

export function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  function enterAs(role: UserRole) {
    signIn(role);
    navigate(`/${role}`);
  }

  return (
    <main className="signin">
      <div className="signin__ambient signin__ambient--one" />
      <div className="signin__ambient signin__ambient--two" />
      <header className="signin__topbar">
        <Brand />
        <span className="topbar-note"><span className="live-dot" /> Your campus, connected</span>
      </header>

      <section className="signin__content">
        <div className="signin__copy">
          <p className="eyebrow"><span /> MOBILITY, IN GOOD COMPANY</p>
          <h1>Every journey<br />has a <span>better way.</span></h1>
          <p className="signin__description">
            A little more clarity for the journeys that bring your campus together.
            Welcome to a calmer kind of commute.
          </p>
          <div className="signin__proof">
            <span className="proof-avatars" aria-hidden="true">
              <span>AR</span><span>MS</span><span>AC</span>
            </span>
            <span><strong>One connected campus</strong><br />Made for the people who move it</span>
          </div>
        </div>

        <div className="signin-card glass-panel">
          <div className="signin-card__heading">
            <div>
              <p className="eyebrow">YOUR WAYFINDER</p>
              <h2>Welcome in.</h2>
              <p>Choose a demo view to explore the experience.</p>
            </div>
            <span className="signin-card__spark"><Icon name="spark" size={22} /></span>
          </div>

          <div className="role-list">
            {roles.map((role) => (
              <button className="role-option" key={role.id} onClick={() => enterAs(role.id)}>
                <span className={`role-option__icon role-option__icon--${role.id}`}>
                  <Icon name={role.icon} size={19} />
                </span>
                <span className="role-option__copy">
                  <strong>{role.title}</strong>
                  <small>{role.detail}</small>
                </span>
                <span className="role-option__arrow"><Icon name="arrow" size={18} /></span>
              </button>
            ))}
          </div>

          <div className="demo-notice">
            <span className="demo-notice__icon"><Icon name="spark" size={16} /></span>
            <p><strong>Demo experience</strong><br />Fictional profiles and sample data. No password required.</p>
          </div>
        </div>
      </section>

      <footer className="signin__footer">
        <span>© 2026 Wayfinder Mobility</span>
        <span><span className="status-indicator" /> SYSTEM PREVIEW <span className="footer-separator">·</span> NOT FOR LIVE OPERATIONS</span>
      </footer>
    </main>
  );
}
