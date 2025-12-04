import { render, screen } from "@testing-library/react";
import { StatItem } from "../StatItem";

describe("StatItem", () => {
  it("should render label and value correctly", () => {
    render(<StatItem label="Test Label" value={42} />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("should handle string values", () => {
    render(<StatItem label="Status" value="Active" />);

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should handle number values", () => {
    render(<StatItem label="Count" value={100} />);

    expect(screen.getByText("Count")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("should apply correct styling to label", () => {
    render(<StatItem label="Label" value={1} />);

    const label = screen.getByText("Label");
    expect(label).toHaveClass("text-sm", "text-gray-600");
  });

  it("should apply correct styling to value", () => {
    render(<StatItem label="Label" value={1} />);

    const value = screen.getByText("1");
    expect(value).toHaveClass("text-3xl", "font-bold");
  });
});
