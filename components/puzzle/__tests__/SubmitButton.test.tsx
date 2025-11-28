import { render, screen, fireEvent } from "@testing-library/react";
import { SubmitButton } from "../SubmitButton";

describe("SubmitButton", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders submit button with default text", () => {
    render(
      <SubmitButton
        onSubmit={mockOnSubmit}
        isDisabled={false}
        isLoading={false}
      />
    );

    expect(screen.getByRole("button")).toHaveTextContent("Submit");
  });

  it("shows loading text when isLoading is true", () => {
    render(
      <SubmitButton
        onSubmit={mockOnSubmit}
        isDisabled={false}
        isLoading={true}
      />
    );

    expect(screen.getByRole("button")).toHaveTextContent("Checking...");
  });

  it("calls onSubmit when clicked", () => {
    render(
      <SubmitButton
        onSubmit={mockOnSubmit}
        isDisabled={false}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByRole("button"));

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it("is disabled when isDisabled is true", () => {
    render(
      <SubmitButton
        onSubmit={mockOnSubmit}
        isDisabled={true}
        isLoading={false}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("is disabled when isLoading is true", () => {
    render(
      <SubmitButton
        onSubmit={mockOnSubmit}
        isDisabled={false}
        isLoading={true}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("has correct aria-label when loading", () => {
    render(
      <SubmitButton
        onSubmit={mockOnSubmit}
        isDisabled={false}
        isLoading={true}
      />
    );

    expect(screen.getByLabelText("Checking solution...")).toBeInTheDocument();
  });

  it("has correct aria-label when not loading", () => {
    render(
      <SubmitButton
        onSubmit={mockOnSubmit}
        isDisabled={false}
        isLoading={false}
      />
    );

    expect(screen.getByLabelText("Submit solution")).toBeInTheDocument();
  });
});
