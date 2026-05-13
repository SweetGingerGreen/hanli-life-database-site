import { describe, expect, it } from "vitest";
import { getOverview } from "../overview";
import { getRealmBySlug, getRealmEvents, getRealmProfiles, slugify } from "../realms";
import { getSeclusionStats } from "../seclusion";
import { getChapterEvents, getEventById, queryEvents, queryEventsWithTotal } from "../timeline";

describe("query helpers", () => {
  it("returns overview and seclusion contract fields", () => {
    expect(getOverview()).toMatchObject({
      chapters: 1324,
      events: 1998,
    });
    expect(getSeclusionStats().estimatedYears).toBeGreaterThan(700);
  });

  it("filters events by type and paginates", () => {
    const result = queryEventsWithTotal({ type: "treasure", limit: 5 });
    expect(result.total).toBeGreaterThan(800);
    expect(result.events).toHaveLength(5);
    expect(result.events.every((event) => event.type === "treasure")).toBe(true);
  });

  it("finds single events and same-chapter context", () => {
    const event = getEventById(1);
    expect(event?.ch).toBe(1);
    expect(getChapterEvents(1).some((item) => item.id === 1)).toBe(true);
  });

  it("maps realm slugs back to profiles and event streams", () => {
    const firstRealm = getRealmProfiles()[0];
    const slug = slugify(firstRealm.realm);
    const profile = getRealmBySlug(slug);
    expect(profile?.realm).toBe(firstRealm.realm);
    expect(getRealmEvents(firstRealm.realm, 10).length).toBeGreaterThan(0);
    expect(queryEvents({ realm: firstRealm.realm, limit: 3 }).length).toBeGreaterThan(0);
  });
});
