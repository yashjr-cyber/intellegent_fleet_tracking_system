export const canonicalOrigin = "https://intellegent-fleet-tracking-system.vercel.app";
export const publicHomeDescription =
  "Explore Wayfinder Mobility, a campus transportation prototype for route coordination, simulated bus tracking, arrival estimates, and sample attendance workflows.";

export interface PageMetadata {
  title: string;
  description: string;
  indexable: boolean;
  canonicalUrl?: string;
}

const pages: Record<string, PageMetadata> = {
  "/": {
    title: "Campus Mobility Prototype | Wayfinder Mobility",
    description: publicHomeDescription,
    indexable: true,
    canonicalUrl: `${canonicalOrigin}/`,
  },
  "/demo": {
    title: "Explore the Demo | Wayfinder Mobility",
    description: "Choose a fictional student, driver, or campus-team workspace in the Wayfinder Mobility prototype.",
    indexable: false,
  },
  "/student": {
    title: "Student Mobility Demo | Wayfinder Mobility",
    description: "Preview simulated campus bus locations, route schedules, arrival estimates, and sample notifications.",
    indexable: false,
  },
  "/student/attendance": {
    title: "Sample Attendance | Wayfinder Mobility",
    description: "View read-only, fictional RFID attendance examples in the campus mobility prototype.",
    indexable: false,
  },
  "/driver": {
    title: "Driver Workspace Demo | Wayfinder Mobility",
    description: "Preview a fictional driver workspace with sample assignments, trips, and simulated vehicle telemetry.",
    indexable: false,
  },
  "/admin": {
    title: "Campus Team Demo | Wayfinder Mobility",
    description: "Preview sample campus transport operations, routes, trips, fleet, and attendance.",
    indexable: false,
  },
};

export function getPageMetadata(pathname: string): PageMetadata {
  const exactMatch = pages[pathname];
  if (exactMatch) return exactMatch;

  if (pathname.startsWith("/admin/")) return pages["/admin"];
  if (pathname.startsWith("/driver/")) return pages["/driver"];
  if (pathname.startsWith("/student/")) return pages["/student"];

  return {
    title: "Page Not Found | Wayfinder Mobility",
    description: "The requested Wayfinder Mobility page could not be found.",
    indexable: false,
  };
}
