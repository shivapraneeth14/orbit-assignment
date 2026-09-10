import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton, CardSkeleton, BoardSkeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
  it("renders a shimmer placeholder", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    expect(container.querySelector(".skeleton-shimmer")).toBeInTheDocument();
  });

  it("renders card and board skeletons", () => {
    const { container: cardContainer } = render(<CardSkeleton />);
    expect(cardContainer.querySelectorAll(".skeleton-shimmer")).toHaveLength(3);
  });

  it("renders four board columns", () => {
    const { container: boardContainer } = render(<BoardSkeleton />);
    expect(boardContainer.querySelectorAll(".skeleton-shimmer")).toHaveLength(20);
  });
});