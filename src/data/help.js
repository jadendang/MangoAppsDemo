// How to complete a task and who to ask, keyed by template task id.
// `path` is the reach path shown as a breadcrumb; `ask` is a plan role (manager | hr | it | buddy)
// or a location directory id. `byLocation` overrides fields for a hire's work location.

const PORTAL = "BrightPath portal";
const IT_PORTAL = "IT portal";
const LINK = "https://example.com/";

export const taskHelp = {
  "sign-offer": {
    path: ["Email from BrightPath People team", "Review & sign"],
    link: { label: "Open offer packet", url: LINK },
    ask: "hr",
  },
  "bg-check": {
    path: ["Email from our screening partner", "Start background check"],
    note: "Takes about 15 minutes. Have a photo ID ready.",
    ask: "hr",
  },
  "tax-forms": {
    path: [PORTAL, "Me", "Pay & tax", "W-4"],
    link: { label: "Open W-4", url: LINK },
    ask: "hr",
  },
  "emergency-contact": {
    path: [PORTAL, "Me", "Personal info", "Emergency contacts"],
    ask: "hr",
  },
  handbook: {
    path: [PORTAL, "Company", "Policies", "Employee handbook"],
    link: { label: "Open handbook", url: LINK },
    ask: "hr",
  },
  "manager-1on1": {
    note: "Your manager sends the invite for your first week.",
    ask: "manager",
  },
  benefits: {
    path: [PORTAL, "Me", "Benefits", "Enroll"],
    note: "Enrollment is open for 30 days from your start date.",
    link: { label: "Compare plans", url: LINK },
    ask: "hr",
  },

  laptop: {
    note: "Ships to your home address before you start. You'll get a tracking email when it leaves.",
    link: { label: "Track shipment", url: LINK },
    ask: "it-shipping",
  },
  "repo-access": {
    path: [IT_PORTAL, "Requests", "Engineering access"],
    note: "IT starts this once your laptop is set up.",
    ask: "it",
  },
  "dev-env": {
    path: ["Engineering wiki", "Getting started", "Dev setup"],
    link: { label: "Open setup guide", url: LINK },
    ask: "buddy",
  },
  "first-pr": {
    note: "Pick a starter issue with your buddy.",
    ask: "buddy",
  },

  "crm-access": {
    path: [IT_PORTAL, "Requests", "Sales tools"],
    ask: "it",
  },
  territory: {
    ask: "manager",
  },
  shadow: {
    note: "Ask your manager which calls to join this week.",
    ask: "manager",
  },

  "tools-access": {
    path: [IT_PORTAL, "Requests", "Marketing tools"],
    ask: "it",
  },
  "brand-guide": {
    path: [PORTAL, "Marketing", "Brand guidelines"],
    link: { label: "Open brand guidelines", url: LINK },
    ask: "manager",
  },
};
