import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const iconVersion = "v2";

  return {
    name: "Sudoku Race - Daily Competitive Puzzles",
    short_name: "Sudoku Race",
    description: "Solve daily Sudoku puzzles in real-time competition",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait-primary",
    icons: [
      {
        src: `/manifest192.png?${iconVersion}`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `/manifest192.png?${iconVersion}`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `/manifest512.png?${iconVersion}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `/manifest512.png?${iconVersion}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
