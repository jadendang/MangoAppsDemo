// People and places a hire may need to reach. All contact details are fictional
// (example.com addresses, 555-01xx numbers).

// Which viewer roles may see each contact field. Fields not listed here are never shown.
export const FIELD_RULES = {
  email: { label: "Email", visibleTo: ["employee", "manager"] },
  phone: { label: "Phone", visibleTo: ["employee", "manager"] },
  mobile: { label: "Mobile", visibleTo: ["manager"] },
};

export const contacts = {
  john: { name: "John Rivera", title: "Engineering Manager", email: "john.rivera@example.com", phone: "(206) 555-0161", mobile: "(206) 555-0191" },
  jane: { name: "Jane Okafor", title: "Director, Go-to-Market", email: "jane.okafor@example.com", phone: "(206) 555-0162", mobile: "(206) 555-0192" },
  dana: { name: "Dana Kim", title: "People Partner", email: "dana.kim@example.com", phone: "(206) 555-0142", mobile: "(206) 555-0187" },
  sam: { name: "Sam Lee", title: "IT Onboarding", email: "sam.lee@example.com", phone: "(206) 555-0111" },
  alex: { name: "Alex Chen", title: "Senior Engineer", email: "alex.chen@example.com" },

  "front-desk": { name: "Front desk", title: "Reception, Suite 500", email: "frontdesk@example.com", phone: "(206) 555-0100" },
  "it-desk": { name: "IT", title: "Tech help, Suite 500", email: "it-help@example.com", phone: "(206) 555-0110" },
  facilities: { name: "Facilities", title: "Badges, desks & parking", email: "facilities@example.com", phone: "(206) 555-0120" },
  "it-shipping": { name: "IT shipping desk", title: "Laptop & equipment shipping",email: "it-shipping@example.com", phone: "(206) 555-0130" },
  "remote-support": { name: "Remote work support", title: "Home office stipend & setup", email: "remote@example.com" },
};

// Manager names (as stored on hires) → contact ids.
export const managerContacts = { John: "john", Jane: "jane" };

// Shared plan contacts every hire gets, plus their manager and an optional buddy.
export const defaultPlanContacts = { hr: "dana", it: "sam" };

export const locations = {
  hq: {
    name: "Seattle HQ",
    address: "760 Aloha Street, Ste 500, Seattle, WA 98109",
    directory: ["front-desk", "it-desk", "facilities"],
  },
  remote: {
    name: "Remote",
    address: null,
    directory: ["it-shipping", "remote-support"],
  },
};
