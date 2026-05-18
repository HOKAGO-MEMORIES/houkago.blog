import { NextResponse } from "next/server";
import { getSearchPosts } from "@/lib/posts";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    {
      posts: getSearchPosts(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
