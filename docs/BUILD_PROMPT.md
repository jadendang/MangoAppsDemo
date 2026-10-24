# Build prompt — BrightPath Onboarding (v1 prototype)

Paste this into Claude Code (or your AI coding tool). Follow the phases in order.
**Do not start the UI until Phase 1 is verified.**

---

## What we're building

A role-aware onboarding prototype. A new hire sees only their **next critical tasks**
(not everything), and their manager sees **who needs attention**. One workflow, end to end,
with realistic mock data. No backend, no auth, in-memory state only.

Primary user: the new hire. Secondary: the manager. There's a role switcher to demo both.

This borrows terminology and the information model from MangoApps' Onboarding Hub
(Next Actions, Needs Attention, preboarding, required/optional) but the **UI is an original
design — do not imitate MangoApps' green/white styling or left-rail layout.**

## Tech

- React + Vite (JavaScript). Single-page, client-only, state in memory (no DB, no router needed —
  swap views with state).
- Keep it simple and readable. No component libraries required; plain CSS or CSS modules is fine.
- Must run with `npm install && npm run dev`. Include a short README.

---

## Phase 1 — Data + logic ONLY (build this, then STOP)

Build the data model and pure functions. **No UI yet.** At the end, log the results for all
three sample hires to the console and print them so I can verify the logic is correct before
we build anything visual.

### Hardcoded "today"

```js
export const TODAY = new Date("2026-10-26");
```

All date logic compares against `TODAY`, never the real system clock.

### Task shape

```js
{
  id: "bg-check",
  title: "Complete background check",
  required: true,
  optional: false,          // derived as !required; keep required as the source of truth
  phase: "pre-start",       // "pre-start" (preboarding) | "week-1" | "weeks-2-4"
  dueOffsetDays: -3,        // days relative to the hire's start date (negative = before start)
  blockedBy: [],            // array of task ids in the same plan
  owner: "employee",        // "employee" | "manager" | "it" | "hr"
  category: "task",         // "task" | "form" | "document" (one unified type; label only)
  compliance: false,        // true for background check / handbook ack (shown distinctly)
  status: "open"            // "open" | "done"  — the ONLY stored status
}
```

Overdue / blocked / due-soon are **derived at render time**, never stored.

### Templates (shared core + per-department)

Every hire's plan = `[...coreTasks, ...departmentTasks]`, deep-copied so marking a task done
never mutates the template.

**Core (all departments)**

| id | title | required | phase | offset | owner | blockedBy | compliance |
|---|---|---|---|---|---|---|---|
| sign-offer | Sign offer letter & NDA | yes | pre-start | -5 | employee | — | no |
| bg-check | Complete background check | yes | pre-start | -3 | employee | — | yes |
| tax-forms | Submit tax forms (W-4) | yes | pre-start | -2 | employee | — | no |
| emergency-contact | Add emergency contact | yes | week-1 | +1 | employee | — | no |
| handbook | Acknowledge employee handbook | yes | week-1 | +2 | employee | — | yes |
| manager-1on1 | First 1:1 with manager | yes | week-1 | +3 | manager | — | no |
| benefits | Enroll in benefits | no | weeks-2-4 | +14 | employee | — | no |

**Engineering (added to core)**

| id | title | required | phase | offset | owner | blockedBy |
|---|---|---|---|---|---|---|
| laptop | Receive dev laptop | yes | pre-start | -1 | it | — |
| repo-access | Get repo & tool access | yes | week-1 | +1 | it | [laptop] |
| dev-env | Set up dev environment | yes | week-1 | +2 | employee | [laptop, repo-access] |
| first-pr | Ship first PR | no | weeks-2-4 | +10 | employee | [dev-env] |

**Sales (added to core)**

| id | title | required | phase | offset | owner | blockedBy |
|---|---|---|---|---|---|---|
| crm-access | Get CRM access | yes | week-1 | +1 | it | — |
| territory | Review assigned territory | yes | week-1 | +3 | manager | — |
| shadow | Shadow 3 sales calls | no | weeks-2-4 | +7 | employee | — |

**Marketing (added to core)**

| id | title | required | phase | offset | owner | blockedBy |
|---|---|---|---|---|---|---|
| tools-access | Get marketing tools access | yes | week-1 | +1 | it | — |
| brand-guide | Review brand guidelines | yes | week-1 | +2 | employee | — |

### Hire shape

```js
{ id, name, role, department, startDate, managerName, tasks: [ ...deep-copied template ] }
```

### The two rules (implement exactly)

```
dueDate(task, hire)   = hire.startDate + task.dueOffsetDays
isBlocked(task, hire) = any task in task.blockedBy is not "done"
isOverdue(task, hire) = task.status==="open" && dueDate < TODAY
                         (due === TODAY is NOT overdue)

nextActions(hire):          // powers the "Next Actions" card
  1. FILTER: task.status==="open" AND NOT isBlocked(task)   // blocked => "Coming up"
  2. SORT the eligible tasks by:
       a. pre-start before non-pre-start
       b. then earliest dueDate
       c. then required before optional
  3. TAKE the top 3

hireStatus(hire):
  "not started"    if zero tasks are "done"
  "needs attention" if ANY required task isOverdue,
                      OR any required pre-start task is open AND
                         (startDate is within 3 days of TODAY OR has passed)
  "on track"       otherwise
```

### Sample hires (seed exactly — these produce the three states)

- **Ben** — Software Engineer, Engineering, start **2026-10-28**, manager "John".
  All tasks open (nothing done). → **Needs attention** (required pre-start open, start in 2 days).
- **Joseph** — Account Executive, Sales, start **2026-10-24**, manager "Jane".
  Mark **done**: sign-offer, bg-check, tax-forms, crm-access, emergency-contact.
  Leave open: handbook (+2, due today), manager-1on1 (+3), territory (+3), benefits, shadow.
  → **On track** (nothing overdue).
- **Martin** — Content Marketer, Marketing, start **2026-11-02**, manager "Jane".
  All tasks open. → **Not started** (0 done; start is 7 days out so not yet needs-attention).

### Phase 1 acceptance (print this to verify before continuing)

For each hire, print: name, computed `hireStatus`, and the `nextActions` titles with each
one's due date and reason (overdue / due in N days / blocks X). I expect:
- Ben → **Needs attention**; Next Actions are pre-start items (sign-offer, bg-check…), some overdue.
- Joseph → **On track**; Next Actions show handbook (due today), manager-1on1, territory.
- Martin → **Not started**; Next Actions are his earliest pre-start items.
- Engineering `dev-env` must NOT appear in Next Actions while `laptop`/`repo-access` are open
  (it's blocked → Coming up).

**Stop here and show me the printed output.**

---

## Phase 2 — Employee view

- Role switcher in a top bar: **View as Employee / View as Manager** (and a hire picker when
  viewing as employee, so I can switch between Ben/Joseph/Martin in the demo).
- Header: hire name, role, department, start date, a **phase badge** ("Starting in 2 days",
  "Week 1", "Preboarding"), and a progress bar with "N days remaining" + counts (done / total).
- **Next Actions** card: the top-3 from `nextActions()`, each a card with title, a one-line
  **why** ("Due Friday" / "Blocks your dev setup"), owner chip if owner ≠ employee
  ("IT provisions this"), and a **Mark done** button.
- Tabs: **Next Actions · Coming up · Completed · All tasks.**
  - Coming up = eligible-but-not-top-3 plus blocked tasks (blocked ones labeled "waiting on X").
  - All tasks = full list grouped by phase, with status / required / owner.
- **Mark done** must update state and re-render: the task leaves Next Actions, the list refills,
  and completing a blocker reveals the task it was blocking. Make this feel instant.
- Compliance tasks (bg-check, handbook) show an **"Acknowledged"** state when done, distinct
  from a plain "Done" check.

## Phase 3 — Manager view

Original design, but this information structure:
- Four summary count cards: **New team members · Starting soon (next 2 weeks) · In first month ·
  Needs attention.**
- A **Needs Attention** table: person, role, status, **Issue** ("2 overdue tasks"),
  and a Follow up action. Only hires whose status is "needs attention" appear here.
- A **People onboarding** table: everyone, with plan/department, status, progress.
- Clicking a hire drills into their full task list (overdue items flagged).

## Phase 4 — Polish + edge/empty states

Test and handle:
- A hire with everything complete → Next Actions empty state reads as a win, not a blank screen.
- Manager with zero needs-attention hires → friendly empty state, not an error.
- A department with no template → fall back to core tasks and show a small notice.
- Blocked tasks never appear in Next Actions.
- A long plan still shows only 3 in Next Actions; volume lives in All tasks.

### UI direction

Original, clean, restrained. One accent color, generous spacing, readable type, card-based
layout. Must work at phone width (the employee view especially). Do **not** copy MangoApps'
look. Prioritize a clear information hierarchy over visual flourish.

### README

How to run, the role switcher, the three sample hires and what state each demonstrates, the
two rules in plain English, and a short "what's mocked / out of scope" list.
