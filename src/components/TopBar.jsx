export default function TopBar({ role, onRole, hires, hireId, onHire, managers, managerName, onManager }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          BrightPath
        </div>

        <div className="topbar-controls">
          <div className="segmented" role="group" aria-label="View as">
            <button className={role === "employee" ? "active" : ""} onClick={() => onRole("employee")}>
              Employee
            </button>
            <button className={role === "manager" ? "active" : ""} onClick={() => onRole("manager")}>
              Manager
            </button>
          </div>

          {role === "employee" ? (
            <label className="picker">
              <span className="visually-hidden">Viewing as hire</span>
              <select value={hireId} onChange={(e) => onHire(e.target.value)}>
                {hires.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} · {h.department}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="picker">
              <span className="visually-hidden">Viewing as manager</span>
              <select value={managerName} onChange={(e) => onManager(e.target.value)}>
                {managers.map((m) => (
                  <option key={m} value={m}>
                    {m}'s team
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>
    </header>
  );
}
