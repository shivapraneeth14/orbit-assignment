import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CountUp } from "@/components/dashboard/count-up";

let now = 0;

beforeEach(() => {
  vi.useFakeTimers();
  now = 16;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    now += 16;
    setTimeout(() => cb(now), 0);
    return 1;
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("CountUp", () => {
  it("animates to the target value", () => {
    render(<CountUp value={42} duration={200} />);
    expect(screen.getByText("0")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});