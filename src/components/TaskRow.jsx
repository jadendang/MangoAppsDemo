import { isOverdue, isBlocked } from "../logic/onboarding.js";
import { dueLabel, waitingLine, ownerName, doneLabel } from "../logic/format.js";

// A compact task line used by Coming up, Completed, All tasks and the manager drill-in.
export default function TaskRow({ task, hire, onUndo, showOwner = true }) {
  const done = task.status === "done";
  const overdue = isOverdue(task, hire);
  const blocked = !done && isBlocked(task, hire);
  const waiting = blocked ? waitingLine(task, hire) : null;

  let state = { label: "Open", cls: "" };
  if (done) state = { label: doneLabel(task), cls: task.compliance ? "acknowledged" : "done" };
  else if (overdue) state = { label: "Overdue", cls: "overdue" };
  else if (blocked) state = { label: "Blocked", cls: "blocked" };

  return (
    <li className={`task-row ${overdue ? "is-overdue" : ""} ${done ? "is-done" : ""}`}>
      <span className={`state-dot ${state.cls}`} aria-hidden="true" />
      <div className="task-row-main">
        <div className="task-row-title">{task.title}</div>
        <div className="task-row-meta">
          {done ? (
            <span>{state.label}</span>
          ) : (
            <span className={overdue ? "text-danger" : ""}>{waiting ?? dueLabel(task, hire)}</span>
          )}
          <span className="chip">{task.required ? "Required" : "Optional"}</span>
          {task.compliance && <span className="chip">Compliance</span>}
          {showOwner && task.owner !== "employee" && <span className="chip">{ownerName(task)}</span>}
        </div>
      </div>
      {!done && <span className={`state-tag ${state.cls}`}>{state.label}</span>}
      {done && onUndo && (
        <button className="link-button" onClick={() => onUndo(task.id)}>
          Undo
        </button>
      )}
    </li>
  );
}
