import { phaseBadge, progress, daysRemaining } from "../logic/onboarding.js";
import { formatShortDate } from "../logic/format.js";

export default function HireHeader({ hire, children }) {
  const { done, total } = progress(hire);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const remaining = daysRemaining(hire);

  return (
    <section className="card hire-header">
      <div className="hire-header-top">
        <div>
          <h1>{hire.name}</h1>
          <p className="muted">
            {hire.role} · {hire.department} · Starts {formatShortDate(hire.startDate)}
          </p>
        </div>
        <span className="badge">{phaseBadge(hire)}</span>
      </div>

      <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-meta">
        <span>
          <strong>{done}</strong> of {total} tasks done
        </span>
        <span className="muted">
          {done === total ? "Plan complete" : `${remaining} day${remaining === 1 ? "" : "s"} remaining`}
        </span>
      </div>

      {hire.usedFallback && (
        <p className="notice">
          No {hire.department} plan exists yet, so this shows the company-wide core tasks only.
        </p>
      )}
      {children}
    </section>
  );
}
