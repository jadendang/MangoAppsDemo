import { buildPlan } from "./templates.js";

function makeHire({ id, name, role, department, startDate, managerName, doneIds = [], allDone = false }) {
  const { tasks, usedFallback } = buildPlan(department);
  for (const task of tasks) {
    if (allDone || doneIds.includes(task.id)) task.status = "done";
  }
  return { id, name, role, department, startDate, managerName, tasks, usedFallback };
}

export function createSampleHires() {
  return [
    makeHire({
      id: "ben",
      name: "Ben",
      role: "Software Engineer",
      department: "Engineering",
      startDate: "2026-10-28",
      managerName: "John",
    }),
    makeHire({
      id: "joseph",
      name: "Joseph",
      role: "Account Executive",
      department: "Sales",
      startDate: "2026-10-24",
      managerName: "Jane",
      doneIds: ["sign-offer", "bg-check", "tax-forms", "crm-access", "emergency-contact"],
    }),
    makeHire({
      id: "martin",
      name: "Martin",
      role: "Content Marketer",
      department: "Marketing",
      startDate: "2026-11-02",
      managerName: "Jane",
    }),
    // Edge-case demo: no Finance template (core fallback) and every task complete.
    makeHire({
      id: "priya",
      name: "Priya",
      role: "Financial Analyst",
      department: "Finance",
      startDate: "2026-10-05",
      managerName: "Jane",
      allDone: true,
    }),
  ];
}
