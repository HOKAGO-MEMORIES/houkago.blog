import Link from "next/link";
import type { FrontendPostNavigationItem } from "@/lib/backend-post-adapter";
import { getPostRoute } from "@/lib/post-navigation";

type PostDetailNavigationProps = {
  readonly olderPost: FrontendPostNavigationItem | null;
  readonly newerPost: FrontendPostNavigationItem | null;
};

type PostNavigationSlotProps = {
  readonly direction: "previous" | "next";
  readonly post: FrontendPostNavigationItem | null;
};

export default function PostDetailNavigation({
  olderPost,
  newerPost,
}: PostDetailNavigationProps) {
  return (
    <nav className="post-pagination" aria-label="이전 및 다음 글">
      <PostNavigationSlot direction="previous" post={olderPost} />
      <PostNavigationSlot direction="next" post={newerPost} />
    </nav>
  );
}

function PostNavigationSlot({ direction, post }: PostNavigationSlotProps) {
  const isNext = direction === "next";
  const label = isNext ? "다음 글" : "이전 글";
  const className = isNext
    ? "post-pagination-item is-next"
    : "post-pagination-item";

  if (post) {
    return (
      <Link href={getPostRoute(post)} className={className}>
        <span>{label}</span>
        <strong>{post.title}</strong>
      </Link>
    );
  }

  return (
    <div className={`${className} is-disabled`} role="note">
      <span>{label}</span>
      <strong>
        {isNext ? "더 새로운 글이 없습니다." : "더 오래된 글이 없습니다."}
      </strong>
    </div>
  );
}
