import { tasksByPhase } from "../logic/onboarding.js";
import { PHASE_LABELS } from "../logic/format.js";
import TaskRow from "./TaskRow.jsx";

export default function PhaseGroups({ hire, onUndo }) {
  return tasksByPhase(hire)
    .filter((group) => group.tasks.length)
    .map(({ phase, tasks }) => {
      const done = tasks.filter((t) => t.status === "done").length;
      return (
        <section key={phase} className="phase-group">
          <h3>
            {PHASE_LABELS[phase]} <span className="muted">{done}/{tasks.length}</span>
          </h3>
          <ul className="task-list">
            {tasks.map((t) => (
              <TaskRow key={t.id} task={t} hire={hire} onUndo={onUndo} />
            ))}
          </ul>
        </section>
      );
    });
}
