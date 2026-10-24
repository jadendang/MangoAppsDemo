// Human-facing strings for the UI. Pure; built on the rules in onboarding.js.

import { TODAY, daysBetween, dueDate, blocksTasks, openBlockers } from "./onboarding.js";

const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" });
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export function formatShortDate(date) {
  return shortDate.format(new Date(date));
}

// "Overdue by 3 days" / "Due today" / "Due tomorrow" / "Due Friday" / "Due Nov 11".
export function dueLabel(task, hire) {
  const due = dueDate(task, hire);
  const days = daysBetween(TODAY, due);
  if (days < 0) return `Overdue by ${-days} day${days === -1 ? "" : "s"}`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days < 7) return `Due ${weekday.format(due)}`;
  return `Due ${shortDate.format(due)}`;
}

// The one-line "why" shown on a Next Actions card.
export function whyLine(task, hire) {
  const blocked = blocksTasks(task, hire);
  if (blocked.length) {
    const what = blocked.length === 1 ? blocked[0].title.toLowerCase() : `${blocked.length} other tasks`;
    return `${dueLabel(task, hire)} · Blocks ${what}`;
  }
  return dueLabel(task, hire);
}

export function waitingLine(task, hire) {
  const waiting = openBlockers(task, hire);
  if (!waiting.length) return null;
  return `Waiting on ${waiting.map((t) => t.title.toLowerCase()).join(" and ")}`;
}

const OWNER_NOTES = {
  it: "IT provisions this",
  manager: "Your manager leads this",
  hr: "HR handles this",
};

export function ownerNote(task) {
  return OWNER_NOTES[task.owner] ?? null;
}

const OWNER_NAMES = { employee: "New hire", manager: "Manager", it: "IT", hr: "HR" };

export function ownerName(task) {
  return OWNER_NAMES[task.owner] ?? task.owner;
}

export const PHASE_LABELS = {
  "pre-start": "Preboarding",
  "week-1": "Week 1",
  "weeks-2-4": "Weeks 2–4",
};

export const STATUS_LABELS = {
  "needs attention": "Needs attention",
  "on track": "On track",
  "not started": "Not started",
};

export function doneLabel(task) {
  return task.compliance ? "Acknowledged" : "Done";
}
