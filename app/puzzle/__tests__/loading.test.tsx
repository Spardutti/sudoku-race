import { render } from "@testing-library/react";
import PuzzleLoading from "../loading";

describe("PuzzleLoading", () => {
  it("renders loading skeleton", () => {
    const { container } = render(<PuzzleLoading />);
    expect(container).toBeInTheDocument();
  });

  it("displays header skeletons", () => {
    const { container } = render(<PuzzleLoading />);
    const skeletons = container.querySelectorAll(".h-10, .h-5");
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });

  it("displays timer skeleton", () => {
    const { container } = render(<PuzzleLoading />);
    const timerSkeleton = container.querySelector(".h-12.w-32");
    expect(timerSkeleton).toBeInTheDocument();
  });

  it("displays grid skeleton with correct dimensions", () => {
    const { container } = render(<PuzzleLoading />);
    const gridSkeleton = container.querySelector(".w-\\[360px\\].h-\\[360px\\]");
    expect(gridSkeleton).toBeInTheDocument();
    expect(gridSkeleton).toHaveClass("border-4", "border-black");
  });

  it("displays submit button skeleton", () => {
    const { container } = render(<PuzzleLoading />);
    const buttonSkeleton = container.querySelector(".h-12.w-full");
    expect(buttonSkeleton).toBeInTheDocument();
  });

  it("displays number pad skeleton on mobile", () => {
    const { container } = render(<PuzzleLoading />);
    const numberPadSkeleton = container.querySelector(".lg\\:hidden");
    expect(numberPadSkeleton).toBeInTheDocument();
  });

  it("renders 10 number pad skeleton buttons", () => {
    const { container } = render(<PuzzleLoading />);
    const numberPadContainer = container.querySelector(".grid-cols-5");
    const skeletons = numberPadContainer?.querySelectorAll(".h-14");
    expect(skeletons?.length).toBe(10);
  });

  it("matches final layout dimensions to prevent layout shift", () => {
    const { container } = render(<PuzzleLoading />);
    const gridSkeleton = container.querySelector(".w-\\[360px\\].h-\\[360px\\]");
    expect(gridSkeleton).toHaveClass("md:w-[450px]", "md:h-[450px]");
  });
});
