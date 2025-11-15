/**
 * Card Component Tests
 *
 * Comprehensive test suite for Card component with newspaper aesthetic.
 * Tests rendering, padding variants, styling, accessibility, and edge cases.
 *
 * Coverage target: >70% (AC-1.5.4)
 */

import { render, screen } from "@testing-library/react";
import { Card } from "./card";

describe("Card Component", () => {
  describe("Rendering", () => {
    /**
     * Test: Card renders with children content
     * Ensures basic rendering functionality works
     */
    it("renders with children content", () => {
      render(
        <Card>
          <h2>Card Title</h2>
          <p>Card content</p>
        </Card>
      );

      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    /**
     * Test: Card accepts custom className
     * Verifies className prop merging works correctly
     */
    it("accepts custom className", () => {
      render(
        <Card className="custom-class">
          <p>Test</p>
        </Card>
      );

      const card = screen.getByText("Test").parentElement;
      expect(card).toHaveClass("custom-class");
    });

    /**
     * Test: Card renders as div element
     * Ensures correct semantic HTML structure
     */
    it("renders as div element", () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card.tagName).toBe("DIV");
    });
  });

  describe("Padding Variants", () => {
    /**
     * Test: Small padding variant applies correct classes
     * Small = 16px padding (mobile: 12px)
     */
    it("applies small padding classes correctly", () => {
      render(
        <Card padding="sm" data-testid="card">
          Small padding
        </Card>
      );
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("p-4", "mobile:p-3");
    });

    /**
     * Test: Medium padding variant applies correct classes
     * Medium = 24px padding (mobile: 16px) - default
     */
    it("applies medium padding classes correctly", () => {
      render(
        <Card padding="md" data-testid="card">
          Medium padding
        </Card>
      );
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("p-6", "mobile:p-4");
    });

    /**
     * Test: Large padding variant applies correct classes
     * Large = 32px padding (mobile: 24px)
     */
    it("applies large padding classes correctly", () => {
      render(
        <Card padding="lg" data-testid="card">
          Large padding
        </Card>
      );
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("p-8", "mobile:p-6");
    });

    /**
     * Test: Default padding is medium
     * Ensures correct default behavior
     */
    it("uses medium padding as default", () => {
      render(<Card data-testid="card">Default</Card>);
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("p-6", "mobile:p-4");
    });
  });

  describe("Newspaper Aesthetic Styling", () => {
    /**
     * Test: Card has clean border (1px solid black)
     * Ensures newspaper aesthetic border
     */
    it("has border using primary color (black)", () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("border", "border-primary");
    });

    /**
     * Test: Card has white background
     * Ensures clean canvas background
     */
    it("has white background", () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("bg-background");
    });

    /**
     * Test: Card has no border radius (sharp corners)
     * Ensures newspaper aesthetic with clean lines
     */
    it("has no border radius (sharp corners for newspaper aesthetic)", () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("rounded-none");
    });
  });

  describe("Responsive Behavior", () => {
    /**
     * Test: Card has responsive padding classes
     * Ensures mobile-first responsive design
     */
    it("has responsive padding that adjusts on mobile", () => {
      const { rerender } = render(
        <Card padding="sm" data-testid="card">
          Small
        </Card>
      );
      let card = screen.getByTestId("card");
      expect(card).toHaveClass("mobile:p-3");

      rerender(
        <Card padding="md" data-testid="card">
          Medium
        </Card>
      );
      card = screen.getByTestId("card");
      expect(card).toHaveClass("mobile:p-4");

      rerender(
        <Card padding="lg" data-testid="card">
          Large
        </Card>
      );
      card = screen.getByTestId("card");
      expect(card).toHaveClass("mobile:p-6");
    });
  });

  describe("Accessibility", () => {
    /**
     * Test: Card is a semantic div element
     * Ensures proper HTML structure
     */
    it("uses semantic div element", () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card.tagName).toBe("DIV");
    });

    /**
     * Test: Card accepts ARIA attributes
     * Ensures accessibility attributes can be passed through
     */
    it("accepts ARIA attributes", () => {
      render(
        <Card aria-label="Information card" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId("card");
      expect(card).toHaveAttribute("aria-label", "Information card");
    });

    /**
     * Test: Card forwards additional HTML attributes
     * Ensures all div props are supported
     */
    it("forwards additional HTML attributes (role, id, etc.)", () => {
      render(
        <Card role="region" id="test-card" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId("card");
      expect(card).toHaveAttribute("role", "region");
      expect(card).toHaveAttribute("id", "test-card");
    });
  });

  describe("Edge Cases", () => {
    /**
     * Test: Card with complex nested children
     * Ensures component handles complex content gracefully
     */
    it("renders with complex nested children", () => {
      render(
        <Card>
          <div>
            <h1>Title</h1>
            <p>Paragraph</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </Card>
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Paragraph")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    /**
     * Test: Card forwards ref correctly
     * Ensures React.forwardRef works as expected
     */
    it("forwards ref to div element", () => {
      const ref = jest.fn();
      render(<Card ref={ref}>Ref Card</Card>);
      expect(ref).toHaveBeenCalled();
    });

    /**
     * Test: Card combines padding and custom className
     * Ensures class merging works correctly with cn() utility
     */
    it("combines padding variant and custom className", () => {
      render(
        <Card padding="lg" className="shadow-lg" data-testid="card">
          Combined
        </Card>
      );
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("p-8"); // padding variant
      expect(card).toHaveClass("shadow-lg"); // custom class
    });

    /**
     * Test: Card with only text content
     * Ensures component handles simple text children
     */
    it("renders with plain text content", () => {
      render(<Card>Plain text content</Card>);
      expect(screen.getByText("Plain text content")).toBeInTheDocument();
    });
  });

  describe("Design System Integration", () => {
    /**
     * Test: Card uses design system color tokens
     * Ensures integration with newspaper aesthetic design tokens
     */
    it("uses design system color tokens (background, primary)", () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("bg-background", "border-primary");
    });

    /**
     * Test: Card padding follows 8px grid system
     * Ensures spacing consistency with design system
     */
    it("follows 8px grid system for padding", () => {
      const { rerender } = render(
        <Card padding="sm" data-testid="card">
          Small
        </Card>
      );
      let card = screen.getByTestId("card");
      expect(card).toHaveClass("p-4"); // 16px = 2 * 8px

      rerender(
        <Card padding="md" data-testid="card">
          Medium
        </Card>
      );
      card = screen.getByTestId("card");
      expect(card).toHaveClass("p-6"); // 24px = 3 * 8px

      rerender(
        <Card padding="lg" data-testid="card">
          Large
        </Card>
      );
      card = screen.getByTestId("card");
      expect(card).toHaveClass("p-8"); // 32px = 4 * 8px
    });
  });
});
