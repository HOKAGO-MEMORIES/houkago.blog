"use client";

import {
  Children,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type HomePanelNavigatorProps = { children: ReactNode };
type PanelTransition = { from: number; to: number; direction: -1 | 1 };

const WHEEL_THRESHOLD = 28;
const SWIPE_THRESHOLD = 56;
const PANEL_MOTION_DURATION = 920;
const NEW_GESTURE_GAP = 120;
const REACCELERATION_RATIO = 1.6;
const DECAY_RATIO = 0.55;
const MIN_RESTART_DELTA = 18;
const SCROLL_EDGE_EPSILON = 2;
const FOOTER_EDGE_EPSILON = 24;
const FOOTER_HIDE_DISTANCE = 24;

function normalizeRemainingScrollDistance(distance: number) {
  return Math.max(0, Math.floor(distance + Number.EPSILON));
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      'input, textarea, select, button, [contenteditable="true"], [role="slider"]',
    ),
  );
}

export default function HomePanelNavigator({ children }: HomePanelNavigatorProps) {
  const panels = Children.toArray(children);
  const panelCount = panels.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [transition, setTransition] = useState<PanelTransition | null>(null);
  const activeIndexRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressPercent = Math.floor(((activeIndex + 1) / panelCount) * 100000) / 1000;
  const progressStyle = {
    "--home-panel-progress": `${progressPercent}%`,
    "--home-panel-number-position": `calc(${progressPercent}% - var(--home-panel-number-inset))`,
  } as CSSProperties;

  useEffect(() => {
    const stageCandidate = stageRef.current;
    if (!stageCandidate) return;
    const stage: HTMLDivElement = stageCandidate;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const panelElements = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-home-panel-index]"),
    );
    const panelContentElements = panelElements.map((panel) =>
      panel.querySelector<HTMLElement>("[data-home-snap-section]"),
    );
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const footer = document.querySelector<HTMLElement>("[data-site-footer]");

    let accumulatedDelta = 0;
    let accumulatedDirection: -1 | 0 | 1 = 0;
    let gestureConsumed = false;
    let lastWheelAt = 0;
    let lastAbsoluteDelta = 0;
    let transitionUntil = 0;
    let transitionPeakDelta = 0;
    let transitionSawDecay = false;
    let transitionTimer: number | undefined;
    let sizeSyncFrame: number | undefined;
    let touchStartY: number | undefined;
    let touchStartScrollTop = 0;
    let disposed = false;
    let footerVisible = false;
    let footerVisibilityInitialized = false;
    let footerRevealScrollTop = 0;

    const activePanel = () => panelElements[activeIndexRef.current];
    const maxPanelScroll = (panel: HTMLElement) =>
      Math.max(0, panel.scrollHeight - panel.clientHeight);

    function setFooterVisibility(visible: boolean, revealScrollTop = 0) {
      if (footerVisibilityInitialized && footerVisible === visible) return;
      footerVisibilityInitialized = true;
      footerVisible = visible;
      footerRevealScrollTop = visible ? revealScrollTop : 0;
      document.body.classList.toggle("home-panel-footer-visible", visible);
      if (!footer) return;
      footer.inert = !visible;
      if (visible) footer.removeAttribute("aria-hidden");
      else footer.setAttribute("aria-hidden", "true");
    }

    function syncFooterVisibility() {
      if (activeIndexRef.current !== panelCount - 1 || !footer) {
        setFooterVisibility(false);
        return;
      }

      const panel = panelElements[panelCount - 1];
      const content = panelContentElements[panelCount - 1];
      if (!panel || !content) {
        setFooterVisibility(false);
        return;
      }

      const footerHeight = footer.getBoundingClientRect().height;
      const reservedFooterSpace = Number.parseFloat(getComputedStyle(content).paddingBottom) || 0;
      const contentHeight = Math.max(0, content.scrollHeight - reservedFooterSpace);
      const fits = contentHeight + footerHeight <= panel.clientHeight + SCROLL_EDGE_EPSILON;
      if (fits) {
        setFooterVisibility(true, panel.scrollTop);
        return;
      }

      const distanceFromEnd = Math.max(0, maxPanelScroll(panel) - panel.scrollTop);
      const normalizedDistanceFromEnd = normalizeRemainingScrollDistance(distanceFromEnd);
      if (!footerVisible && normalizedDistanceFromEnd <= FOOTER_EDGE_EPSILON) {
        setFooterVisibility(true, panel.scrollTop);
      } else if (
        footerVisible &&
        (footerRevealScrollTop - panel.scrollTop >= FOOTER_HIDE_DISTANCE ||
          distanceFromEnd > FOOTER_EDGE_EPSILON + FOOTER_HIDE_DISTANCE)
      ) {
        setFooterVisibility(false);
      }
    }

    function panelCanScroll(panel: HTMLElement, direction: -1 | 1) {
      const maxScroll = maxPanelScroll(panel);
      return direction > 0
        ? panel.scrollTop < maxScroll - SCROLL_EDGE_EPSILON
        : panel.scrollTop > SCROLL_EDGE_EPSILON;
    }

    function syncStageSize() {
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      stage.style.setProperty(
        "--home-panel-stage-height",
        `${Math.max(0, Math.floor(window.innerHeight - headerHeight))}px`,
      );
      const footerHeight = footer?.getBoundingClientRect().height ?? 0;
      if (footerHeight > 0) {
        stage.style.setProperty("--home-panel-footer-height", `${Math.ceil(footerHeight)}px`);
      }

      const panel = activePanel();
      if (panel) {
        const maxScroll = maxPanelScroll(panel);
        if (maxScroll <= SCROLL_EDGE_EPSILON) panel.scrollTop = 0;
        else if (panel.scrollTop > maxScroll) panel.scrollTop = maxScroll;
      }
      syncFooterVisibility();
      if (window.scrollY !== 0) window.scrollTo({ top: 0, behavior: "auto" });
    }

    function scheduleSizeSync() {
      if (disposed || sizeSyncFrame !== undefined) return;
      sizeSyncFrame = window.requestAnimationFrame(() => {
        sizeSyncFrame = undefined;
        syncStageSize();
      });
    }

    function syncAccessibility() {
      const focused = document.activeElement;
      panelElements.forEach((panel, index) => {
        const inactive = index !== activeIndexRef.current;
        panel.inert = inactive;
        if (inactive) panel.setAttribute("aria-hidden", "true");
        else panel.removeAttribute("aria-hidden");
        if (inactive && focused instanceof HTMLElement && panel.contains(focused)) {
          focused.blur();
        }
      });
      document.body.classList.toggle(
        "home-panel-at-end",
        activeIndexRef.current === panelCount - 1,
      );
      syncFooterVisibility();
    }

    function resetWheelAccumulation(consumed = false) {
      accumulatedDelta = 0;
      accumulatedDirection = 0;
      gestureConsumed = consumed;
    }

    function completeTransition() {
      transitionUntil = 0;
      resetWheelAccumulation(true);
      setTransition(null);
      scheduleSizeSync();
    }

    function goToPanel(nextIndex: number) {
      if (performance.now() < transitionUntil) return false;
      const boundedIndex = Math.max(0, Math.min(panelCount - 1, nextIndex));
      const currentIndex = activeIndexRef.current;
      if (boundedIndex === currentIndex) return false;

      const direction: -1 | 1 = boundedIndex > currentIndex ? 1 : -1;
      const incomingPanel = panelElements[boundedIndex];
      if (incomingPanel) {
        incomingPanel.scrollTop = direction > 0 ? 0 : maxPanelScroll(incomingPanel);
      }
      activeIndexRef.current = boundedIndex;
      setActiveIndex(boundedIndex);
      syncAccessibility();

      window.clearTimeout(transitionTimer);
      if (reducedMotionQuery.matches) {
        transitionUntil = 0;
        setTransition(null);
        resetWheelAccumulation(true);
        scheduleSizeSync();
        return true;
      }

      setTransition({ from: currentIndex, to: boundedIndex, direction });
      transitionUntil = performance.now() + PANEL_MOTION_DURATION;
      transitionPeakDelta = lastAbsoluteDelta;
      transitionSawDecay = false;
      transitionTimer = window.setTimeout(completeTransition, PANEL_MOTION_DURATION);
      return true;
    }

    function consumePanelScroll(panel: HTMLElement, delta: number) {
      const direction: -1 | 1 = delta > 0 ? 1 : -1;
      if (!panelCanScroll(panel, direction)) return false;
      panel.scrollTop = Math.max(0, Math.min(maxPanelScroll(panel), panel.scrollTop + delta));
      resetWheelAccumulation(true);
      return true;
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const deltaScale =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;
      const verticalDelta = event.deltaY * deltaScale;
      const horizontalDelta = event.deltaX * deltaScale;
      if (Math.abs(horizontalDelta) > Math.abs(verticalDelta) || verticalDelta === 0) return;

      event.preventDefault();
      const now = performance.now();
      const absoluteDelta = Math.abs(verticalDelta);
      const deltaDirection: -1 | 1 = verticalDelta > 0 ? 1 : -1;
      const wheelGap = lastWheelAt === 0 ? Number.POSITIVE_INFINITY : now - lastWheelAt;
      const isReacceleration =
        transitionSawDecay &&
        absoluteDelta >= MIN_RESTART_DELTA &&
        absoluteDelta >= lastAbsoluteDelta * REACCELERATION_RATIO;

      if (now < transitionUntil) {
        if (transitionPeakDelta > 0 && absoluteDelta <= transitionPeakDelta * DECAY_RATIO) {
          transitionSawDecay = true;
        }
        transitionPeakDelta = Math.max(transitionPeakDelta, absoluteDelta);
        lastWheelAt = now;
        lastAbsoluteDelta = absoluteDelta;
        return;
      }

      const panel = activePanel();
      if (panel && consumePanelScroll(panel, verticalDelta)) {
        lastWheelAt = now;
        lastAbsoluteDelta = absoluteDelta;
        return;
      }

      const startsNewGesture = wheelGap > NEW_GESTURE_GAP || isReacceleration;
      lastWheelAt = now;
      lastAbsoluteDelta = absoluteDelta;
      if (startsNewGesture) {
        resetWheelAccumulation();
        accumulatedDirection = deltaDirection;
      } else if (accumulatedDirection !== 0 && accumulatedDirection !== deltaDirection) {
        resetWheelAccumulation();
        accumulatedDirection = deltaDirection;
      }
      if (gestureConsumed) return;

      accumulatedDirection = deltaDirection;
      accumulatedDelta += verticalDelta;
      if (Math.abs(accumulatedDelta) < WHEEL_THRESHOLD) return;
      const direction = accumulatedDelta > 0 ? 1 : -1;
      accumulatedDelta = 0;
      gestureConsumed = true;
      goToPanel(activeIndexRef.current + direction);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (performance.now() < transitionUntil || isInteractiveTarget(event.target)) return;
      if (event.key === "Home" || event.key === "End") {
        const target = event.key === "Home" ? 0 : panelCount - 1;
        if (goToPanel(target)) event.preventDefault();
        return;
      }

      let direction: -1 | 1 | undefined;
      if (
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        (event.key === " " && !event.shiftKey)
      ) direction = 1;
      else if (
        event.key === "ArrowUp" ||
        event.key === "PageUp" ||
        (event.key === " " && event.shiftKey)
      ) direction = -1;
      if (!direction) return;

      const panel = activePanel();
      if (panel && panelCanScroll(panel, direction)) {
        const step = event.key.startsWith("Arrow")
          ? 80
          : Math.max(160, panel.clientHeight * 0.8);
        panel.scrollBy({
          top: direction * step,
          behavior: reducedMotionQuery.matches ? "auto" : "smooth",
        });
        event.preventDefault();
        return;
      }
      if (goToPanel(activeIndexRef.current + direction)) event.preventDefault();
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || performance.now() < transitionUntil) return;
      touchStartY = event.touches[0].clientY;
      touchStartScrollTop = activePanel()?.scrollTop ?? 0;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (touchStartY === undefined || event.changedTouches.length !== 1) return;
      const distance = touchStartY - event.changedTouches[0].clientY;
      touchStartY = undefined;
      if (Math.abs(distance) < SWIPE_THRESHOLD || performance.now() < transitionUntil) return;

      const direction: -1 | 1 = distance > 0 ? 1 : -1;
      const panel = activePanel();
      if (!panel) return;
      const maxScroll = maxPanelScroll(panel);
      const startedAtBoundary = direction > 0
        ? touchStartScrollTop >= maxScroll - SCROLL_EDGE_EPSILON
        : touchStartScrollTop <= SCROLL_EDGE_EPSILON;
      const endedAtBoundary = direction > 0
        ? panel.scrollTop >= maxScroll - SCROLL_EDGE_EPSILON
        : panel.scrollTop <= SCROLL_EDGE_EPSILON;
      if (startedAtBoundary && endedAtBoundary) {
        goToPanel(activeIndexRef.current + direction);
      }
    };

    const onTouchCancel = () => {
      touchStartY = undefined;
    };
    const onPanelScroll = () => syncFooterVisibility();

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(scheduleSizeSync);
    if (header) resizeObserver?.observe(header);
    if (footer) resizeObserver?.observe(footer);
    panelElements.forEach((panel) => resizeObserver?.observe(panel));
    panelContentElements.forEach((content) => {
      if (content) resizeObserver?.observe(content);
    });

    document.body.classList.add("home-panel-active");
    syncAccessibility();
    syncStageSize();
    void document.fonts.ready.then(scheduleSizeSync);
    document.fonts.addEventListener("loadingdone", scheduleSizeSync);
    reducedMotionQuery.addEventListener("change", scheduleSizeSync);
    window.addEventListener("resize", scheduleSizeSync);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchend", onTouchEnd, { passive: true });
    stage.addEventListener("touchcancel", onTouchCancel, { passive: true });
    panelElements.forEach((panel) =>
      panel.addEventListener("scroll", onPanelScroll, { passive: true }),
    );

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      document.fonts.removeEventListener("loadingdone", scheduleSizeSync);
      reducedMotionQuery.removeEventListener("change", scheduleSizeSync);
      window.removeEventListener("resize", scheduleSizeSync);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchend", onTouchEnd);
      stage.removeEventListener("touchcancel", onTouchCancel);
      panelElements.forEach((panel) => panel.removeEventListener("scroll", onPanelScroll));
      window.clearTimeout(transitionTimer);
      window.cancelAnimationFrame(sizeSyncFrame ?? 0);
      stage.style.removeProperty("--home-panel-stage-height");
      stage.style.removeProperty("--home-panel-footer-height");
      document.body.classList.remove(
        "home-panel-active",
        "home-panel-at-end",
        "home-panel-footer-visible",
      );
      panelElements.forEach((panel) => {
        panel.inert = false;
        panel.removeAttribute("aria-hidden");
      });
      if (footer) {
        footer.inert = false;
        footer.removeAttribute("aria-hidden");
      }
    };
  }, [panelCount]);

  return (
    <div ref={stageRef} className="home-panel-stage" data-active-panel={activeIndex + 1}>
      <div className="home-panel-track">
        {panels.map((panel, index) => {
          const isActive = index === activeIndex;
          const isIncoming = transition?.to === index;
          const isOutgoing = transition?.from === index;
          const panelState = isIncoming
            ? "incoming"
            : isOutgoing
              ? "outgoing"
              : isActive
                ? "active"
                : "inactive";
          return (
            <div
              className="home-panel-frame"
              data-home-panel-index={index}
              data-panel-state={panelState}
              data-panel-direction={transition?.direction === 1 ? "next" : "previous"}
              aria-hidden={isActive ? undefined : true}
              inert={isActive ? undefined : true}
              key={index}
            >
              {panel}
            </div>
          );
        })}
      </div>
      <div className="home-panel-progress" style={progressStyle} aria-hidden="true">
        <span className="home-panel-progress-number">
          {String(activeIndex + 1).padStart(2, "0")} / {String(panelCount).padStart(2, "0")}
        </span>
        <span className="home-panel-progress-track">
          <span className="home-panel-progress-fill" />
        </span>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {String(activeIndex + 1).padStart(2, "0")} / {String(panelCount).padStart(2, "0")} 섹션
      </p>
    </div>
  );
}
