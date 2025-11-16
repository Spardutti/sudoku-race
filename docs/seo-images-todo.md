# SEO Images - Creation Required

## Overview

The following social media and SEO images need to be created manually for Story 1.8. The metadata configuration is complete and references these images, but the actual image files need to be designed and placed in the `/public/` directory.

## Required Images

### 1. OpenGraph Image
- **Location**: `/public/og-image.png`
- **Dimensions**: 1200x630px
- **Format**: PNG or JPG
- **Max Size**: <200KB (for fast social sharing)
- **Purpose**: Social media preview (Facebook, LinkedIn, WhatsApp)

**Design Requirements:**
- Follow newspaper aesthetic (black/white/blue color palette)
- Include "Sudoku Daily" title prominently
- Tagline: "One authentic Sudoku puzzle daily"
- Optional: Include 3x3 Sudoku grid visual element
- Typography: Merriweather (serif) for title, Inter (sans) for tagline
- Colors: #000000 (black), #FFFFFF (white), #1a73e8 (blue accent)
- High contrast for readability

### 2. Twitter Card Image
- **Location**: `/public/twitter-card.png`
- **Dimensions**: 1200x600px
- **Format**: PNG or JPG
- **Max Size**: <200KB
- **Purpose**: Twitter share preview

**Design Requirements:**
- Similar to OpenGraph image but optimized for Twitter's 2:1 ratio
- Same design elements as OG image
- Ensure important content is centered (Twitter may crop edges)

### 3. Favicon
- **Location**: `/public/favicon.ico`
- **Format**: Multi-size ICO (32x32 + 16x16)
- **Purpose**: Browser tab icon

**Design Requirements:**
- Simple, recognizable icon
- Options:
  - Sudoku grid (3x3 small grid)
  - Letter "S" monogram in serif font
  - Newspaper fold icon
- High contrast for visibility at small sizes

**Tools for Creation:**
- [Favicon.io](https://favicon.io/) - Generate from text, image, or emoji
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Multi-platform favicon generator

### 4. Apple Touch Icon
- **Location**: `/public/apple-icon.png`
- **Dimensions**: 180x180px
- **Format**: PNG
- **Purpose**: iOS "Add to Home Screen" icon

**Design Requirements:**
- Same design as favicon but at higher resolution
- No transparency (use white background)
- Rounded corners applied automatically by iOS
- Padding: 10-20px around the icon for safety

### 5. Logo (High-Resolution)
- **Location**: `/public/logo.png`
- **Dimensions**: 512x512px
- **Format**: PNG with transparency
- **Purpose**: Structured data, high-quality logo reference

**Design Requirements:**
- Main "Sudoku Daily" logo
- Transparent background
- Black text with newspaper aesthetic
- Clean, vector-quality rendering

## Design Tools

### Option 1: Figma (Recommended)
1. Create new Figma file with frames for each image size
2. Use Merriweather and Inter fonts (Google Fonts)
3. Apply newspaper aesthetic (black/white/blue palette)
4. Export as PNG at correct dimensions
5. Optimize with ImageOptim or TinyPNG

### Option 2: Canva
1. Use custom dimensions for each image type
2. Search for "newspaper" templates or start from scratch
3. Use clean, minimal design with high contrast
4. Download as PNG
5. Resize to exact dimensions if needed

### Option 3: Photoshop / GIMP
1. Create new document with exact dimensions
2. Design with newspaper aesthetic guidelines
3. Export as PNG (optimize for web)

### Option 4: Code-Based (Future)
Consider dynamic generation in Epic 5 using Next.js `ImageResponse`:
```typescript
// app/api/og/route.tsx
import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Merriweather"
      }}>
        <h1 style={{ fontSize: 80 }}>Sudoku Daily</h1>
        <p style={{ fontSize: 32 }}>One authentic puzzle daily</p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

## Optimization

After creating images, optimize for web:

**PNG Optimization:**
- [TinyPNG](https://tinypng.com/) - Online compression
- [ImageOptim](https://imageoptim.com/) - Mac app for compression
- [Squoosh](https://squoosh.app/) - Google's image optimizer

**Target Sizes:**
- OpenGraph: <200KB (ideally <100KB)
- Twitter Card: <200KB (ideally <100KB)
- Favicon: <50KB
- Apple Icon: <100KB
- Logo: <200KB

## Testing

After creating images:

1. **Visual Verification:**
   - Place images in `/public/` directory
   - Run `npm run dev`
   - Check browser tab for favicon
   - View page source to verify image paths

2. **Social Media Testing:**
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validnow iator)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

3. **Mobile Testing:**
   - Test "Add to Home Screen" on iOS
   - Verify Apple icon appears correctly
   - Check favicon on mobile browsers

## Placeholder Images (Temporary)

For immediate deployment, you can use text-based placeholder images:

**Quick Placeholder Creation:**
1. Visit [PlaceHolder.com](https://placeholder.com/)
2. Generate images with correct dimensions
3. Add text overlays with "Sudoku Daily"
4. Replace with professional designs later

**Example URLs:**
- OG Image: `https://via.placeholder.com/1200x630/000000/FFFFFF?text=Sudoku+Daily`
- Twitter Card: `https://via.placeholder.com/1200x600/000000/FFFFFF?text=Sudoku+Daily`

**Note:** These are temporary and should be replaced with branded images before production launch.

## Checklist

- [x] Create OpenGraph image (1200x630px) → `/public/og-image.png` ✅ **DONE** (1536x1024, needs optimization)
- [x] Create Twitter card image (1200x600px) → `/public/twitter-card.png` ✅ **DONE** (1536x1024, needs optimization)
- [x] Create favicon (32x32 + 16x16 ICO) → `/public/favicon.ico` ✅ **DONE** (needs optimization & ICO conversion)
- [ ] Create Apple touch icon (180x180px) → `/public/apple-icon.png`
- [ ] Create high-res logo (512x512px) → `/public/logo.png`
- [ ] Optimize all images (<200KB each) ⚠️ **NEEDS OPTIMIZATION** (see below)
- [ ] Test social media previews (Facebook, Twitter, LinkedIn)
- [x] Test favicon in dev environment ✅
- [x] Test Twitter card in dev environment ✅
- [ ] Test Apple icon on iOS device
- [ ] Update this checklist when complete

## ⚠️ Optimization Needed

### Current Status:
- **og-image.png**: 2.8MB (1536x1024) - ❌ Too large! Recommended: <200KB, 1200x630
- **twitter-card.png**: 2.7MB (1536x1024) - ❌ Too large! Recommended: <200KB, 1200x600
- **favicon.ico**: 989KB (1024x1024 PNG) - ❌ Should be multi-size ICO format, <50KB

### Quick Optimization Steps:

1. **Resize & Optimize OG Image:**
   ```bash
   # Using ImageMagick (if installed)
   convert public/og-image.png -resize 1200x630 -quality 85 public/og-image-optimized.png
   ```
   - Or use [TinyPNG](https://tinypng.com/) - Upload og-image.png, should reduce to ~100-200KB
   - Or use [Squoosh](https://squoosh.app/) - Drag and drop, adjust quality to ~80-85%

2. **Resize & Optimize Twitter Card:**
   ```bash
   # Using ImageMagick (if installed)
   convert public/twitter-card.png -resize 1200x600 -quality 85 public/twitter-card-optimized.png
   ```
   - Or use [TinyPNG](https://tinypng.com/) - Upload twitter-card.png
   - Or use [Squoosh](https://squoosh.app/) - Drag and drop, adjust quality to ~80-85%

3. **Convert Favicon to ICO:**
   - Use [Favicon.io](https://favicon.io/favicon-converter/) - Upload your favicon PNG
   - It will generate proper multi-size ICO file (16x16, 32x32, 48x48)
   - Should be <50KB after conversion

## References

- SEO Documentation: `docs/seo.md`
- Design Tokens: `lib/design-tokens.ts`
- Newspaper Aesthetic Colors: Black (#000000), White (#FFFFFF), Blue (#1a73e8)
- Typography: Merriweather (serif), Inter (sans-serif)
