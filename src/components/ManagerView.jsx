import { useState } from "react";
import { hireStatus, attentionIssues, managerSummary, progress, phaseBadge, isOverdue } from "../logic/onboarding.js";
import { STATUS_LABELS } from "../logic/format.js";
import HireHeader from "./HireHeader.jsx";
import PhaseGroups from "./PhaseGroups.jsx";
import Contacts from "./Contacts.jsx";

function StatusPill({ status }) {
  return <span className={`status-pill ${status.replace(" ", "-")}`}>{STATUS_LABELS[status]}</span>;
}

function MiniProgress({ hire }) {
  const { done, total } = progress(hire);
  return (
    <div className="mini-progress">
      <div className="progress small">
        <div className="progress-fill" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>
      <span className="muted">
        {done}/{total}
      </span>
    </div>
  );
}

function HireDetail({ hire, onBack }) {
  const overdue = hire.tasks.filter((t) => isOverdue(t, hire)).length;
  return (
    <div className="stack">
      <button className="link-button back" onClick={onBack}>
        ← Back to team
      </button>
      <HireHeader hire={hire}>
        <div className="detail-status">
          <StatusPill status={hireStatus(hire)} />
          {overdue > 0 && (
            <span className="text-danger">
              {overdue} overdue task{overdue === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </HireHeader>
      <section className="card">
        <div className="card-heading">
          <h2>Full plan</h2>
          <span className="muted">Overdue items are flagged in red</span>
        </div>
        <PhaseGroups hire={hire} />
      </section>
      <Contacts hire={hire} viewer="manager" title={`${hire.name}'s contacts`} />
    </div>
  );
}

export default function ManagerView({ managerName, hires }) {
  const [openId, setOpenId] = useState(null);
  const [followedUp, setFollowedUp] = useState([]);

  const open = hires.find((h) => h.id === openId);
  if (open) return <HireDetail hire={open} onBack={() => setOpenId(null)} />;

  const summary = managerSummary(hires);
  const attention = hires.filter((h) => hireStatus(h) === "needs attention");

  const stats = [
    { label: "New team members", value: summary.total },
    { label: "Starting soon", hint: "next 2 weeks", value: summary.startingSoon },
    { label: "In first month", value: summary.inFirstMonth },
    { label: "Needs attention", value: summary.needsAttention, alert: summary.needsAttention > 0 },
  ];

  return (
    <div className="stack">
      <div className="page-title">
        <h1>{managerName}'s team</h1>
        <p className="muted">Who's onboarding, and who needs a nudge.</p>
      </div>

      <div className="stats">
        {stats.map((s) => (
          <div key={s.label} className={`stat ${s.alert ? "alert" : ""}`}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">
              {s.label}
              {s.hint && <span className="muted"> · {s.hint}</span>}
            </div>
          </div>
        ))}
      </div>

      <section className="card">
        <div className="card-heading">
          <h2>Needs attention</h2>
        </div>
        {attention.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">Everyone's on track</div>
            <p className="muted">No overdue tasks or open preboarding to chase. Nice work.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Person</th>
                <th>Role</th>
                <th>Status</th>
                <th>Issue</th>
                <th aria-label="Action" />
              </tr>
            </thead>
            <tbody>
              {attention.map((h) => (
                <tr key={h.id}>
                  <td data-label="Person">
                    <button className="link-button strong" onClick={() => setOpenId(h.id)}>
                      {h.name}
                    </button>
                  </td>
                  <td data-label="Role">{h.role}</td>
                  <td data-label="Status">
                    <StatusPill status={hireStatus(h)} />
                  </td>
                  <td data-label="Issue">{attentionIssues(h).join(" · ")}</td>
                  <td className="cell-action">
                    {followedUp.includes(h.id) ? (
                      <span className="muted">Reminder sent ✓</span>
                    ) : (
                      <button className="secondary-button" onClick={() => setFollowedUp([...followedUp, h.id])}>
                        Follow up
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <div className="card-heading">
          <h2>People onboarding</h2>
          <span className="muted">Select someone to see their full plan</span>
        </div>
        <table className="table clickable">
          <thead>
            <tr>
              <th>Person</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {hires.map((h) => (
              <tr key={h.id} onClick={() => setOpenId(h.id)}>
                <td data-label="Person">
                  <button className="link-button strong" onClick={() => setOpenId(h.id)}>
                    {h.name}
                  </button>
                  <div className="muted small">
                    {h.role} · {phaseBadge(h)}
                  </div>
                </td>
                <td data-label="Plan">
                  {h.department}
                  {h.usedFallback && <div className="muted small">Core plan only</div>}
                </td>
                <td data-label="Status">
                  <StatusPill status={hireStatus(h)} />
                </td>
                <td data-label="Progress">
                  <MiniProgress hire={h} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
