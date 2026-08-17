import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { buildPostSitemap } from "@/lib/post-sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  return buildPostSitemap();
}
