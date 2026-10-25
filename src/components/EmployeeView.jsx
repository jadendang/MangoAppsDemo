import { useState } from "react";
import { nextActions, comingUp, isOverdue } from "../logic/onboarding.js";
import { whyLine, ownerNote } from "../logic/format.js";
import HireHeader from "./HireHeader.jsx";
import TaskRow from "./TaskRow.jsx";
import PhaseGroups from "./PhaseGroups.jsx";
import TaskHelp from "./TaskHelp.jsx";
import Contacts from "./Contacts.jsx";

function NextActionCard({ task, hire, onDone }) {
  const overdue = isOverdue(task, hire);
  const note = ownerNote(task);
  return (
    <li className={`action-card ${overdue ? "is-overdue" : ""}`}>
      <div className="action-card-body">
        <div className="action-title">{task.title}</div>
        <div className={`action-why ${overdue ? "text-danger" : ""}`}>{whyLine(task, hire)}</div>
        <div className="action-chips">
          {!task.required && <span className="chip">Optional</span>}
          {task.compliance && <span className="chip">Compliance</span>}
          {note && <span className="chip chip-owner">{note}</span>}
        </div>
        <TaskHelp task={task} hire={hire} viewer="employee" />
      </div>
      <button className="primary-button" onClick={() => onDone(task.id)}>
        {task.compliance ? "Acknowledge" : "Mark done"}
      </button>
    </li>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="empty-state">
      <div className="empty-title">{title}</div>
      <p className="muted">{body}</p>
    </div>
  );
}

export default function EmployeeView({ hire, onDone, onUndo, unlocked, onDismissUnlocked }) {
  const [tab, setTab] = useState("next");

  const next = nextActions(hire);
  const upcoming = comingUp(hire);
  const completed = hire.tasks.filter((t) => t.status === "done");
  const acknowledged = completed.filter((t) => t.compliance).length;
  const allDone = completed.length === hire.tasks.length;

  const tabs = [
    { id: "next", label: "Next Actions", count: next.length },
    { id: "coming", label: "Coming up", count: upcoming.length },
    { id: "completed", label: "Completed", count: completed.length },
    { id: "all", label: "All tasks", count: hire.tasks.length },
  ];

  return (
    <div className="stack">
      <HireHeader hire={hire} />

      {unlocked.length > 0 && (
        <div className="toast" role="status">
          <span>
            Unlocked: <strong>{unlocked.join(", ")}</strong>
          </span>
          <button className="link-button" onClick={onDismissUnlocked} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      <nav className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            <span className="tab-count">{t.count}</span>
          </button>
        ))}
      </nav>

      {tab === "next" && (
        <section className="card">
          <div className="card-heading">
            <h2>Your next steps</h2>
            {!allDone && <span className="muted">The {next.length === 1 ? "one thing" : `${next.length} things`} that matter most right now</span>}
          </div>
          {allDone ? (
            <EmptyState
              title="You're all set 🎉"
              body={`Every onboarding task is complete. Welcome to the team, ${hire.name}.`}
            />
          ) : next.length === 0 ? (
            <EmptyState
              title="Nothing for you right now"
              body="Your remaining tasks are waiting on someone else. Check Coming up to see what's next."
            />
          ) : (
            <ul className="action-list">
              {next.map((t) => (
                <NextActionCard key={t.id} task={t} hire={hire} onDone={onDone} />
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "next" && !allDone && <Contacts hire={hire} viewer="employee" />}

      {tab === "coming" && (
        <section className="card">
          <div className="card-heading">
            <h2>Coming up</h2>
            <span className="muted">Later tasks, and ones waiting on something else</span>
          </div>
          {upcoming.length ? (
            <ul className="task-list">
              {upcoming.map((t) => (
                <TaskRow key={t.id} task={t} hire={hire} />
              ))}
            </ul>
          ) : (
            <EmptyState title="Nothing queued" body="Everything left is already in your Next Actions." />
          )}
        </section>
      )}

      {tab === "completed" && (
        <section className="card">
          <div className="card-heading">
            <h2>Completed</h2>
            {acknowledged > 0 && (
              <span className="muted">
                Includes {acknowledged} compliance acknowledgement{acknowledged === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {completed.length ? (
            <ul className="task-list">
              {completed.map((t) => (
                <TaskRow key={t.id} task={t} hire={hire} onUndo={onUndo} />
              ))}
            </ul>
          ) : (
            <EmptyState title="Nothing done yet" body="Start with the first item in Next Actions." />
          )}
        </section>
      )}

      {tab === "all" && (
        <section className="card">
          <div className="card-heading">
            <h2>All tasks</h2>
            <span className="muted">Your full plan, by phase</span>
          </div>
          <PhaseGroups hire={hire} onUndo={onUndo} />
        </section>
      )}
    </div>
  );
}
