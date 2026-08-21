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
      matches: query.includes("prefers-reduced-motion")
        ? reducedMotion
        : query.includes("pointer: fine"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 1280,
  });
  window.scrollTo = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  HTMLElement.prototype.scrollBy = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.className = "";
});

describe("HomePanelNavigator", () => {
  it("moves at most one panel per wheel gesture and locks during transition", async () => {
    const { container } = renderNavigator();
    const stage = container.querySelector<HTMLElement>(".home-panel-stage");
    expect(stage).not.toBeNull();
    expect(document.body.classList.contains("home-panel-enhanced")).toBe(true);

    fireEvent.wheel(stage!, { deltaY: 40, deltaMode: 0 });
    expect(stage?.dataset.activePanel).toBe("2");

    fireEvent.wheel(stage!, { deltaY: 80, deltaMode: 0 });
    expect(stage?.dataset.activePanel).toBe("2");

    await act(() => vi.advanceTimersByTimeAsync(900));
    fireEvent.wheel(stage!, { deltaY: 40, deltaMode: 0 });
    expect(stage?.dataset.activePanel).toBe("3");
    expect(document.body.classList.contains("home-panel-at-end")).toBe(true);
  });

  it("supports section navigator and Home/End keyboard movement", async () => {
    const { container } = renderNavigator();
    const stage = container.querySelector<HTMLElement>(".home-panel-stage");

    fireEvent.click(
      screen.getByRole("button", { name: "Recent Posts 섹션으로 이동" }),
    );
    expect(stage?.dataset.activePanel).toBe("3");

    await act(() => vi.advanceTimersByTimeAsync(900));
    fireEvent.keyDown(window, { key: "Home" });
    expect(stage?.dataset.activePanel).toBe("1");

    await act(() => vi.advanceTimersByTimeAsync(900));
    fireEvent.keyDown(window, { key: "End" });
    expect(stage?.dataset.activePanel).toBe("3");
  });

  it("keeps keyboard panel movement available while the navigator has focus", async () => {
    const { container } = renderNavigator();
    const stage = container.querySelector<HTMLElement>(".home-panel-stage");
    const introButton = screen.getByRole("button", {
      name: "Intro 섹션으로 이동",
    });

    introButton.focus();
    fireEvent.keyDown(introButton, { key: "ArrowDown" });
    expect(stage?.dataset.activePanel).toBe("2");

    await act(() => vi.advanceTimersByTimeAsync(900));
    fireEvent.keyDown(introButton, { key: "End" });
    expect(stage?.dataset.activePanel).toBe("3");
  });

  it("disables wheel interception for reduced motion and keeps native section navigation", () => {
    reducedMotion = true;
    const { container } = renderNavigator();
    const stage = container.querySelector<HTMLElement>(".home-panel-stage");

    expect(document.body.classList.contains("home-panel-enhanced")).toBe(false);
    fireEvent.wheel(stage!, { deltaY: 80, deltaMode: 0 });
    expect(stage?.dataset.activePanel).toBe("1");

    fireEvent.click(
      screen.getByRole("button", { name: "Featured Projects 섹션으로 이동" }),
    );
    expect(stage?.dataset.activePanel).toBe("2");
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledOnce();
  });
});

function renderNavigator() {
  return render(
    <div className="home-panel-stage" data-active-panel="1">
      <div className="home-panel-track">
        <div className="home-panel-frame" data-home-panel-frame>
          <section>Intro</section>
        </div>
        <div className="home-panel-frame" data-home-panel-frame>
          <section>Projects</section>
        </div>
        <div className="home-panel-frame" data-home-panel-frame>
          <section>Posts</section>
        </div>
      </div>
      <HomePanelNavigator />
    </div>,
  );
}
