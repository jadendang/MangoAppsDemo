import { useState } from "react";
import { helpFor } from "../logic/contacts.js";
import { ContactLine } from "./Contacts.jsx";

// Collapsed "How to do this" panel: reach path, note, link and who to ask.
export default function TaskHelp({ task, hire, viewer }) {
  const [open, setOpen] = useState(false);
  const help = helpFor(task, hire);
  if (!help) return null;

  return (
    <div className="task-help">
      <button className="link-button" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "Hide help" : "How to do this"}
      </button>
      {open && (
        <div className="task-help-panel">
          {help.path && (
            <div>
              <div className="help-label">Where</div>
              <ol className="breadcrumb">
                {help.path.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}
          {help.note && <p>{help.note}</p>}
          {help.link && (
            <a className="secondary-button help-link" href={help.link.url} target="_blank" rel="noreferrer">
              {help.link.label} ↗
            </a>
          )}
          {help.contact && (
            <div>
              <div className="help-label">Questions? Ask</div>
              <ContactLine contact={help.contact} viewer={viewer} roleLabel={help.contact.roleLabel} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
