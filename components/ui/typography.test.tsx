/**
 * Typography Component Tests
 *
 * Comprehensive test suite for Typography component with newspaper aesthetic.
 * Tests rendering, variants, semantic HTML, responsive behavior, and edge cases.
 *
 * Coverage target: >70% (AC-1.5.4)
 */

import { render, screen } from "@testing-library/react";
import { Typography } from "./typography";

describe("Typography Component", () => {
  describe("Rendering", () => {
    /**
     * Test: Typography renders with children
     * Ensures basic rendering functionality works
     */
    it("renders with children text", () => {
      render(<Typography variant="body">Test content</Typography>);
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    /**
     * Test: Typography accepts custom className
     * Verifies className prop merging works correctly
     */
    it("accepts custom className", () => {
      render(<Typography variant="body" className="custom-class">Test</Typography>);
      const element = screen.getByText("Test");
      expect(element).toHaveClass("custom-class");
    });
  });

  describe("Heading Variants (Serif)", () => {
    /**
     * Test: H1 variant applies correct styles
     * H1 = Serif font, 48px (5xl), bold, black
     */
    it("applies h1 variant styles correctly", () => {
      render(<Typography variant="h1">H1 Heading</Typography>);
      const heading = screen.getByText("H1 Heading");
      expect(heading).toHaveClass("font-serif", "text-5xl", "font-bold", "text-primary");
    });

    /**
     * Test: H2 variant applies correct styles
     * H2 = Serif font, 32px (3xl), bold, black
     */
    it("applies h2 variant styles correctly", () => {
      render(<Typography variant="h2">H2 Heading</Typography>);
      const heading = screen.getByText("H2 Heading");
      expect(heading).toHaveClass("font-serif", "text-3xl", "font-bold", "text-primary");
    });

    /**
     * Test: H3 variant applies correct styles
     * H3 = Serif font, 24px (2xl), semibold, black
     */
    it("applies h3 variant styles correctly", () => {
      render(<Typography variant="h3">H3 Heading</Typography>);
      const heading = screen.getByText("H3 Heading");
      expect(heading).toHaveClass("font-serif", "text-2xl", "font-semibold", "text-primary");
    });
  });

  describe("Text Variants (Sans-serif)", () => {
    /**
     * Test: Body variant applies correct styles
     * Body = Sans-serif font, 16px (base), normal, black
     */
    it("applies body variant styles correctly", () => {
      render(<Typography variant="body">Body text</Typography>);
      const text = screen.getByText("Body text");
      expect(text).toHaveClass("font-sans", "text-base", "font-normal", "text-primary");
    });

    /**
     * Test: Caption variant applies correct styles
     * Caption = Sans-serif font, 14px (sm), normal, gray
     */
    it("applies caption variant styles correctly", () => {
      render(<Typography variant="caption">Caption text</Typography>);
      const caption = screen.getByText("Caption text");
      expect(caption).toHaveClass("font-sans", "text-sm", "font-normal", "text-neutral");
    });
  });

  describe("Semantic HTML (Default Elements)", () => {
    /**
     * Test: H1 variant renders as h1 element by default
     * Ensures correct semantic HTML
     */
    it("renders h1 variant as <h1> element by default", () => {
      render(<Typography variant="h1">Heading 1</Typography>);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H1");
    });

    /**
     * Test: H2 variant renders as h2 element by default
     * Ensures correct semantic HTML
     */
    it("renders h2 variant as <h2> element by default", () => {
      render(<Typography variant="h2">Heading 2</Typography>);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H2");
    });

    /**
     * Test: H3 variant renders as h3 element by default
     * Ensures correct semantic HTML
     */
    it("renders h3 variant as <h3> element by default", () => {
      render(<Typography variant="h3">Heading 3</Typography>);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H3");
    });

    /**
     * Test: Body variant renders as p element by default
     * Ensures correct semantic HTML for body text
     */
    it("renders body variant as <p> element by default", () => {
      render(<Typography variant="body">Paragraph</Typography>);
      const paragraph = screen.getByText("Paragraph");
      expect(paragraph.tagName).toBe("P");
    });

    /**
     * Test: Caption variant renders as p element by default
     * Ensures correct semantic HTML for captions
     */
    it("renders caption variant as <p> element by default", () => {
      render(<Typography variant="caption">Caption</Typography>);
      const caption = screen.getByText("Caption");
      expect(caption.tagName).toBe("P");
    });
  });

  describe("Polymorphic Behavior ('as' Prop)", () => {
    /**
     * Test: Typography renders as specified element via 'as' prop
     * Allows semantic HTML override (e.g., h1 styled as h2)
     */
    it("renders as h1 when as='h1' is specified", () => {
      render(<Typography variant="body" as="h1">Styled as body, semantic h1</Typography>);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H1");
    });

    /**
     * Test: Typography can render as span
     * Useful for inline typography
     */
    it("renders as span when as='span' is specified", () => {
      render(<Typography variant="caption" as="span">Inline caption</Typography>);
      const span = screen.getByText("Inline caption");
      expect(span.tagName).toBe("SPAN");
    });

    /**
     * Test: 'as' prop overrides default element but keeps variant styles
     * Ensures styles are independent of semantic element
     */
    it("preserves variant styles when 'as' prop overrides element", () => {
      render(<Typography variant="h2" as="p">P element styled as H2</Typography>);
      const element = screen.getByText("P element styled as H2");
      expect(element.tagName).toBe("P");
      expect(element).toHaveClass("font-serif", "text-3xl", "font-bold");
    });
  });

  describe("Responsive Behavior", () => {
    /**
     * Test: H1 has responsive font scaling
     * H1: 48px (5xl) → 36px (4xl) on mobile
     */
    it("has responsive font scaling for h1 (mobile:text-4xl)", () => {
      render(<Typography variant="h1">Responsive H1</Typography>);
      const heading = screen.getByText("Responsive H1");
      expect(heading).toHaveClass("mobile:text-4xl");
    });

    /**
     * Test: H2 has responsive font scaling
     * H2: 32px (3xl) → 24px (2xl) on mobile
     */
    it("has responsive font scaling for h2 (mobile:text-2xl)", () => {
      render(<Typography variant="h2">Responsive H2</Typography>);
      const heading = screen.getByText("Responsive H2");
      expect(heading).toHaveClass("mobile:text-2xl");
    });

    /**
     * Test: H3 has responsive font scaling
     * H3: 24px (2xl) → 20px (xl) on mobile
     */
    it("has responsive font scaling for h3 (mobile:text-xl)", () => {
      render(<Typography variant="h3">Responsive H3</Typography>);
      const heading = screen.getByText("Responsive H3");
      expect(heading).toHaveClass("mobile:text-xl");
    });

    /**
     * Test: Body maintains consistent size on mobile
     * Body text stays at 16px across all breakpoints
     */
    it("maintains consistent font size for body on mobile", () => {
      render(<Typography variant="body">Responsive body</Typography>);
      const text = screen.getByText("Responsive body");
      expect(text).toHaveClass("text-base", "mobile:text-base");
    });

    /**
     * Test: Caption has responsive font scaling
     * Caption: 14px (sm) → 12px (xs) on mobile
     */
    it("has responsive font scaling for caption (mobile:text-xs)", () => {
      render(<Typography variant="caption">Responsive caption</Typography>);
      const caption = screen.getByText("Responsive caption");
      expect(caption).toHaveClass("mobile:text-xs");
    });
  });

  describe("Edge Cases", () => {
    /**
     * Test: Typography forwards ref correctly
     * Ensures React.forwardRef works as expected
     */
    it("forwards ref to HTML element", () => {
      const ref = jest.fn();
      render(<Typography ref={ref} variant="body">Ref test</Typography>);
      expect(ref).toHaveBeenCalled();
    });

    /**
     * Test: Typography with complex nested children
     * Ensures component handles complex content gracefully
     */
    it("renders with complex nested children", () => {
      render(
        <Typography variant="body">
          <strong>Bold</strong> and <em>italic</em> text
        </Typography>
      );
      expect(screen.getByText("Bold")).toBeInTheDocument();
      expect(screen.getByText("italic")).toBeInTheDocument();
    });

    /**
     * Test: Typography combines variant and custom className
     * Ensures class merging works correctly with cn() utility
     */
    it("combines variant styles with custom className", () => {
      render(<Typography variant="h1" className="underline">Combined</Typography>);
      const heading = screen.getByText("Combined");
      expect(heading).toHaveClass("font-serif", "text-5xl"); // variant
      expect(heading).toHaveClass("underline"); // custom
    });
  });

  describe("Newspaper Aesthetic Compliance", () => {
    /**
     * Test: Headings use serif font family
     * Ensures Merriweather (newspaper style) for headers
     */
    it("uses serif font for heading variants (h1, h2, h3)", () => {
      const { rerender } = render(<Typography variant="h1">H1</Typography>);
      let heading = screen.getByText("H1");
      expect(heading).toHaveClass("font-serif");

      rerender(<Typography variant="h2">H2</Typography>);
      heading = screen.getByText("H2");
      expect(heading).toHaveClass("font-serif");

      rerender(<Typography variant="h3">H3</Typography>);
      heading = screen.getByText("H3");
      expect(heading).toHaveClass("font-serif");
    });

    /**
     * Test: Body and caption use sans-serif font family
     * Ensures Inter (readable on screens) for UI elements
     */
    it("uses sans-serif font for text variants (body, caption)", () => {
      const { rerender } = render(<Typography variant="body">Body</Typography>);
      let text = screen.getByText("Body");
      expect(text).toHaveClass("font-sans");

      rerender(<Typography variant="caption">Caption</Typography>);
      text = screen.getByText("Caption");
      expect(text).toHaveClass("font-sans");
    });

    /**
     * Test: Typography uses black text color (primary)
     * Ensures high contrast newspaper aesthetic
     */
    it("uses primary (black) text color for headings and body", () => {
      const { rerender } = render(<Typography variant="h1">H1</Typography>);
      let element = screen.getByText("H1");
      expect(element).toHaveClass("text-primary");

      rerender(<Typography variant="body">Body</Typography>);
      element = screen.getByText("Body");
      expect(element).toHaveClass("text-primary");
    });

    /**
     * Test: Caption uses neutral (gray) text color
     * Ensures secondary text styling for captions
     */
    it("uses neutral (gray) text color for captions", () => {
      render(<Typography variant="caption">Caption</Typography>);
      const caption = screen.getByText("Caption");
      expect(caption).toHaveClass("text-neutral");
    });
  });

  describe("Font Size Scale", () => {
    /**
     * Test: Typography follows design system font scale
     * H1: 5xl (48px), H2: 3xl (32px), H3: 2xl (24px), Body: base (16px), Caption: sm (14px)
     */
    it("follows design system typography scale", () => {
      const { rerender } = render(<Typography variant="h1">H1</Typography>);
      let element = screen.getByText("H1");
      expect(element).toHaveClass("text-5xl");

      rerender(<Typography variant="h2">H2</Typography>);
      element = screen.getByText("H2");
      expect(element).toHaveClass("text-3xl");

      rerender(<Typography variant="h3">H3</Typography>);
      element = screen.getByText("H3");
      expect(element).toHaveClass("text-2xl");

      rerender(<Typography variant="body">Body</Typography>);
      element = screen.getByText("Body");
      expect(element).toHaveClass("text-base");

      rerender(<Typography variant="caption">Caption</Typography>);
      element = screen.getByText("Caption");
      expect(element).toHaveClass("text-sm");
    });
  });
});
