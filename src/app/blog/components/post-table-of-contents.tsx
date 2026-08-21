"use client";

import { useEffect, useState, type MouseEvent } from "react";
import type { PostTableOfContentsItem } from "@/lib/post-headings";

type PostTableOfContentsProps = {
  readonly items: readonly PostTableOfContentsItem[];
};

export default function PostTableOfContents({
  items,
}: PostTableOfContentsProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let frameId = 0;
    const updateActiveHeading = () => {
      frameId = 0;
      const headerOffset = getHeaderHeight() + 48;
      let nextActiveId = items[0].id;

      for (const item of items) {
        const heading = document.getElementById(item.id);
        if (heading && heading.getBoundingClientRect().top <= headerOffset) {
          nextActiveId = item.id;
        }
      }

      const documentHeight = document.documentElement.scrollHeight;
      if (window.scrollY + window.innerHeight >= documentHeight - 2) {
        nextActiveId = items.at(-1)?.id ?? nextActiveId;
      }

      setActiveId((current) =>
        current === nextActiveId ? current : nextActiveId,
      );
    };
    const scheduleUpdate = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(updateActiveHeading);
      }
    };

    updateActiveHeading();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const navigateToHeading = (
    event: MouseEvent<HTMLAnchorElement>,
    item: PostTableOfContentsItem,
  ) => {
    const heading = document.getElementById(item.id);
    if (!heading) {
      return;
    }

    event.preventDefault();
    const hash = `#${encodeURIComponent(item.id)}`;
    if (window.location.hash === hash) {
      window.history.replaceState(null, "", hash);
    } else {
      window.history.pushState(null, "", hash);
    }
    const targetTop =
      window.scrollY +
      heading.getBoundingClientRect().top -
      getHeaderHeight() -
      32;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior,
      });
    });
  };

  return (
    <aside className="post-detail-toc" aria-label="이 글의 순서">
      <span className="post-detail-aside-label">이 글의 순서</span>
      <nav>
        {items.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(event) => navigateToHeading(event, item)}
            className={activeId === item.id ? "is-active" : undefined}
            data-level={item.level}
            aria-current={activeId === item.id ? "location" : undefined}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function getHeaderHeight() {
  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height");
  return Number.parseFloat(value) || 0;
}
