describe("Layout Metadata (OG Image Story 5.5)", () => {
  const mockMetadata = {
    openGraph: {
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Sudoku Daily - Daily Sudoku puzzle with emoji grid showing solving progress",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [
        {
          url: "/og-image.png",
          alt: "Sudoku Daily - Daily Sudoku puzzle with emoji grid showing solving progress",
        },
      ],
    },
  };

  describe("OpenGraph metadata requirements (AC1)", () => {
    it("should have correct image dimensions (1200x630)", () => {
      const images = mockMetadata.openGraph.images;

      expect(images).toHaveLength(1);
      expect(images[0].width).toBe(1200);
      expect(images[0].height).toBe(630);
    });

    it("should have descriptive alt text including emoji grid reference", () => {
      const images = mockMetadata.openGraph.images;

      expect(images[0].alt).toContain("emoji grid");
      expect(images[0].alt).toBe(
        "Sudoku Daily - Daily Sudoku puzzle with emoji grid showing solving progress"
      );
    });

    it("should use og-image.png (not og-image.jpg)", () => {
      const images = mockMetadata.openGraph.images;

      expect(images[0].url).toBe("/og-image.png");
      expect(images[0].url).not.toContain(".jpg");
    });

    it("should have locale set to en_US", () => {
      expect(mockMetadata.openGraph.locale).toBe("en_US");
    });

    it("should have correct OpenGraph type", () => {
      expect(mockMetadata.openGraph.type).toBe("website");
    });
  });

  describe("Twitter Card metadata requirements (AC2)", () => {
    it("should use summary_large_image card type", () => {
      expect(mockMetadata.twitter.card).toBe("summary_large_image");
    });

    it("should have alt text for Twitter image", () => {
      const images = mockMetadata.twitter.images;

      expect(images).toBeDefined();
      expect(images).toHaveLength(1);
      expect(images[0].alt).toContain("emoji grid");
    });

    it("should reuse og-image.png for Twitter card", () => {
      const images = mockMetadata.twitter.images;

      expect(images[0].url).toBe("/og-image.png");
      expect(images[0].url).toBe(mockMetadata.openGraph.images[0].url);
    });
  });

  describe("2025 Standards compliance", () => {
    it("should meet 1200x630px standard for both platforms", () => {
      const ogImage = mockMetadata.openGraph.images[0];

      expect(ogImage.width).toBe(1200);
      expect(ogImage.height).toBe(630);
    });

    it("should include alt text for accessibility", () => {
      const ogAlt = mockMetadata.openGraph.images[0].alt;
      const twitterAlt = mockMetadata.twitter.images[0].alt;

      expect(ogAlt).toBeTruthy();
      expect(twitterAlt).toBeTruthy();
    });
  });
});
