# PRD: BrightPath Onboarding — v1

Oct 22, 2026 · @Jaden Dang

## Summary

A role-aware onboarding checklist that shows each new hire only their next critical tasks, and gives their manager a simple on-track / needs-attention view, so early steps stop getting missed. v1 proves one workflow end to end: set up a hire from a department template, surface what's next, complete it, and let the manager see who's falling behind.

## Problem

New hires at BrightPath don't know what to do first, so important early steps get missed, and no one notices until it's a problem.

Onboarding today is spread across welcome emails, shared docs, spreadsheets and HR messages. Three consequences follow:

- **New hires are overwhelmed.** There's no single place that says what matters now versus later, so critical early tasks compete with everything else for attention.
- **Managers are blind.** They can't tell whether a hire is on track until something has already gone wrong.
- **Steps differ by role, but the process doesn't.** Engineering needs dev access; other departments have entirely different needs. One generic checklist fits no one well.

The cost is concrete: a missed background check or an unprovisioned laptop can stall someone's first week.

## Users

**Primary: the new hire (Emily).** If her first days work, the whole product earns its keep. Build for her and the others benefit.

**Secondary: the manager (David).** Needs visibility and per-department differences, both delivered as byproducts of serving the hire well.

**Buyer: HR (Sarah).** Requested this and signs off, but isn't the daily user. She mostly needs it to exist and not be a mess.

### The two who disagree

David and Emily sound like a conflict but aren't. They're two different problems sharing one data model:

- **David** wants per-department differences → solved by **templates** (a shared company core plus department-specific tasks).
- **Emily** wants to not drown → solved by **surfacing only a few tasks at a time** on top of that template.

One is about *what's in the plan*; the other is about *how much you show at once*. Same data, both solved.

## Goals and non-goals

**Goals for v1**

- A new hire always knows the few things to do next, ordered by what actually matters.
- Tasks and deadlines adapt to role, department and start date without manual setup per hire.
- A manager can see, at a glance, who is on track and who is Needs attention, and why.

**Non-goals for v1** (deliberately out of scope, revisited later)

- Real authentication and accounts.
- Email / push notifications and reminders.
- Integrations with IT provisioning, HRIS or SSO.
- Editing templates through a UI (templates are defined in code for v1).
- Documents, e-signatures and file uploads.
- The question-and-answer / feedback-on-tasks idea.

**How we measure success:** new hires complete required early tasks on time, and managers catch hires that need attention before the start date rather than after.

## Scope: build vs cut

The forcing question: what's the least we can build so Emily never misses a critical early step and David can see it?

| Capability | v1 | Why |
| --- | --- | --- |
| Department templates (shared core + role tasks) | Build | Answers David and Sarah's "auto-generate" ask cheaply |
| Create a hire (name, role, dept, start date) → plan generated | Build | The spine; deadlines computed from start date |
| Employee view: Next Actions + Coming up + Completed + full list | Build | Directly answers Emily's "don't show me 40 things" |
| Manager view: summary counts + a Needs Attention table (with an Issue column) + per-hire drill-down | Build | Answers Sarah and the manager's visibility need |
| Role switcher (view as employee / manager) | Build | Lets us demo both sides without auth |
| Task owners (employee / manager / IT / HR) | Build | A detail that reflects reality; some tasks aren't the hire's |
| Task help + contacts (reach path, link, who to ask; plan contacts and a per-location directory with role-based field visibility) | Build | "How do I do this, and who do I ask?" is the next place a hire gets stuck; collapsed by default so it doesn't add noise |
| Auth, notifications, integrations, template editor, e-sign, Q&A | Cut | Real but not needed to prove the core workflow |

**One structural simplification.** The real Onboarding Hub splits work into six object types: forms, documents, tasks, checkpoints, trainings and surveys. v1 collapses all of them into a single `task` type (with an optional category label), so the three hours go into prioritization and status logic rather than modeling six objects.

**UI is an original design.** We borrow MangoApps' terminology and information model — Next Actions, Needs Attention, preboarding, required/optional — not its visual styling. The interface is our own, not a reskin of their product.

## Core workflow

One workflow has to work end to end in the demo:

1. **Set up a hire.** HR picks name, role, department and start date. A plan is generated by copying the department template and stamping in due dates relative to the start date.
2. **Hire sees what's next.** On login the hire lands on Next Actions: at most three eligible, unblocked tasks ordered by priority. Coming up, Completed and the full list are one tap away.
3. **Hire completes tasks.** Marking a task done can unblock dependent tasks, which then surface in Next Actions.
4. **Manager sees progress.** The manager view opens on a dashboard: summary counts (New team members · Starting soon · In first month · Needs attention) above a Needs Attention table that names each flagged hire, the issue (e.g. "2 overdue tasks") and a follow-up action, with a drill-down into any hire's full task list.

Everything else is secondary to making these four steps work with realistic data.

## Product logic

This is where product sense lives rather than UI. Two rules drive everything, and both are deliberately explicit so any item's position is defensible.

### Next Actions

**Filter first, then sort.** Dependencies are an eligibility gate, not a tiebreaker — a blocked task must not appear as "next" when the hire can't actually do it.

- **Eligible** = incomplete AND not blocked (every task it depends on is done). Blocked tasks go to *Coming up*, not Next Actions.
- **Sort the eligible tasks** by: (1) required-before-start first, then (2) earliest due date, then (3) required over optional as the final tiebreak.
- **Cap at 3.** Emily's whole complaint is volume; the cap forces prioritization to mean something.
- Each Next Actions task shows a one-line *why* ("Due Friday" / "Blocks your dev setup") to make the ordering visible.

### Needs attention

Status is derived, never stored. A hire has one of three states:

- **Not started** — plan exists, zero tasks complete. Its own signal: a hire who's done nothing is different from one who's 80% done with a late task.
- **Needs attention** — any **required** task is overdue (open, required, due date < today), OR any **required pre-start** task is open and the start date is within 3 days or has passed.
- **On track** — everything else.

Only required tasks can trigger needs-attention; an optional task going past due shouldn't flag a hire to their manager. The 3-day window is a placeholder to confirm with Sarah.

## Data model

Everything hangs off a small model. Store only `open`/`done`; derive the rest.

**Task**

```
{
  id: "bg-check",
  title: "Complete background check",
  required: true,
  phase: "pre-start",        // pre-start | week-1 | weeks-2-4
  dueOffsetDays: -3,         // days relative to start date (negative = before)
  blockedBy: [],             // array of task ids
  owner: "employee",         // employee | manager | it | hr
  status: "open"             // open | done  (overdue/blocked/due-soon are derived)
}
```

Due dates are **relative** (`startDate + dueOffsetDays`), so one template works for any hire regardless of start date. Pre-start tasks — the preboarding phase, in MangoApps' terms — are just negative offsets.

**Template** — an array of tasks per department, built from a shared core plus role-specific tasks:

```
template["Engineering"] = [ ...coreTasks, ...engineeringTasks ]
```

**Hire** — copies the template tasks (never references them, so completing one doesn't mutate the template):

```
{ id, name, role, department, startDate, tasks: [ ...copied, each with its own status ] }
```

**Derived functions** (the product logic, as pure functions):

- `dueDate(task, hire)` → `hire.startDate + task.dueOffsetDays`
- `isBlocked(task, hire)` → any task in `blockedBy` is not done
- `focusNow(hire, today)` → open, unblocked tasks, sorted pre-start → earliest due → required-over-optional, top 3 (this powers the Next Actions list)
- `hireStatus(hire, today)` → not started / needs attention / on track per the rules above

**One required global:** a hardcoded `TODAY` so the demo is stable regardless of when it's run.

## Sample data

With `TODAY = 2026-10-26`, four hires are seeded — three to show the main states, plus one for edge cases — so the whole product shows in one screen without changing any data.

| Hire | Dept | Start date | State | Why |
| --- | --- | --- | --- | --- |
| Ben | Engineering | 2026-10-28 (in 2 days) | Needs attention | 2 required pre-start tasks still open, start within 3 days |
| Joseph | Sales | 2026-10-24 (2 days ago) | On track | Moving through week-1 tasks, nothing overdue |
| Martin | Marketing | 2026-11-02 (next week) | Not started | Plan exists, zero tasks touched |
| Priya | Finance | 2026-10-05 (3 weeks ago) | Edge cases | No Finance template → core plan + a notice; all tasks done → "You're all set" empty state |

These four hires let the demo walk every state and every view in sequence: Ben shows needs-attention and the manager drill-down, Joseph shows a healthy Next Actions list, Martin shows the not-started and empty states, and Priya (Finance) shows the no-template fallback and the all-done state.

## Assumptions

The request was intentionally incomplete. Where it was unclear, we assumed and moved on:

- **HR creates the plan from a template; the manager can view but not edit it (v1).** Keeps one clear owner for setup.
- **The employee self-reports task completion.** Some tasks are owned by IT or HR (e.g. "laptop provisioned"), so we model a task `owner`, but completion is still a self-check in v1.
- **Start date drives every deadline.** Every due date is an offset from it; change the start date and the whole plan shifts.
- **Required vs. optional is set per task in the template.** Only required tasks affect at-risk status.
- **"Within 3 days" is a placeholder lead time** for pre-start risk, pending real per-task lead times from Sarah.
- **Departments map to one template each.** A hire with no template for their department falls back to the shared core (and we surface that gap).

## Edge cases to test

Beyond the happy path, the demo should hold up under:

- **A hire who starts today or in the past** with overdue pre-start tasks.
- **A hire with everything complete** — the empty Next Actions state should read as a win, not a blank screen.
- **Dependent tasks** — can't do "set up dev environment" before "laptop received"; the blocked task stays out of Next Actions until unblocked.
- **A department with no template** — fall back to the shared core and flag it.
- **A manager with zero hires** — a real empty state, not an error.
- **A long plan (40+ tasks)** — Next Actions still shows only 3; the full list is where volume lives.

## What we'd ask Sarah next

The questions that would shape v2:

- Who owns tasks that aren't the new hire's — IT, facilities, HR — and should they get their own view?
- Do managers want nudges and reminders, or is visibility enough?
- Is there compliance-required paperwork that must be tracked rigorously (and auditably)?
- What are the real lead times per task type, so pre-start risk isn't a flat 3 days?
- How many people across HR, managers and IT need to coordinate on a single hire?
- Should HR be able to build and edit templates themselves, or is engineering-owned fine for now?

## How this maps to MangoApps' Onboarding Hub

MangoApps already ships an Onboarding Hub. This prototype is a deliberately small v1 of that product, built in its vocabulary so the scope decisions are legible to the team.

- **Templates** — their auto-matcher scores templates by role × department × location, most-specific match wins. We do department-only matching with a shared core; role and location are the obvious next step.
- **Day-offset scheduling** — their tasks are scheduled before / on / after the start date. Our `dueOffsetDays` is the same mechanic.
- **Preboarding** — their token-secured preboarding portal covers the before-Day-1 window. Our pre-start phase is the same idea, without the portal or the email campaign.
- **Task owners** — they assign across new hire, hiring manager, mentor, buddy, HR and IT. We model `owner` as employee / manager / IT / HR.
- **Needs attention** — their weekly manager digest and "needs attention" view flag hires who've stalled. Our needs-attention rule is the live, in-app version of the same signal.
- **Confirmed and logged** — their compliance flow (I-9, e-signature, Policy Hub acknowledgment recorded on task completion) reflects the platform's "confirmed by a person, logged" thesis. We nod to it with a distinct acknowledged state on compliance tasks; the full audit trail is out of scope.

Deliberately out of scope for v1, and where our model would plug in: e-signature and document collection, I-9 monitoring, AI-drafted 30/60/90-day plans (human-approved before going live), equipment provisioning, and executive analytics.
