// Phase 1 check: prints status + Next Actions for each sample hire and asserts the expected results.
// Run with: npm run verify

import { createSampleHires } from "../src/data/hires.js";
import { buildPlan } from "../src/data/templates.js";
import {
  TODAY,
  formatDate,
  dueDate,
  hireStatus,
  nextActions,
  comingUp,
  taskReason,
  progress,
} from "../src/logic/onboarding.js";

const hires = createSampleHires();

console.log(`TODAY = ${formatDate(TODAY)}\n`);

for (const hire of hires) {
  const { done, total } = progress(hire);
  console.log(`${hire.name} — ${hire.role}, ${hire.department}, starts ${hire.startDate} (${done}/${total} done)`);
  console.log(`  status: ${hireStatus(hire).toUpperCase()}`);
  console.log("  Next Actions:");
  nextActions(hire).forEach((t, i) => {
    console.log(`    ${i + 1}. ${t.title} — due ${formatDate(dueDate(t, hire))} — ${taskReason(t, hire)}`);
  });
  console.log("  Coming up:");
  for (const t of comingUp(hire)) {
    console.log(`    - ${t.title} — due ${formatDate(dueDate(t, hire))} — ${taskReason(t, hire)}`);
  }
  console.log("");
}

// Assertions
const failures = [];
function expect(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

const [ben, joseph, martin] = hires;
const ids = (hire) => nextActions(hire).map((t) => t.id);

expect("Ben status", hireStatus(ben), "needs attention");
expect("Ben next actions", ids(ben), ["sign-offer", "bg-check", "tax-forms"]);
expect("Joseph status", hireStatus(joseph), "on track");
expect("Joseph next actions", ids(joseph), ["handbook", "manager-1on1", "territory"]);
expect("Martin status", hireStatus(martin), "not started");
expect("Martin next actions", ids(martin), ["sign-offer", "bg-check", "tax-forms"]);

// Blocked dev-env never surfaces, even after the first 3 are done.
for (const t of ben.tasks) if (["sign-offer", "bg-check", "tax-forms"].includes(t.id)) t.status = "done";
expect("Ben dev-env not in next actions (laptop open)", ids(ben).includes("dev-env"), false);
ben.tasks.find((t) => t.id === "laptop").status = "done";
expect("Ben dev-env not in next actions (repo-access open)", ids(ben).includes("dev-env"), false);
ben.tasks.find((t) => t.id === "repo-access").status = "done";
expect("Ben dev-env revealed once blockers done", ids(ben).includes("dev-env"), true);

// Templates are not mutated by marking tasks done.
expect("Template untouched", buildPlan("Engineering").tasks.every((t) => t.status === "open"), true);

// Unknown department falls back to core.
const fallback = buildPlan("Finance");
expect("Fallback flag", fallback.usedFallback, true);
expect("Fallback task count", fallback.tasks.length, 7);

if (failures.length) {
  console.log("FAILED:");
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log("All Phase 1 checks passed.");
