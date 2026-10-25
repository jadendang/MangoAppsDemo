// Who to ask and where to go. Pure lookups over the directory and help data.

import { FIELD_RULES, contacts, managerContacts, defaultPlanContacts, locations } from "../data/directory.js";
import { taskHelp } from "../data/help.js";

const ROLE_LABELS = { manager: "Manager", hr: "HR", it: "IT", buddy: "Buddy" };

export function locationOf(hire) {
  return locations[hire.location];
}

// The hire's own people, in display order: manager, HR, IT, buddy (if any).
export function planContacts(hire) {
  const ids = {
    manager: managerContacts[hire.managerName],
    ...defaultPlanContacts,
    buddy: hire.buddy,
  };
  return Object.entries(ids)
    .filter(([, id]) => id && contacts[id])
    .map(([role, id]) => ({ id, role, roleLabel: ROLE_LABELS[role], ...contacts[id] }));
}

export function locationDirectory(hire) {
  return (locationOf(hire)?.directory ?? []).map((id) => ({ id, ...contacts[id] }));
}

// Resolves a plan role or directory id. A missing buddy falls back to the manager.
export function resolveContact(key, hire) {
  const plan = planContacts(hire);
  const byRole = plan.find((c) => c.role === key) ?? (key === "buddy" ? plan.find((c) => c.role === "manager") : null);
  if (byRole) return byRole;
  return contacts[key] ? { id: key, ...contacts[key] } : null;
}

// Help for a task at this hire's location, with `ask` resolved to a contact. Null when none.
export function helpFor(task, hire) {
  const base = taskHelp[task.id];
  if (!base) return null;
  const { byLocation, ...rest } = base;
  const help = { ...rest, ...byLocation?.[hire.location] };
  return { ...help, contact: help.ask ? resolveContact(help.ask, hire) : null };
}

// Contact fields this viewer may see, e.g. [{ kind: "email", label, value, href }].
export function visibleFields(contact, viewer) {
  return Object.entries(FIELD_RULES)
    .filter(([kind, rule]) => contact[kind] && rule.visibleTo.includes(viewer))
    .map(([kind, rule]) => ({
      kind,
      label: rule.label,
      value: contact[kind],
      href: kind === "email" ? `mailto:${contact[kind]}` : `tel:${contact[kind].replace(/[^\d+]/g, "")}`,
    }));
}
