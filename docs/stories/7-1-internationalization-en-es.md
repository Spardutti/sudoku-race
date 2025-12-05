# Story 7.1: Internationalization (EN/ES) with Auto-Detection

**Story ID**: 7.1
**Epic**: Epic 7 - Internationalization & Localization (NEW)
**Story Key**: 7-1-internationalization-en-es
**Status**: ready-for-dev
**Created**: 2025-12-04

---

## User Story Statement

**As a** user
**I want** the app in my preferred language (English or Spanish)
**So that** I can understand and use the app in my native language

**Value**: Expands market reach to Spanish-speaking users (~500M people). Auto-detection provides seamless UX while language switcher gives user control.

---

## Requirements Context

### User Requirements

**Languages:** EN (default), ES (initial international)
**Auto-Detection:** Browser language → Cookie → Visible switcher
**Scope:** UI text, metadata, dates, errors, toasts

### Architecture

**Library: next-intl** (931K weekly downloads, Next.js App Router optimized)
- TypeScript autocomplete for message keys
- ICU syntax (plurals, interpolation)
- Server-side rendering support

**Why not i18next?** Better for Pages Router, next-intl cleaner for App Router

**Detection Order:**
1. Cookie (`NEXT_LOCALE`)
2. Accept-Language header (server-side)
3. navigator.language (fallback)
4. Default: EN

**URL Structure:** `/en/puzzle`, `/es/leaderboard` (CDN-friendly, SEO-optimized)

### Dependencies

None (new epic)

---

## Acceptance Criteria

### AC1: Library Setup
- ✅ next-intl installed, configured
- ✅ Locales: `['en', 'es']`, default: `'en'`
- ✅ Messages: `/messages/en.json`, `/messages/es.json`
- ✅ TypeScript types for message keys

### AC2: Auto-Detection
- ✅ Check Accept-Language header
- ✅ Set `NEXT_LOCALE` cookie
- ✅ Redirect to locale path
- ✅ Unsupported → fallback EN

### AC3: URL Structure
- ✅ URLs: `/en/puzzle`, `/es/leaderboard`
- ✅ Root `/` → redirect to detected locale
- ✅ hreflang tags for SEO

### AC4: Language Switcher
- ✅ Dropdown in header: EN | ES
- ✅ Current highlighted
- ✅ Preserves route
- ✅ Updates cookie
- ✅ Accessible

### AC5: UI Translation
- ✅ All text translated (buttons, labels, messages)
- ✅ Puzzle, leaderboard, profile, auth pages

### AC6: Metadata (SEO)
- ✅ Titles, descriptions translated
- ✅ OpenGraph, Twitter cards per locale

### AC7: Date/Time
- ✅ Spanish calendar months
- ✅ Consistent time format (MM:SS universal)

### AC8: Errors & Toasts
- ✅ All messages translated
- ✅ Fallback to EN if missing

### AC9: Persistence
- ✅ Cookie persists choice
- ✅ Works across sessions

### AC10: TypeScript
- ✅ Autocomplete message keys
- ✅ Compile error if key missing

---

## Tasks / Subtasks

### Task 1: Install & Config (AC1)
- [ ] `npm install next-intl`
- [ ] Create `i18n.ts`, `/messages/en.json`, `/messages/es.json`
- [ ] Configure locales

**Files**: `package.json`, `i18n.ts`, `/messages/*.json`

### Task 2: Middleware (AC2,3)
- [ ] Create `middleware.ts`
- [ ] Configure detection (Accept-Language → cookie)
- [ ] Set locale URL prefix

**File**: `middleware.ts`

### Task 3: Restructure App Router (AC3)
- [ ] Move `/app` to `/app/[locale]`
- [ ] Update all routes
- [ ] Update layout for locale param

**Files**: Restructure `/app`

### Task 4: Translation Provider (AC1)
- [ ] Create `[locale]/layout.tsx` with NextIntlClientProvider
- [ ] Load messages server-side

**File**: `app/[locale]/layout.tsx`

### Task 5: English Translations (AC5)
- [ ] Extract all hardcoded strings
- [ ] Create structured JSON: common, puzzle, leaderboard, profile, auth, errors
- [ ] ~100-150 keys

**File**: `/messages/en.json`

### Task 6: Spanish Translations (AC5)
- [ ] Professional translation (not machine)
- [ ] Native speaker review
- [ ] Competitive, clean tone

**File**: `/messages/es.json`

### Task 7: Language Switcher (AC4)
- [ ] Create `LanguageSwitcher.tsx`
- [ ] Dropdown, highlight current
- [ ] Update cookie, preserve route
- [ ] Accessible

**File**: `components/layout/LanguageSwitcher.tsx`

### Task 8: Update Header (AC4)
- [ ] Add switcher to header
- [ ] Mobile + desktop

**File**: `components/layout/Header.tsx`

### Task 9: Replace Strings (AC5,8)
- [ ] Update all components: `useTranslations()` hook
- [ ] ~80 components
- [ ] Test EN + ES

**Files**: All components with text

### Task 10: Translate Metadata (AC6)
- [ ] Update metadata in `page.tsx` files
- [ ] Use `getTranslations()` server-side
- [ ] Add hreflang tags

**Files**: All `page.tsx`

### Task 11: Date/Time (AC7)
- [ ] Use next-intl date formatting
- [ ] Spanish calendar months

**Files**: Timer, calendar components

### Task 12: Update Tests (AC10)
- [ ] Wrap tests with mock IntlProvider
- [ ] Test EN + ES rendering
- [ ] ≥80% coverage

**Files**: All `*.test.tsx`

### Task 13: TypeScript (AC10)
- [ ] Generate types: `npx next-intl generate-types`
- [ ] Test autocomplete

**File**: `tsconfig.json`, `next-intl.d.ts`

### Task 14: Documentation
- [ ] Update `docs/architecture.md`
- [ ] Create `docs/i18n-guide.md`: how to add languages

**Files**: Architecture docs, i18n guide

### Task 15: Manual Testing (All ACs)
- [ ] Auto-detection, switcher, all pages EN+ES, persistence, SEO, mobile+desktop, accessibility

---

## Definition of Done

### Code Quality
- [ ] TypeScript strict, ESLint passes, files <200 LOC

### Testing
- [ ] Tests passing, ≥80% coverage, both locales render

### Functionality
- [ ] Auto-detection, switcher, translations, metadata, persistence work

### UX
- [ ] Switcher accessible, translations accurate, no layout shifts

### Documentation
- [ ] i18n guide created, architecture updated

---

## Dev Notes

### Implementation Order
1. Setup (Tasks 1-4) → 2. English (Task 5) → 3. Spanish (Task 6) → 4. Integration (Tasks 7-11) → 5. TypeScript (Task 13) → 6. Testing (Tasks 12,15) → 7. Docs (Task 14)

### File Structure
```
/app/[locale]/
  layout.tsx
  page.tsx
  puzzle/page.tsx
  leaderboard/page.tsx
  profile/page.tsx

/messages/
  en.json
  es.json

middleware.ts
```

### Message Structure (en.json)
```json
{
  "common": { "submit": "Submit", "cancel": "Cancel" },
  "puzzle": { "title": "Today's Puzzle", "timer": "Time" },
  "leaderboard": { "title": "Global Leaderboard", "rank": "Rank" },
  "auth": { "signIn": "Sign in with Google" },
  "errors": { "network": "Network error. Please try again." }
}
```

### Usage Patterns

**Client:**
```tsx
import { useTranslations } from 'next-intl';
const t = useTranslations('puzzle');
return <button>{t('submit')}</button>;
```

**Server:**
```tsx
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('puzzle');
return <h1>{t('title')}</h1>;
```

**Metadata:**
```tsx
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('title'), description: t('description') };
}
```

### Middleware Config
```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/', '/(en|es)/:path*']
};
```

### Spanish Translations
- Submit → Enviar, Clear → Borrar, Time → Tiempo
- Rank → Rango, Player → Jugador, Daily → Diario
- Profile → Perfil, Sign In → Iniciar sesión
- Keep competitive, clean tone

### SEO
```html
<link rel="alternate" hreflang="en" href="https://sudokurace.com/en/puzzle" />
<link rel="alternate" hreflang="es" href="https://sudokurace.com/es/puzzle" />
<link rel="alternate" hreflang="x-default" href="https://sudokurace.com/en/puzzle" />
```

### Future Languages
To add French:
1. Add `'fr'` to locales
2. Create `/messages/fr.json`
3. Translate keys
4. Add to switcher
5. Test

Effort: ~8-12 hours per language

### Performance
- Bundle: ~10KB (next-intl) + ~5-8KB per locale
- Messages loaded server-side (no client bloat)
- Only active locale per request

### Testing
```tsx
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';

test('renders with translation', () => {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Component />
    </NextIntlClientProvider>
  );
});
```

### References
- [next-intl docs](https://next-intl.dev/)
- [Browser detection guide](https://portalzine.de/detect-browser-language/)
- [Why next-intl](https://medium.com/@isurusasanga1999/why-i-chose-next-intl-for-internationalization-in-my-next-js-66c9e49dd486)
- [Accept-Language MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language)

---

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-5-20250929

### Change Log
- **2025-12-04**: Story created. EN/ES with next-intl, auto-detection, scalable for future languages. Status: ready-for-dev.
