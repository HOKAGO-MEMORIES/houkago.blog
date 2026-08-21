"use client";

import { useEffect, useRef, useState } from "react";

const PANEL_LABELS = ["Intro", "Featured Projects", "Recent Posts"] as const;
const WHEEL_THRESHOLD = 36;
const GESTURE_RESET_GAP = 180;
const PANEL_TRANSITION_DURATION = 760;
const PANEL_SCROLL_EPSILON = 2;

function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(
      target.closest(
        'a, button, input, textarea, select, summary, [contenteditable="true"], [role="slider"]',
      ),
    )
  );
}

function isPanelNavigatorTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest(".home-panel-nav"))
  );
}

function preservesNativeWheel(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(
      target.closest(
        'input, textarea, select, [contenteditable="true"], [role="slider"], [data-home-native-wheel]',
      ),
    )
  );
}

function canScrollPanel(panel: HTMLElement, direction: -1 | 1) {
  const maxScroll = Math.max(0, panel.scrollHeight - panel.clientHeight);
  return direction > 0
    ? panel.scrollTop < maxScroll - PANEL_SCROLL_EPSILON
    : panel.scrollTop > PANEL_SCROLL_EPSILON;
}

export default function HomePanelNavigator() {
  const controllerRef = useRef<HTMLElement>(null);
  const navigateRef = useRef<(index: number) => void>(() => undefined);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const stage = controllerRef.current?.closest<HTMLElement>(
      ".home-panel-stage",
    );
    if (!stage) return;

    const panelElements = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-home-panel-frame]"),
    );
    const footer = document.querySelector<HTMLElement>("[data-site-footer]");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let enhancedMode = false;
    let lockedUntil = 0;
    let transitionTimer: number | undefined;
    let accumulatedDelta = 0;
    let gestureConsumed = false;
    let gestureDirection: -1 | 0 | 1 = 0;
    let lastWheelAt = 0;
    let scrollFrame: number | undefined;

    const applyIndex = (index: number) => {
      activeIndexRef.current = index;
      setActiveIndex(index);
      stage.dataset.activePanel = String(index + 1);
      stage.style.setProperty("--home-panel-index", String(index));
      panelElements.forEach((panel, panelIndex) => {
        const inactive = enhancedMode && panelIndex !== index;
        panel.dataset.panelState = panelIndex === index ? "active" : "inactive";
        panel.inert = inactive;
        if (inactive) panel.setAttribute("aria-hidden", "true");
        else panel.removeAttribute("aria-hidden");
      });
      document.body.classList.toggle(
        "home-panel-at-end",
        enhancedMode && index === panelElements.length - 1,
      );
    };

    const resetGesture = (consumed = false) => {
      accumulatedDelta = 0;
      gestureDirection = 0;
      gestureConsumed = consumed;
    };

    const goToPanel = (requestedIndex: number) => {
      const nextIndex = Math.max(
        0,
        Math.min(panelElements.length - 1, requestedIndex),
      );
      if (nextIndex === activeIndexRef.current) return false;

      if (enhancedMode) {
        const now = performance.now();
        if (now < lockedUntil) return false;

        const direction: -1 | 1 =
          nextIndex > activeIndexRef.current ? 1 : -1;
        const incomingPanel = panelElements[nextIndex];
        incomingPanel.scrollTop = direction > 0 ? 0 : incomingPanel.scrollHeight;

        applyIndex(nextIndex);
        lockedUntil = now + PANEL_TRANSITION_DURATION;
        window.clearTimeout(transitionTimer);
        transitionTimer = window.setTimeout(() => {
          lockedUntil = 0;
          resetGesture(true);
        }, PANEL_TRANSITION_DURATION);
        return true;
      }

      applyIndex(nextIndex);
      panelElements[nextIndex]?.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start",
      });
      return true;
    };

    navigateRef.current = goToPanel;

    const syncFooterHeight = () => {
      if (!footer) return;
      stage.style.setProperty(
        "--home-footer-height",
        `${Math.ceil(footer.getBoundingClientRect().height)}px`,
      );
    };

    const syncNativeActivePanel = () => {
      if (enhancedMode || scrollFrame !== undefined) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = undefined;
        const headerOffset = Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--header-height",
          ),
        );
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        panelElements.forEach((panel, index) => {
          const distance = Math.abs(panel.getBoundingClientRect().top - headerOffset);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        if (closestIndex !== activeIndexRef.current) applyIndex(closestIndex);
      });
    };

    const syncMode = () => {
      enhancedMode =
        finePointer.matches &&
        !reducedMotion.matches &&
        window.innerWidth >= 761;
      document.body.classList.toggle("home-panel-enhanced", enhancedMode);

      if (enhancedMode) {
        window.scrollTo({ top: 0, behavior: "auto" });
        applyIndex(activeIndexRef.current);
      } else {
        document.body.classList.remove("home-panel-at-end");
        syncNativeActivePanel();
      }

      syncFooterHeight();
    };

    const onWheel = (event: WheelEvent) => {
      if (!enhancedMode || event.ctrlKey || preservesNativeWheel(event.target)) {
        return;
      }

      const deltaScale =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;
      const verticalDelta = event.deltaY * deltaScale;
      const horizontalDelta = event.deltaX * deltaScale;
      if (
        verticalDelta === 0 ||
        Math.abs(horizontalDelta) > Math.abs(verticalDelta)
      ) {
        return;
      }

      const now = performance.now();
      if (now < lockedUntil) {
        event.preventDefault();
        return;
      }

      const direction: -1 | 1 = verticalDelta > 0 ? 1 : -1;
      const activePanel = panelElements[activeIndexRef.current];
      if (activePanel && canScrollPanel(activePanel, direction)) {
        resetGesture(true);
        lastWheelAt = now;
        return;
      }

      event.preventDefault();
      const newGesture = now - lastWheelAt > GESTURE_RESET_GAP;
      lastWheelAt = now;
      if (newGesture) resetGesture();

      if (gestureDirection !== 0 && gestureDirection !== direction) {
        resetGesture();
      }
      gestureDirection = direction;
      if (gestureConsumed) return;

      accumulatedDelta += verticalDelta;
      if (Math.abs(accumulatedDelta) < WHEEL_THRESHOLD) return;

      gestureConsumed = true;
      accumulatedDelta = 0;
      goToPanel(activeIndexRef.current + direction);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        isInteractiveTarget(event.target) &&
        !isPanelNavigatorTarget(event.target)
      ) {
        return;
      }

      if (event.key === "Home" || event.key === "End") {
        const targetIndex = event.key === "Home" ? 0 : panelElements.length - 1;
        if (goToPanel(targetIndex)) event.preventDefault();
        return;
      }

      let direction: -1 | 1 | undefined;
      if (event.key === "ArrowDown" || event.key === "PageDown") direction = 1;
      if (event.key === "ArrowUp" || event.key === "PageUp") direction = -1;
      if (!direction) return;

      if (enhancedMode) {
        const activePanel = panelElements[activeIndexRef.current];
        if (activePanel && canScrollPanel(activePanel, direction)) {
          activePanel.scrollBy({
            top: direction * Math.max(96, activePanel.clientHeight * 0.72),
            behavior: "smooth",
          });
          event.preventDefault();
          return;
        }
      }

      if (goToPanel(activeIndexRef.current + direction)) event.preventDefault();
    };

    const resizeObserver = new ResizeObserver(syncFooterHeight);
    if (footer) resizeObserver.observe(footer);

    syncMode();
    window.addEventListener("resize", syncMode);
    window.addEventListener("scroll", syncNativeActivePanel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    stage.addEventListener("wheel", onWheel, { passive: false });
    finePointer.addEventListener("change", syncMode);
    reducedMotion.addEventListener("change", syncMode);

    return () => {
      resizeObserver.disconnect();
      window.clearTimeout(transitionTimer);
      window.cancelAnimationFrame(scrollFrame ?? 0);
      window.removeEventListener("resize", syncMode);
      window.removeEventListener("scroll", syncNativeActivePanel);
      window.removeEventListener("keydown", onKeyDown);
      stage.removeEventListener("wheel", onWheel);
      finePointer.removeEventListener("change", syncMode);
      reducedMotion.removeEventListener("change", syncMode);
      document.body.classList.remove(
        "home-panel-enhanced",
        "home-panel-at-end",
      );
      stage.style.removeProperty("--home-footer-height");
      stage.style.removeProperty("--home-panel-index");
      stage.dataset.activePanel = "1";
      panelElements.forEach((panel) => {
        panel.inert = false;
        panel.removeAttribute("aria-hidden");
        panel.removeAttribute("data-panel-state");
      });
      navigateRef.current = () => undefined;
    };
  }, []);

  return (
    <>
      <nav
        ref={controllerRef}
        className="home-panel-nav"
        aria-label="홈 섹션"
      >
        {PANEL_LABELS.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-label={`${label} 섹션으로 이동`}
            aria-current={index === activeIndex ? "step" : undefined}
            className="home-panel-nav-button"
            onClick={() => navigateRef.current(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </nav>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {PANEL_LABELS[activeIndex]} 섹션, {activeIndex + 1} / {PANEL_LABELS.length}
      </p>
    </>
  );
}
