// Pure onboarding logic. Every date comparison uses TODAY, never the system clock.
// Dates are handled as UTC midnight so "YYYY-MM-DD" strings compare cleanly.

export const TODAY = new Date("2026-10-26");

const DAY_MS = 24 * 60 * 60 * 1000;

function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

function addDays(date, days) {
  return new Date(toDate(date).getTime() + days * DAY_MS);
}

// Whole days from `a` to `b` (positive when b is later).
export function daysBetween(a, b) {
  return Math.round((toDate(b).getTime() - toDate(a).getTime()) / DAY_MS);
}

export function formatDate(date) {
  return toDate(date).toISOString().slice(0, 10);
}

function findTask(hire, id) {
  return hire.tasks.find((t) => t.id === id);
}

export function dueDate(task, hire) {
  return addDays(hire.startDate, task.dueOffsetDays);
}

// Open tasks listed in task.blockedBy. A missing id is treated as not blocking.
export function openBlockers(task, hire) {
  return task.blockedBy
    .map((id) => findTask(hire, id))
    .filter((blocker) => blocker && blocker.status !== "done");
}

export function isBlocked(task, hire) {
  return openBlockers(task, hire).length > 0;
}

// Due today is NOT overdue.
export function isOverdue(task, hire) {
  return task.status === "open" && dueDate(task, hire) < TODAY;
}

// Open tasks that list this task as a blocker.
export function blocksTasks(task, hire) {
  return hire.tasks.filter((t) => t.status === "open" && t.blockedBy.includes(task.id));
}

function compareTasks(hire) {
  return (a, b) => {
    const aPre = a.phase === "pre-start" ? 0 : 1;
    const bPre = b.phase === "pre-start" ? 0 : 1;
    if (aPre !== bPre) return aPre - bPre;
    const byDue = dueDate(a, hire) - dueDate(b, hire);
    if (byDue !== 0) return byDue;
    return (a.required ? 0 : 1) - (b.required ? 0 : 1);
  };
}

// Open, unblocked tasks in priority order (Array.sort is stable, so template order breaks ties).
export function eligibleTasks(hire) {
  return hire.tasks
    .filter((t) => t.status === "open" && !isBlocked(t, hire))
    .sort(compareTasks(hire));
}

export function nextActions(hire) {
  return eligibleTasks(hire).slice(0, 3);
}

// Eligible-but-not-top-3, followed by blocked tasks.
export function comingUp(hire) {
  const eligible = eligibleTasks(hire).slice(3);
  const blocked = hire.tasks
    .filter((t) => t.status === "open" && isBlocked(t, hire))
    .sort(compareTasks(hire));
  return [...eligible, ...blocked];
}

// "needs attention" is checked first so an untouched hire who is about to start
// (or overdue) is surfaced rather than reported as merely "not started".
export function hireStatus(hire) {
  const daysToStart = daysBetween(TODAY, hire.startDate);
  const needsAttention = hire.tasks.some(
    (t) =>
      t.required &&
      (isOverdue(t, hire) ||
        (t.phase === "pre-start" && t.status === "open" && daysToStart <= 3))
  );
  if (needsAttention) return "needs attention";
  if (!hire.tasks.some((t) => t.status === "done")) return "not started";
  return "on track";
}

// One-line "why" for a task, e.g. "overdue by 3 days · blocks Set up dev environment".
export function taskReason(task, hire) {
  const days = daysBetween(TODAY, dueDate(task, hire));
  let due;
  if (task.status === "done") due = "done";
  else if (days < 0) due = `overdue by ${-days} day${days === -1 ? "" : "s"}`;
  else if (days === 0) due = "due today";
  else due = `due in ${days} day${days === 1 ? "" : "s"}`;

  const parts = [due];
  const blocked = blocksTasks(task, hire);
  if (blocked.length) parts.push(`blocks ${blocked.map((t) => t.title).join(", ")}`);
  const waiting = openBlockers(task, hire);
  if (waiting.length) parts.push(`waiting on ${waiting.map((t) => t.title).join(", ")}`);
  return parts.join(" · ");
}

export function progress(hire) {
  const done = hire.tasks.filter((t) => t.status === "done").length;
  return { done, total: hire.tasks.length };
}

export function daysUntilStart(hire) {
  return daysBetween(TODAY, hire.startDate);
}

// "Starting in 2 days" / "Preboarding" / "Week 1" / "Weeks 2–4" / "Month 2+".
export function phaseBadge(hire) {
  const days = daysUntilStart(hire);
  if (days > 7) return "Preboarding";
  if (days > 1) return `Starting in ${days} days`;
  if (days === 1) return "Starting tomorrow";
  if (days === 0) return "Starts today";
  const since = -days;
  if (since < 7) return "Week 1";
  if (since < 28) return "Weeks 2–4";
  return "Month 2+";
}

// The plan ends on the latest task due date.
export function daysRemaining(hire) {
  const lastOffset = Math.max(...hire.tasks.map((t) => t.dueOffsetDays));
  return Math.max(0, daysBetween(TODAY, addDays(hire.startDate, lastOffset)));
}

// Why a hire needs attention, e.g. ["2 overdue tasks", "Preboarding open, starts in 2 days"].
export function attentionIssues(hire) {
  const issues = [];
  const overdue = hire.tasks.filter((t) => t.required && isOverdue(t, hire)).length;
  if (overdue) issues.push(`${overdue} overdue task${overdue === 1 ? "" : "s"}`);
  const days = daysUntilStart(hire);
  const preOpen = hire.tasks.some((t) => t.required && t.phase === "pre-start" && t.status === "open");
  if (preOpen && days <= 3) {
    if (days > 0) issues.push(`Preboarding open, starts in ${days} day${days === 1 ? "" : "s"}`);
    else issues.push("Preboarding still open after start");
  }
  return issues;
}

export function managerSummary(hires) {
  return {
    total: hires.length,
    startingSoon: hires.filter((h) => {
      const d = daysUntilStart(h);
      return d > 0 && d <= 14;
    }).length,
    inFirstMonth: hires.filter((h) => {
      const d = daysUntilStart(h);
      return d <= 0 && d > -30;
    }).length,
    needsAttention: hires.filter((h) => hireStatus(h) === "needs attention").length,
  };
}

export function tasksByPhase(hire) {
  const phases = ["pre-start", "week-1", "weeks-2-4"];
  return phases.map((phase) => ({
    phase,
    tasks: hire.tasks.filter((t) => t.phase === phase).sort(compareTasks(hire)),
  }));
}
