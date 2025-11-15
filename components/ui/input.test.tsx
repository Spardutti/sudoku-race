/**
 * Input Component Tests
 *
 * Comprehensive test suite for Input component with newspaper aesthetic.
 * Tests rendering, types, error handling, accessibility, focus states, and edge cases.
 *
 * Coverage target: >70% (AC-1.5.4)
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./input";

describe("Input Component", () => {
  describe("Rendering", () => {
    /**
     * Test: Input renders with placeholder
     * Ensures basic rendering functionality works
     */
    it("renders with placeholder", () => {
      render(<Input placeholder="Enter text" ariaLabel="Test input" />);
      const input = screen.getByPlaceholderText("Enter text");
      expect(input).toBeInTheDocument();
    });

    /**
     * Test: Input accepts custom className
     * Verifies className prop merging works correctly
     */
    it("accepts custom className", () => {
      render(<Input className="custom-class" ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input).toHaveClass("custom-class");
    });

    /**
     * Test: Input renders as input element
     * Ensures correct semantic HTML
     */
    it("renders as input element", () => {
      render(<Input ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input.tagName).toBe("INPUT");
    });
  });

  describe("Input Types", () => {
    /**
     * Test: Input supports text type
     * Default input type
     */
    it("supports text type (default)", () => {
      render(<Input ariaLabel="Text input" />);
      const input = screen.getByLabelText("Text input");
      expect(input).toHaveAttribute("type", "text");
    });

    /**
     * Test: Input supports email type
     * For email validation
     */
    it("supports email type", () => {
      render(<Input type="email" ariaLabel="Email input" />);
      const input = screen.getByLabelText("Email input");
      expect(input).toHaveAttribute("type", "email");
    });

    /**
     * Test: Input supports password type
     * For password fields with masked input
     */
    it("supports password type", () => {
      render(<Input type="password" ariaLabel="Password input" />);
      const input = screen.getByLabelText("Password input");
      expect(input).toHaveAttribute("type", "password");
    });
  });

  describe("Value and onChange", () => {
    /**
     * Test: Input displays value
     * Ensures controlled component works
     */
    it("displays value prop", () => {
      render(<Input value="Test value" ariaLabel="Test input" readOnly />);
      const input = screen.getByLabelText("Test input") as HTMLInputElement;
      expect(input.value).toBe("Test value");
    });

    /**
     * Test: Input calls onChange when user types
     * Ensures change handlers work correctly
     */
    it("calls onChange when user types", () => {
      const handleChange = jest.fn();
      render(
        <Input onChange={handleChange} ariaLabel="Test input" value="" />
      );

      const input = screen.getByLabelText("Test input");
      fireEvent.change(input, { target: { value: "new value" } });

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Input updates value on change
     * Ensures controlled component updates correctly
     */
    it("updates value when controlled", () => {
      const { rerender } = render(
        <Input value="initial" ariaLabel="Test input" readOnly />
      );
      let input = screen.getByLabelText("Test input") as HTMLInputElement;
      expect(input.value).toBe("initial");

      rerender(<Input value="updated" ariaLabel="Test input" readOnly />);
      input = screen.getByLabelText("Test input") as HTMLInputElement;
      expect(input.value).toBe("updated");
    });
  });

  describe("Error Handling", () => {
    /**
     * Test: Input displays error message when error prop provided
     * Ensures error UI is rendered
     */
    it("displays error message when error prop provided", () => {
      render(
        <Input
          error="This field is required"
          ariaLabel="Test input"
          id="test-input"
        />
      );

      const errorMessage = screen.getByText("This field is required");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute("role", "alert");
    });

    /**
     * Test: Input applies error border styling
     * Ensures visual error indicator
     */
    it("applies error border styling when error prop provided", () => {
      render(<Input error="Error message" ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input).toHaveClass("border-red-600");
    });

    /**
     * Test: Input sets aria-invalid when error exists
     * Ensures screen reader announces error
     */
    it("sets aria-invalid to true when error exists", () => {
      render(<Input error="Error message" ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    /**
     * Test: Input sets aria-describedby to error ID
     * Ensures error message is associated with input
     */
    it("associates error message with input via aria-describedby", () => {
      render(
        <Input
          error="Error message"
          ariaLabel="Test input"
          id="test-input"
        />
      );
      const input = screen.getByLabelText("Test input");
      expect(input).toHaveAttribute("aria-describedby", "test-input-error");

      const errorMessage = screen.getByText("Error message");
      expect(errorMessage).toHaveAttribute("id", "test-input-error");
    });

    /**
     * Test: Input without error has aria-invalid false
     * Ensures correct default state
     */
    it("sets aria-invalid to false when no error", () => {
      render(<Input ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input).toHaveAttribute("aria-invalid", "false");
    });
  });

  describe("Accessibility", () => {
    /**
     * Test: Input has aria-label
     * Ensures screen reader compatibility (required prop)
     */
    it("has aria-label for screen readers", () => {
      render(<Input ariaLabel="Email address" />);
      const input = screen.getByLabelText("Email address");
      expect(input).toHaveAttribute("aria-label", "Email address");
    });

    /**
     * Test: Input meets minimum tap target size (44px)
     * WCAG 2.1 Level AA compliance
     */
    it("meets WCAG minimum tap target size (44px)", () => {
      render(<Input ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input).toHaveClass("min-h-[44px]");
    });

    /**
     * Test: Input shows focus ring when focused
     * Ensures keyboard navigation visibility
     */
    it("has visible focus indicator (ring)", () => {
      render(<Input ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");

      input.focus();
      expect(input).toHaveFocus();
      expect(input).toHaveClass("focus:ring-2", "focus:ring-accent");
    });

    /**
     * Test: Required input has aria-required
     * Ensures assistive technologies announce required fields
     */
    it("has aria-required when required prop is true", () => {
      render(<Input ariaLabel="Required input" required />);
      const input = screen.getByLabelText("Required input");
      expect(input).toHaveAttribute("aria-required", "true");
      expect(input).toHaveAttribute("required");
    });

    /**
     * Test: Required input has screen reader text
     * Ensures screen reader users know field is required
     */
    it("announces required field to screen readers", () => {
      render(<Input ariaLabel="Required input" required />);
      const srText = screen.getByText("Required field");
      expect(srText).toHaveClass("sr-only");
      expect(srText).toHaveAttribute("aria-live", "polite");
    });

    /**
     * Test: Disabled input has disabled attribute
     * Ensures proper disabled state for assistive technologies
     */
    it("has disabled attribute when disabled", () => {
      render(<Input ariaLabel="Disabled input" disabled />);
      const input = screen.getByLabelText("Disabled input");
      expect(input).toBeDisabled();
    });

    /**
     * Test: Disabled input has visual styling
     * Ensures visual indicator of disabled state
     */
    it("applies disabled opacity styling", () => {
      render(<Input ariaLabel="Disabled input" disabled />);
      const input = screen.getByLabelText("Disabled input");
      expect(input).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
    });
  });

  describe("Focus States", () => {
    /**
     * Test: Input can be focused
     * Ensures keyboard navigation works
     */
    it("can be focused", () => {
      render(<Input ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");

      input.focus();
      expect(input).toHaveFocus();
    });

    /**
     * Test: Input applies focus styles (blue accent ring)
     * Ensures visual focus indicator matches design system
     */
    it("applies blue accent focus ring", () => {
      render(<Input ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input).toHaveClass("focus:ring-accent", "focus:border-accent");
    });

    /**
     * Test: Input with error applies red focus ring
     * Ensures error state is maintained during focus
     */
    it("applies red focus ring when in error state", () => {
      render(<Input error="Error" ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input).toHaveClass("focus:ring-red-600", "focus:border-red-600");
    });
  });

  describe("Edge Cases", () => {
    /**
     * Test: Input forwards ref correctly
     * Ensures React.forwardRef works as expected
     */
    it("forwards ref to input element", () => {
      const ref = jest.fn();
      render(<Input ref={ref} ariaLabel="Ref input" />);
      expect(ref).toHaveBeenCalled();
    });

    /**
     * Test: Input accepts id prop
     * Ensures ID can be set for label association
     */
    it("accepts id prop", () => {
      render(<Input id="custom-id" ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input).toHaveAttribute("id", "custom-id");
    });

    /**
     * Test: Input with empty error does not show error UI
     * Ensures error handling is robust
     */
    it("does not show error message when error is empty string", () => {
      render(<Input error="" ariaLabel="Test input" />);
      const errorMessage = screen.queryByRole("alert");
      expect(errorMessage).not.toBeInTheDocument();
    });

    /**
     * Test: Input accepts additional HTML attributes
     * Ensures all input props are supported
     */
    it("forwards additional HTML attributes (name, autoComplete, etc.)", () => {
      render(
        <Input
          name="email"
          autoComplete="email"
          ariaLabel="Email input"
        />
      );
      const input = screen.getByLabelText("Email input");
      expect(input).toHaveAttribute("name", "email");
      expect(input).toHaveAttribute("autoComplete", "email");
    });
  });

  describe("Newspaper Aesthetic Compliance", () => {
    /**
     * Test: Input uses newspaper aesthetic colors
     * Ensures design system integration
     */
    it("uses design system color tokens (primary, background, accent)", () => {
      render(<Input ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input).toHaveClass("bg-background", "text-primary", "border-primary");
    });

    /**
     * Test: Input has clean border (no border radius)
     * Ensures newspaper aesthetic with sharp corners
     */
    it("has no border radius (sharp corners for newspaper aesthetic)", () => {
      render(<Input ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input).toHaveClass("rounded-none");
    });

    /**
     * Test: Input uses sans-serif font
     * Ensures typography consistency (Inter for UI elements)
     */
    it("uses sans-serif font family for UI elements", () => {
      render(<Input ariaLabel="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input).toHaveClass("font-sans");
    });
  });
});
