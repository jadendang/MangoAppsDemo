import { planContacts, locationDirectory, locationOf, visibleFields } from "../logic/contacts.js";

// One person or desk, showing only the fields this viewer may see.
export function ContactLine({ contact, viewer, roleLabel }) {
  const fields = visibleFields(contact, viewer);
  return (
    <div className="contact">
      <div className="contact-name">
        {contact.name}
        {roleLabel && <span className="chip">{roleLabel}</span>}
      </div>
      {contact.title && <div className="muted small">{contact.title}</div>}
      {fields.length > 0 && (
        <div className="contact-fields">
          {fields.map((f) => (
            <a key={f.kind} href={f.href} aria-label={`${f.label}: ${f.value}`}>
              {f.kind === "mobile" ? `Mobile ${f.value}` : f.value}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// The hire's plan contacts plus their work location's directory.
export default function Contacts({ hire, viewer, title = "Who to ask" }) {
  const location = locationOf(hire);
  const directory = locationDirectory(hire);
  return (
    <section className="card">
      <div className="card-heading">
        <h2>{title}</h2>
        {viewer === "manager" && <span className="muted">Mobile numbers are visible to managers only</span>}
      </div>
      <h3>{viewer === "employee" ? "Your people" : "Plan contacts"}</h3>
      <ul className="contact-list">
        {planContacts(hire).map((c) => (
          <li key={c.role}>
            <ContactLine contact={c} viewer={viewer} roleLabel={c.roleLabel} />
          </li>
        ))}
      </ul>
      {location && (
        <>
          <h3 className="contact-section">{location.name}</h3>
          {location.address && <p className="muted small location-address">{location.address}</p>}
          <ul className="contact-list">
            {directory.map((c) => (
              <li key={c.id}>
                <ContactLine contact={c} viewer={viewer} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
