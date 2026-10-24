// Task templates. A hire's plan = [...coreTasks, ...departmentTasks[dept]], deep-copied.
// `required` is the source of truth; `optional` is derived in makeTask().

function makeTask({
  id,
  title,
  required,
  phase,
  dueOffsetDays,
  owner,
  blockedBy = [],
  category = "task",
  compliance = false,
}) {
  return {
    id,
    title,
    required,
    optional: !required,
    phase,
    dueOffsetDays,
    blockedBy,
    owner,
    category,
    compliance,
    status: "open",
  };
}

export const coreTasks = [
  makeTask({ id: "sign-offer", title: "Sign offer letter & NDA", required: true, phase: "pre-start", dueOffsetDays: -5, owner: "employee", category: "document" }),
  makeTask({ id: "bg-check", title: "Complete background check", required: true, phase: "pre-start", dueOffsetDays: -3, owner: "employee", category: "form", compliance: true }),
  makeTask({ id: "tax-forms", title: "Submit tax forms (W-4)", required: true, phase: "pre-start", dueOffsetDays: -2, owner: "employee", category: "form" }),
  makeTask({ id: "emergency-contact", title: "Add emergency contact", required: true, phase: "week-1", dueOffsetDays: 1, owner: "employee", category: "form" }),
  makeTask({ id: "handbook", title: "Acknowledge employee handbook", required: true, phase: "week-1", dueOffsetDays: 2, owner: "employee", category: "document", compliance: true }),
  makeTask({ id: "manager-1on1", title: "First 1:1 with manager", required: true, phase: "week-1", dueOffsetDays: 3, owner: "manager" }),
  makeTask({ id: "benefits", title: "Enroll in benefits", required: false, phase: "weeks-2-4", dueOffsetDays: 14, owner: "employee", category: "form" }),
];

export const departmentTasks = {
  Engineering: [
    makeTask({ id: "laptop", title: "Receive dev laptop", required: true, phase: "pre-start", dueOffsetDays: -1, owner: "it" }),
    makeTask({ id: "repo-access", title: "Get repo & tool access", required: true, phase: "week-1", dueOffsetDays: 1, owner: "it", blockedBy: ["laptop"] }),
    makeTask({ id: "dev-env", title: "Set up dev environment", required: true, phase: "week-1", dueOffsetDays: 2, owner: "employee", blockedBy: ["laptop", "repo-access"] }),
    makeTask({ id: "first-pr", title: "Ship first PR", required: false, phase: "weeks-2-4", dueOffsetDays: 10, owner: "employee", blockedBy: ["dev-env"] }),
  ],
  Sales: [
    makeTask({ id: "crm-access", title: "Get CRM access", required: true, phase: "week-1", dueOffsetDays: 1, owner: "it" }),
    makeTask({ id: "territory", title: "Review assigned territory", required: true, phase: "week-1", dueOffsetDays: 3, owner: "manager" }),
    makeTask({ id: "shadow", title: "Shadow 3 sales calls", required: false, phase: "weeks-2-4", dueOffsetDays: 7, owner: "employee" }),
  ],
  Marketing: [
    makeTask({ id: "tools-access", title: "Get marketing tools access", required: true, phase: "week-1", dueOffsetDays: 1, owner: "it" }),
    makeTask({ id: "brand-guide", title: "Review brand guidelines", required: true, phase: "week-1", dueOffsetDays: 2, owner: "employee", category: "document" }),
  ],
};

// Returns a fresh, deep-copied plan. Departments without a template fall back to core only.
export function buildPlan(department) {
  const deptTasks = departmentTasks[department];
  return {
    tasks: structuredClone([...coreTasks, ...(deptTasks ?? [])]),
    usedFallback: !deptTasks,
  };
}
