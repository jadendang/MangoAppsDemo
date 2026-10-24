# BrightPath Onboarding (v1 prototype)

A role-aware onboarding prototype. A new hire sees only their **next critical tasks**, and their
manager sees **who needs attention**. Client-only React app; all data is mock and in memory.

## Run it

```bash
npm install
npm run dev       # open the URL Vite prints (usually http://localhost:5173)
npm run verify    # prints each hire's status + Next Actions and checks the rules
```

"Today" is fixed at **Oct 26, 2026** (`TODAY` in `src/logic/onboarding.js`) so the demo looks the
same whenever you run it.

## Demo controls

The top bar has a **View as Employee / Manager** switch.

- **Employee**: the dropdown picks which hire you are. Mark tasks done and watch Next Actions
  refill. Finishing a blocker (e.g. Ben's laptop) unlocks the task that was waiting on it.
  Completed tasks can be undone, so you can replay the demo.
- **Manager**: the dropdown picks whose team you see. Click a person to see their full plan.

Refresh the page to reset all state.

## Sample hires

| Hire | Team | Starts | Manager | Shows |
|---|---|---|---|---|
| Ben, Software Engineer | Engineering | Oct 28 | John | **Needs attention**: nothing done, 2 preboarding tasks overdue, starts in 2 days. Blocked tasks (dev environment, first PR) sit in Coming up. |
| Joseph, Account Executive | Sales | Oct 24 | Jane | **On track**: preboarding done; the handbook is due today, which doesn't count as overdue. |
| Martin, Content Marketer | Marketing | Nov 2 | Jane | **Not started**: nothing done yet, but nothing is overdue and his start is a week away. |
| Priya, Financial Analyst | Finance | Oct 5 | Jane | Edge cases: there's no Finance template, so Priya gets the core plan and a notice; everything is done, so Next Actions shows a "You're all set" state. |

John's team shows the Needs Attention table. Jane's team shows its empty state.

## The two rules, in plain English

**Next Actions**: of the tasks that are still open *and not waiting on another task*, show the
three most urgent. Preboarding comes first, then the earliest due date, then required before
optional. Anything blocked goes to Coming up until its blocker is done.

**Hire status**:
- **Needs attention**: a required task is overdue (due *today* doesn't count), or required
  preboarding is still open with the start date 3 days away or already passed.
- **Not started**: otherwise, if nothing is done yet.
- **On track**: everything else.

"Needs attention" is checked before "not started", so a hire who hasn't started anything and
is about to start is flagged rather than looking idle.

Only `open` / `done` is stored. Overdue, blocked, and due-soon are worked out from dates each render.

## Code map

- `src/data/templates.js`: core + per-department task templates, `buildPlan()`
- `src/data/hires.js`: sample hires
- `src/logic/onboarding.js`: the pure rules (`nextActions`, `hireStatus`, `isBlocked`, …)
- `src/logic/format.js`: UI wording ("Due Friday", "IT provisions this")
- `src/components/`: employee view, manager view, shared task rows
- `scripts/verify-phase1.js`: prints and checks the rule results

## What's mocked / out of scope

- No backend, database, or auth. State resets on refresh.
- "Today" is hardcoded; there's no real clock or time zone handling.
- Anyone can mark any task done, including IT- and manager-owned tasks, so the demo flows.
- "Follow up" only shows "Reminder sent"; no email or notification goes out.
- No document uploads, e-signatures, or real forms behind tasks.
- No template editing, plan assignment, or HR/admin view.
