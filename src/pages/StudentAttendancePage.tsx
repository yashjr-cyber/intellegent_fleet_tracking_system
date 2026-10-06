import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { Icon } from "../components/Icons";
import { demoFleetService } from "../services/demoFleetService";
import type { FleetSnapshot } from "../types/models";

export function StudentAttendancePage() {
  const [snapshot, setSnapshot] = useState<FleetSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isCurrent = true;
    const loadSnapshot = () => {
      demoFleetService.getSnapshot().then(
        (data) => {
          if (isCurrent) {
            setSnapshot(data);
            setLoadError(null);
          }
        },
        () => {
          if (!isCurrent) return;
          setLoadError("We couldn't load your attendance history. Please refresh to try again.");
        },
      );
    };
    loadSnapshot();
    const unsubscribe = demoFleetService.subscribe(loadSnapshot);
    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, []);

  const heading = "Your attendance, at a glance.";

  return (
    <DashboardLayout
      role="student"
      title={heading}
      subtitle="A read-only record of your RFID check-ins for campus rides."
    >
      <section className="student-attendance-card glass-panel">
        <div className="student-attendance-card__heading">
          <div>
            <p className="eyebrow">MY ATTENDANCE</p>
            <h2>Ride check-ins</h2>
            <p>Attendance records come from RFID events and cannot be changed here.</p>
          </div>
          <button className="soft-button" onClick={() => navigate("/student")}>
            <Icon name="arrow" size={16} /> Back to my journey
          </button>
        </div>
        {loadError ? (
          <div className="student-state student-state--error" role="alert">{loadError}</div>
        ) : !snapshot ? (
          <div className="student-state" role="status"><span className="student-loading-dot" /> Loading your attendance…</div>
        ) : (() => {
          const student = snapshot.students.find((item) => item.id === "student-anaya");
          const events = snapshot.attendanceEvents
            .filter((event) => event.studentId === student?.id)
            .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
          if (events.length === 0) {
            return (
              <div className="student-attendance-empty">
                <span className="stat-icon stat-icon--mint"><Icon name="clock" size={20} /></span>
                <h3>No rides recorded yet</h3>
                <p>Your attendance appears here after your RFID card is scanned on a campus bus.</p>
              </div>
            );
          }
          return (
            <div className="student-attendance-table-wrap">
              <table className="student-attendance-table">
                <thead>
                  <tr>
                    <th scope="col">DATE</th>
                    <th scope="col">ROUTE &amp; TRIP</th>
                    <th scope="col">BUS</th>
                    <th scope="col">RFID EVENT</th>
                    <th scope="col">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const trip = snapshot.trips.find((item) => item.id === event.tripId);
                    const route = snapshot.routes.find((item) => item.id === trip?.routeId);
                    const assignment = snapshot.tripAssignments.find((item) => item.tripId === event.tripId);
                    const bus = snapshot.buses.find((item) => item.id === assignment?.busId);
                    const card = snapshot.rfidCards.find((item) => item.id === event.cardId);
                    const stop = snapshot.stops.find((item) => item.id === event.stopId);
                    const occurredAt = new Date(event.occurredAt);
                    return (
                      <tr key={event.id}>
                        <td data-label="Date">
                          <strong>{occurredAt.toLocaleDateString([], {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}</strong>
                          <small>{occurredAt.toLocaleDateString([], { weekday: "long" })}</small>
                        </td>
                        <td data-label="Route & trip">
                          <strong>{route?.name ?? "Campus route"}</strong>
                          <small>{route?.code ?? "—"} · {trip?.direction === "homebound" ? "Homebound" : "Campus bound"}</small>
                        </td>
                        <td data-label="Bus">
                          <strong>{bus?.label ?? "—"}</strong>
                          <small>{bus?.registration ?? "Unassigned"}</small>
                        </td>
                        <td data-label="RFID event">
                          <strong>{occurredAt.toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })} · {event.eventType}</strong>
                          <small>{stop?.name ?? "Stop not recorded"} · {card?.cardNumber ?? "Demo card"}</small>
                        </td>
                        <td data-label="Status">
                          <span className="attendance-status"><Icon name="check" size={13} /> Present</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="student-attendance-footnote">
                <Icon name="spark" size={15} /> Fictional demo records · RFID details are read-only in this student view.
              </p>
            </div>
          );
        })()}
      </section>
    </DashboardLayout>
  );
}
