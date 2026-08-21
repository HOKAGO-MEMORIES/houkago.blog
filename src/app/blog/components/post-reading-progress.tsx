"use client";

import { useEffect, useRef } from "react";

type PostReadingProgressProps = {
  readonly targetId: string;
};

export default function PostReadingProgress({
  targetId,
}: PostReadingProgressProps) {
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const progress = progressRef.current;
    if (!target || !progress) {
      return;
    }

    let frameId = 0;
    const updateProgress = () => {
      frameId = 0;
      const headerHeight = getHeaderHeight();
      const targetTop = window.scrollY + target.getBoundingClientRect().top;
      const start = targetTop - headerHeight;
      const end = Math.max(
        start + 1,
        targetTop + target.scrollHeight - window.innerHeight + headerHeight,
      );
      const ratio = Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
      progress.style.transform = `scaleX(${ratio})`;
    };
    const scheduleUpdate = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(updateProgress);
      }
    };
    const resizeObserver = new ResizeObserver(scheduleUpdate);

    resizeObserver.observe(target);
    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [targetId]);

  return (
    <div className="post-reading-progress" aria-hidden="true">
      <span ref={progressRef} />
    </div>
  );
}

function getHeaderHeight() {
  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height");
  return Number.parseFloat(value) || 0;
}
