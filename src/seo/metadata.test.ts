import { describe, expect, it } from "vitest";
import { canonicalOrigin, getPageMetadata, publicHomeDescription } from "./metadata";

describe("page metadata", () => {
  it("exposes only the public overview as indexable", () => {
    expect(getPageMetadata("/")).toMatchObject({
      title: "Campus Mobility Prototype | Wayfinder Mobility",
      description: publicHomeDescription,
      indexable: true,
      canonicalUrl: `${canonicalOrigin}/`,
    });
  });

  it.each([
    "/demo",
    "/student",
    "/student/attendance",
    "/driver",
    "/driver/trips",
    "/admin",
    "/admin/routes",
    "/unknown",
  ])("marks %s as non-indexable", (pathname) => {
    expect(getPageMetadata(pathname).indexable).toBe(false);
  });

  it("uses route-specific descriptions for dashboards", () => {
    expect(getPageMetadata("/student").description).not.toBe(getPageMetadata("/student/attendance").description);
    expect(getPageMetadata("/driver").description).not.toBe(getPageMetadata("/admin").description);
  });
});
