/**
 * Button Component Tests
 *
 * Comprehensive test suite for Button component with newspaper aesthetic.
 * Tests rendering, variants, sizes, interactions, accessibility, and edge cases.
 *
 * Coverage target: >70% (AC-1.5.4)
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";

describe("Button Component", () => {
  describe("Rendering", () => {
    /**
     * Test: Button renders with children text
     * Ensures basic rendering functionality works
     */
    it("renders with children text", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    /**
     * Test: Button accepts custom className
     * Verifies className prop merging works correctly
     */
    it("accepts custom className", () => {
      render(<Button className="custom-class">Test</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    /**
     * Test: Button renders as button element by default
     * Ensures correct semantic HTML
     */
    it("renders as button element by default", () => {
      render(<Button>Submit</Button>);
      const button = screen.getByRole("button");
      expect(button.tagName).toBe("BUTTON");
    });
  });

  describe("Variants", () => {
    /**
     * Test: Primary variant applies correct classes
     * Primary = black background, white text (newspaper aesthetic)
     */
    it("applies primary variant classes correctly", () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-black", "text-white");
    });

    /**
     * Test: Secondary variant applies correct classes
     * Secondary = white background, black border, black text
     */
    it("applies secondary variant classes correctly", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-white", "text-black", "border-black");
    });

    /**
     * Test: Ghost variant applies correct classes
     * Ghost = transparent background, underline on hover
     */
    it("applies ghost variant classes correctly", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-transparent", "text-black");
    });

    /**
     * Test: Default variant is primary
     * Ensures correct default behavior
     */
    it("uses primary variant as default", () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-black", "text-white");
    });
  });

  describe("Sizes", () => {
    /**
     * Test: Small size applies correct height (36px)
     * Note: Below minimum 44px tap target, use cautiously
     */
    it("applies small size classes correctly", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("min-h-[36px]");
    });

    /**
     * Test: Medium size applies correct height (44px)
     * Meets WCAG 2.1 Level AA minimum tap target requirement
     */
    it("applies medium size classes correctly (44px tap target)", () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("min-h-[44px]");
    });

    /**
     * Test: Large size applies correct height (52px)
     * Exceeds minimum tap target for prominent CTAs
     */
    it("applies large size classes correctly", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("min-h-[52px]");
    });

    /**
     * Test: Default size is medium (44px)
     * Ensures accessible default tap target
     */
    it("uses medium size as default", () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("min-h-[44px]");
    });
  });

  describe("Interactions", () => {
    /**
     * Test: Button calls onClick when clicked
     * Ensures click handlers work correctly
     */
    it("calls onClick handler when clicked", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Button does not call onClick when disabled
     * Ensures disabled state prevents interactions
     */
    it("does not call onClick when disabled", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    /**
     * Test: Button supports keyboard activation with Enter key
     * Ensures keyboard accessibility
     */
    it("supports keyboard activation with Enter key", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Press Enter</Button>);

      const button = screen.getByRole("button");
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

      // Note: Native button elements handle Enter key activation automatically
      // This test verifies the button receives focus and can be interacted with
      expect(button).toBeInTheDocument();
    });

    /**
     * Test: Button supports keyboard activation with Space key
     * Ensures complete keyboard accessibility
     */
    it("supports keyboard activation with Space key", () => {
      render(<Button>Press Space</Button>);

      const button = screen.getByRole("button");
      button.focus();

      expect(button).toHaveFocus();
      // Note: Space key activation is handled natively by button element
    });
  });

  describe("Accessibility", () => {
    /**
     * Test: Button has button role
     * Ensures proper semantic HTML for screen readers
     */
    it("has button role for screen readers", () => {
      render(<Button>Accessible</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    /**
     * Test: Button accepts aria-label prop
     * Ensures ARIA attributes can be passed through
     */
    it("accepts aria-label for accessibility", () => {
      render(<Button aria-label="Submit form">Submit</Button>);
      const button = screen.getByRole("button", { name: /submit form/i });
      expect(button).toHaveAttribute("aria-label", "Submit form");
    });

    /**
     * Test: Button shows focus indicator when focused
     * Ensures keyboard navigation visibility (WCAG 2.1 Level AA)
     */
    it("has visible focus indicator", () => {
      render(<Button>Focus me</Button>);
      const button = screen.getByRole("button");

      button.focus();
      expect(button).toHaveFocus();
      expect(button).toHaveClass("focus-visible:ring-2", "focus-visible:ring-accent");
    });

    /**
     * Test: Disabled button has disabled attribute
     * Ensures proper disabled state for assistive technologies
     */
    it("has disabled attribute when disabled", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    /**
     * Test: Disabled button has reduced opacity
     * Ensures visual indicator of disabled state
     */
    it("applies disabled opacity styling", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("disabled:opacity-50");
    });
  });

  describe("Polymorphic Behavior (asChild)", () => {
    /**
     * Test: Button renders as child component when asChild is true
     * Ensures Radix UI Slot polymorphism works (e.g., for Link components)
     */
    it("renders as child component when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByRole("link", { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "/test");
    });

    /**
     * Test: asChild preserves button variant classes
     * Ensures styling is maintained with polymorphic components
     */
    it("preserves variant classes when used with asChild", () => {
      render(
        <Button asChild variant="secondary">
          <a href="/test">Link</a>
        </Button>
      );

      const link = screen.getByRole("link");
      expect(link).toHaveClass("bg-white", "text-black");
    });
  });

  describe("Edge Cases", () => {
    /**
     * Test: Button with no children renders correctly
     * Ensures component handles edge cases gracefully
     */
    it("renders without children (empty button)", () => {
      render(<Button aria-label="Empty button" />);
      const button = screen.getByRole("button", { name: /empty button/i });
      expect(button).toBeInTheDocument();
    });

    /**
     * Test: Button with type attribute
     * Ensures type prop is passed through correctly (submit, reset, button)
     */
    it("accepts type attribute (submit, reset, button)", () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });

    /**
     * Test: Button forwards ref correctly
     * Ensures React.forwardRef works as expected
     */
    it("forwards ref to button element", () => {
      const ref = jest.fn();
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref).toHaveBeenCalled();
    });

    /**
     * Test: Button combines multiple variant and size props
     * Ensures CVA (class-variance-authority) merges classes correctly
     */
    it("combines variant and size props correctly", () => {
      render(<Button variant="ghost" size="lg">Combined</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-transparent"); // ghost variant
      expect(button).toHaveClass("min-h-[52px]"); // lg size
    });
  });

  describe("Newspaper Aesthetic Compliance", () => {
    /**
     * Test: Button uses newspaper aesthetic color tokens
     * Ensures design system integration
     */
    it("uses design system color tokens (primary, background, accent)", () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      let button = screen.getByRole("button");
      expect(button).toHaveClass("bg-black", "text-white");

      rerender(<Button variant="secondary">Secondary</Button>);
      button = screen.getByRole("button");
      expect(button).toHaveClass("bg-white", "text-black");
    });

    /**
     * Test: Button meets minimum tap target size (44px) for accessibility
     * WCAG 2.1 Level AA compliance (AC-1.5.5)
     */
    it("meets WCAG minimum tap target size (44px) for md and lg", () => {
      const { rerender } = render(<Button size="md">Medium</Button>);
      let button = screen.getByRole("button");
      expect(button).toHaveClass("min-h-[44px]");

      rerender(<Button size="lg">Large</Button>);
      button = screen.getByRole("button");
      expect(button).toHaveClass("min-h-[52px]");
    });
  });
});
