import { useState } from "react";
import { createSampleHires } from "./data/hires.js";
import { isBlocked } from "./logic/onboarding.js";
import TopBar from "./components/TopBar.jsx";
import EmployeeView from "./components/EmployeeView.jsx";
import ManagerView from "./components/ManagerView.jsx";

function setTaskStatus(hires, hireId, taskId, status) {
  return hires.map((h) =>
    h.id !== hireId
      ? h
      : { ...h, tasks: h.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)) }
  );
}

export default function App() {
  const [hires, setHires] = useState(createSampleHires);
  const [role, setRole] = useState("employee");
  const [hireId, setHireId] = useState("ben");
  const managers = [...new Set(hires.map((h) => h.managerName))];
  const [managerName, setManagerName] = useState(managers[0]);
  const [unlocked, setUnlocked] = useState([]);

  const hire = hires.find((h) => h.id === hireId);

  function markDone(id, taskId) {
    const before = hires.find((h) => h.id === id);
    const next = setTaskStatus(hires, id, taskId, "done");
    const after = next.find((h) => h.id === id);
    // Tasks that were waiting on this one and are now free to start.
    setUnlocked(
      after.tasks
        .filter((t) => t.status === "open" && t.blockedBy.includes(taskId))
        .filter((t) => isBlocked(before.tasks.find((b) => b.id === t.id), before) && !isBlocked(t, after))
        .map((t) => t.title)
    );
    setHires(next);
  }

  function undo(id, taskId) {
    setUnlocked([]);
    setHires(setTaskStatus(hires, id, taskId, "open"));
  }

  function switchHire(id) {
    setUnlocked([]);
    setHireId(id);
  }

  return (
    <div className="app">
      <TopBar
        role={role}
        onRole={setRole}
        hires={hires}
        hireId={hireId}
        onHire={switchHire}
        managers={managers}
        managerName={managerName}
        onManager={setManagerName}
      />
      <main className="page">
        {role === "employee" ? (
          <EmployeeView
            key={hire.id}
            hire={hire}
            onDone={(taskId) => markDone(hire.id, taskId)}
            onUndo={(taskId) => undo(hire.id, taskId)}
            unlocked={unlocked}
            onDismissUnlocked={() => setUnlocked([])}
          />
        ) : (
          <ManagerView
            key={managerName}
            managerName={managerName}
            hires={hires.filter((h) => h.managerName === managerName)}
          />
        )}
      </main>
    </div>
  );
}
