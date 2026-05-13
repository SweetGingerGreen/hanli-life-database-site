import type { MetadataRoute } from "next";
import { getMeta } from "@/lib/queries/overview";
import { getRealmProfiles, slugify } from "@/lib/queries/realms";
import { getAllEventIds } from "@/lib/queries/timeline";

const CHUNK_SIZE = 5000;
const CARD_SLUGS = ["resume-yuanying-mid", "profile-jiedan-1", "risk-annual", "seclusion-ledger"];

export const dynamic = "force-static";

function baseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function allPaths() {
  return [
    "/",
    "/timeline",
    "/events",
    "/realms",
    "/cards",
    "/methodology",
    ...CARD_SLUGS.map((slug) => `/cards/${slug}`),
    ...getRealmProfiles().map((realm) => `/realms/${slugify(realm.realm)}`),
    ...getAllEventIds().map((id) => `/events/${id}`),
  ];
}

export async function generateSitemaps() {
  const count = Math.ceil(allPaths().length / CHUNK_SIZE);
  return Array.from({ length: count }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const start = id * CHUNK_SIZE;
  const paths = allPaths().slice(start, start + CHUNK_SIZE);
  const meta = getMeta();
  const generatedAt = new Date(meta.generated_at_utc ?? Date.now());

  return paths.map((path) => ({
    url: `${baseUrl()}${path}`,
    lastModified: generatedAt,
  }));
}
