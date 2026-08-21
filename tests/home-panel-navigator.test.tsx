/** @vitest-environment jsdom */

import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HomePanelNavigator from "@/app/components/home-panel-navigator";

let reducedMotion = false;

class ResizeObserverStub {
  observe() {}
  disconnect() {}
}

beforeEach(() => {
  vi.useFakeTimers();
  reducedMotion = false;
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion") && reducedMotion,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 900,
  });
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: 0,
  });
  window.scrollTo = vi.fn();
  HTMLElement.prototype.scrollBy = vi.fn();
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: {
      ready: Promise.resolve(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.className = "";
});

describe("HomePanelNavigator", () => {
  it("uses a fixed stage, exposes progress, and moves one panel per gesture", async () => {
    const { container } = renderNavigator();
    const stage = container.querySelector<HTMLElement>(".home-panel-stage");
    const panels = container.querySelectorAll<HTMLElement>("[data-home-panel-index]");

    expect(document.body.classList.contains("home-panel-active")).toBe(true);
    expect(screen.getByText("01 / 03")).not.toBeNull();
    expect(stage?.style.getPropertyValue("--home-panel-stage-height")).toBe("900px");
    expect(panels[0].inert).toBe(false);
    expect(panels[1].inert).toBe(true);

    fireEvent.wheel(window, { deltaY: 32, deltaMode: 0 });
    expect(stage?.dataset.activePanel).toBe("2");
    expect(screen.getByText("02 / 03")).not.toBeNull();
    expect(panels[0].dataset.panelState).toBe("outgoing");
    expect(panels[1].dataset.panelState).toBe("incoming");
    expect(panels[0].getAttribute("aria-hidden")).toBe("true");

    fireEvent.wheel(window, { deltaY: 80, deltaMode: 0 });
    expect(stage?.dataset.activePanel).toBe("2");

    await act(() => vi.advanceTimersByTimeAsync(950));
    fireEvent.wheel(window, { deltaY: 32, deltaMode: 0 });
    expect(stage?.dataset.activePanel).toBe("3");
    expect(screen.getByText("03 / 03")).not.toBeNull();
  });

  it("consumes internal panel scroll before changing panels", () => {
    const { container } = renderNavigator();
    const firstPanel = container.querySelector<HTMLElement>("[data-home-panel-index='0']")!;
    defineScrollMetrics(firstPanel, { clientHeight: 400, scrollHeight: 900 });

    fireEvent.wheel(window, { deltaY: 120, deltaMode: 0 });

    expect(firstPanel.scrollTop).toBe(120);
    expect(container.querySelector<HTMLElement>(".home-panel-stage")?.dataset.activePanel).toBe("1");
  });

  it("supports keyboard navigation and reduced-motion immediate transitions", () => {
    reducedMotion = true;
    const { container } = renderNavigator();
    const stage = container.querySelector<HTMLElement>(".home-panel-stage");

    fireEvent.keyDown(window, { key: "End" });
    expect(stage?.dataset.activePanel).toBe("3");
    expect(container.querySelector("[data-panel-state='incoming']")).toBeNull();

    fireEvent.keyDown(window, { key: "Home" });
    expect(stage?.dataset.activePanel).toBe("1");
  });

  it("moves on a boundary swipe and ignores a short swipe", async () => {
    const { container } = renderNavigator();
    const stage = container.querySelector<HTMLElement>(".home-panel-stage")!;

    fireEvent.touchStart(stage, { touches: [{ clientY: 600 }] });
    fireEvent.touchEnd(stage, { changedTouches: [{ clientY: 570 }] });
    expect(stage.dataset.activePanel).toBe("1");

    fireEvent.touchStart(stage, { touches: [{ clientY: 600 }] });
    fireEvent.touchEnd(stage, { changedTouches: [{ clientY: 500 }] });
    expect(stage.dataset.activePanel).toBe("2");

    await act(() => vi.advanceTimersByTimeAsync(950));
  });

  it("keeps the footer inert until the final panel and reveals it when content fits", async () => {
    const { container } = renderNavigator({ withFooter: true });
    const footer = screen.getByTestId("footer");
    const panels = container.querySelectorAll<HTMLElement>("[data-home-panel-index]");
    const finalContent = panels[2].querySelector<HTMLElement>("[data-home-snap-section]")!;
    defineScrollMetrics(panels[2], { clientHeight: 700, scrollHeight: 700 });
    defineScrollMetrics(finalContent, { clientHeight: 500, scrollHeight: 500 });
    vi.spyOn(footer, "getBoundingClientRect").mockReturnValue({
      width: 1000,
      height: 150,
      top: 750,
      right: 1000,
      bottom: 900,
      left: 0,
      x: 0,
      y: 750,
      toJSON: () => ({}),
    });

    expect(footer.inert).toBe(true);
    fireEvent.keyDown(window, { key: "End" });
    await act(() => vi.runOnlyPendingTimersAsync());

    expect(document.body.classList.contains("home-panel-footer-visible")).toBe(true);
    expect(footer.inert).toBe(false);
    expect(footer.hasAttribute("aria-hidden")).toBe(false);
  });

  it("reveals the footer on a new wheel gesture at a fractional boundary", async () => {
    reducedMotion = true;
    const { container } = renderNavigator({ withFooter: true });
    const footer = screen.getByTestId("footer");
    const panels = container.querySelectorAll<HTMLElement>("[data-home-panel-index]");
    const finalPanel = panels[2];
    const finalContent = finalPanel.querySelector<HTMLElement>("[data-home-snap-section]")!;
    defineScrollMetrics(finalPanel, { clientHeight: 720, scrollHeight: 1102 });
    defineScrollMetrics(finalContent, { clientHeight: 900, scrollHeight: 900 });
    vi.spyOn(footer, "getBoundingClientRect").mockReturnValue({
      width: 320,
      height: 150,
      top: 570,
      right: 320,
      bottom: 720,
      left: 0,
      x: 0,
      y: 570,
      toJSON: () => ({}),
    });

    fireEvent.keyDown(window, { key: "End" });
    let actualScrollTop = 330;
    Object.defineProperty(finalPanel, "scrollTop", {
      configurable: true,
      get: () => actualScrollTop,
      set: (value: number) => {
        actualScrollTop = Math.max(0, Math.min(357.5, value));
      },
    });
    await act(() => vi.advanceTimersByTimeAsync(1_000));

    fireEvent.scroll(finalPanel);

    expect(document.body.classList.contains("home-panel-footer-visible")).toBe(false);
    expect(footer.inert).toBe(true);
    expect(footer.getAttribute("aria-hidden")).toBe("true");

    fireEvent.wheel(window, { deltaY: 27.5, deltaMode: 0 });
    fireEvent.scroll(finalPanel);

    expect(finalPanel.scrollTop).toBe(357.5);
    expect(document.body.classList.contains("home-panel-footer-visible")).toBe(false);
    expect(footer.inert).toBe(true);
    expect(footer.getAttribute("aria-hidden")).toBe("true");

    fireEvent.wheel(window, { deltaY: 4, deltaMode: 0 });

    expect(finalPanel.scrollTop).toBe(357.5);
    expect(document.body.classList.contains("home-panel-footer-visible")).toBe(false);

    await act(() => vi.advanceTimersByTimeAsync(150));
    fireEvent.wheel(window, { deltaY: 28, deltaMode: 0 });

    expect(finalPanel.scrollTop).toBe(357.5);
    expect(document.body.classList.contains("home-panel-footer-visible")).toBe(true);
    expect(footer.inert).toBe(false);
    expect(footer.hasAttribute("aria-hidden")).toBe(false);
    expect(window.scrollY).toBe(0);

    fireEvent.wheel(window, { deltaY: -30, deltaMode: 0 });
    fireEvent.scroll(finalPanel);

    expect(finalPanel.scrollTop).toBe(327.5);
    expect(document.body.classList.contains("home-panel-footer-visible")).toBe(false);
    expect(footer.inert).toBe(true);
    expect(footer.getAttribute("aria-hidden")).toBe("true");
  });
});

function renderNavigator({ withFooter = false }: { withFooter?: boolean } = {}) {
  return render(
    <>
      <HomePanelNavigator>
        <section data-home-snap-section>Intro</section>
        <section data-home-snap-section>Projects</section>
        <section data-home-snap-section>Posts</section>
      </HomePanelNavigator>
      {withFooter ? <footer data-site-footer data-testid="footer">Footer</footer> : null}
    </>,
  );
}

function defineScrollMetrics(
  element: HTMLElement,
  metrics: { clientHeight: number; scrollHeight: number },
) {
  Object.defineProperty(element, "clientHeight", {
    configurable: true,
    value: metrics.clientHeight,
  });
  Object.defineProperty(element, "scrollHeight", {
    configurable: true,
    value: metrics.scrollHeight,
  });
}
