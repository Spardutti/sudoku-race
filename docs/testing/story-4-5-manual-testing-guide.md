# Story 4.5 Manual Testing Guide

**Story:** Leaderboard Sharing & Social Proof
**Date:** 2025-11-30
**Purpose:** Integration and accessibility testing checklist for Tasks 14-15

---

## Task 14: Integration Testing Checklist

### Twitter/X Share Flow

**Test Steps:**
1. Navigate to `/leaderboard` as authenticated user with a completion
2. Locate personal rank row (or footer if rank >100)
3. Click "Share Rank" button
4. Click "Share on Twitter" button
5. Verify Twitter Web Intent opens in new tab with pre-filled text
6. Check share text format: `I ranked #X on Sudoku Daily #Y! ⏱️ MM:SS. [encouragement] [url]`
7. Verify UTM parameter: `?utm_source=share&utm_medium=twitter`
8. Close Twitter tab without posting
9. Test popup blocker scenario: Enable popup blocker → verify clipboard fallback (no error)

**Expected Results:**
- ✅ Twitter intent opens: `https://twitter.com/intent/tweet?text=...`
- ✅ Share text URL-encoded properly (no broken characters)
- ✅ Encouragement phrase rotates (test 3 consecutive shares)
- ✅ If popup blocked: text copied to clipboard, user sees no error

**Database Verification:**
```sql
-- Run after sharing
SELECT * FROM share_events
WHERE channel = 'twitter'
ORDER BY created_at DESC
LIMIT 1;

-- Should show: user_id, puzzle_id, channel='twitter', rank_at_share, created_at
```

---

### WhatsApp Share Flow

**Test Steps - Mobile (iOS Safari / Android Chrome):**
1. Open `/leaderboard` on mobile device as authenticated user
2. Click "Share Rank" → "Share on WhatsApp"
3. Verify WhatsApp app opens (not web)
4. Check URL format: `whatsapp://send?text=...`
5. Verify share text appears in WhatsApp composer
6. Close WhatsApp without sending

**Test Steps - Desktop:**
1. Open `/leaderboard` on desktop browser
2. Click "Share Rank" → "Share on WhatsApp"
3. Verify WhatsApp Web opens in new tab
4. Check URL format: `https://wa.me/?text=...`
5. Verify share text appears in composer

**Expected Results:**
- ✅ Mobile: WhatsApp app opens via `whatsapp://` protocol
- ✅ Desktop: WhatsApp Web opens via `https://wa.me/`
- ✅ Share text pre-filled correctly
- ✅ UTM parameter: `utm_medium=whatsapp`

**Database Verification:**
```sql
SELECT * FROM share_events
WHERE channel = 'whatsapp'
ORDER BY created_at DESC
LIMIT 1;
```

---

### Clipboard Copy Flow

**Test Steps:**
1. Click "Share Rank" → "Copy Link"
2. Verify green success toast appears: "Copied to clipboard!"
3. Paste into text editor (Ctrl+V / Cmd+V)
4. Verify share text format matches expected
5. Verify UTM parameter: `utm_medium=clipboard`

**Fallback Test (execCommand):**
1. Open DevTools Console
2. Run: `delete navigator.clipboard` (temporarily disable Clipboard API)
3. Click "Copy Link"
4. Verify fallback works (toast appears, text copied)

**Error Case:**
1. Simulate failure: Mock `navigator.clipboard.writeText` to reject
2. Verify error toast: "Could not copy. Try again."

**Expected Results:**
- ✅ Success toast shows for 2 seconds
- ✅ Text copied correctly
- ✅ Fallback to execCommand works when Clipboard API unavailable
- ✅ Error toast shows on failure

**Database Verification:**
```sql
SELECT * FROM share_events
WHERE channel = 'clipboard'
ORDER BY created_at DESC
LIMIT 1;
```

---

### Guest User Flow

**Test Steps:**
1. Open `/leaderboard` in incognito/private window (guest mode)
2. Complete a puzzle (guest completion tracked locally)
3. Navigate to leaderboard
4. Locate "Share Rank" button (should appear if guest has hypothetical rank)
5. Click "Share Rank" button
6. Verify popover shows "Sign in to Share" prompt (NOT share options)
7. Verify message: "Create an account to share your rank and compete on the leaderboard."
8. Click "Sign In" button
9. Verify redirect to `/auth/login` (or OAuth flow)

**Expected Results:**
- ✅ Guest sees "Share Rank" button (same as auth users)
- ✅ Popover shows sign-in prompt (NOT share preview)
- ✅ No share handlers called for guests
- ✅ Sign In button redirects to auth

**Database Verification:**
```sql
-- Should be NO new share_events for guest actions
SELECT COUNT(*) FROM share_events
WHERE created_at > NOW() - INTERVAL '5 minutes';
-- Should match pre-test count (no increase)
```

---

### Cross-Browser Testing

**Browsers to Test:**
- ✅ Chrome (desktop + Android)
- ✅ Firefox (desktop)
- ✅ Safari (desktop + iOS)
- ✅ Edge (desktop)

**Devices:**
- ✅ Desktop (1920x1080)
- ✅ Mobile (375x667, 414x896)
- ✅ Tablet (768x1024)

---

## Task 15: Accessibility Testing Checklist

### Keyboard Navigation

**Test Steps:**
1. Navigate to leaderboard page
2. Press Tab repeatedly until "Share Rank" button focused
3. Verify visible focus indicator (outline/ring)
4. Press Enter to open popover
5. Press Tab to cycle through share buttons (Twitter → WhatsApp → Copy)
6. Verify focus trap: Tab cycles within popover (doesn't escape)
7. Press Escape key
8. Verify popover closes and focus returns to trigger button

**Expected Results:**
- ✅ All interactive elements keyboard accessible
- ✅ Focus indicators visible (WCAG 2.4.7)
- ✅ Focus trap works in popover
- ✅ Escape key closes popover
- ✅ Focus restored to trigger after close

---

### ARIA Labels & Screen Reader

**Test with VoiceOver (Mac) or NVDA (Windows):**

1. Navigate to "Share Rank" button
   - Expected announcement: "Share your rank, button"

2. Activate button (Enter)
   - Expected: Popover opens, screen reader announces content

3. Navigate through popover buttons:
   - Twitter: "Share on Twitter, button"
   - WhatsApp: "Share on WhatsApp, button"
   - Copy: "Copy to clipboard, button"

4. Test guest flow:
   - Expected: "Sign in to Share, heading level 3"
   - Expected: "Create an account to share..." (description read)
   - Expected: "Sign in to share your rank, button"

**Expected Results:**
- ✅ All buttons have accessible names (aria-label)
- ✅ Popover content announced correctly
- ✅ Icons have `aria-hidden="true"` (not read separately)
- ✅ No "clickable div" or unlabeled controls

---

### axe DevTools Audit

**Steps:**
1. Install axe DevTools browser extension
2. Open `/leaderboard` page
3. Run automated scan
4. Review violations (should be 0 critical)
5. Fix any issues found
6. Re-scan to confirm

**Expected Results:**
- ✅ 0 critical violations
- ✅ 0 serious violations
- ✅ Color contrast meets WCAG AA (4.5:1 for text)
- ✅ All interactive elements have accessible names

---

### Lighthouse Accessibility Audit

**Steps:**
1. Open Chrome DevTools → Lighthouse tab
2. Select "Accessibility" category
3. Click "Analyze page load"
4. Review score (target: ≥90)

**Expected Results:**
- ✅ Accessibility score: ≥90
- ✅ No major issues (contrast, ARIA, keyboard)
- ✅ Proper heading hierarchy
- ✅ Form elements have labels

**Common Issues to Check:**
- Color contrast (text/background)
- Focus indicators visible
- ARIA attributes valid
- Interactive elements keyboard accessible

---

### Mobile Accessibility

**Test on iOS VoiceOver:**
1. Enable VoiceOver (Settings → Accessibility)
2. Navigate to leaderboard
3. Swipe to "Share Rank" button
4. Double-tap to activate
5. Verify popover announced
6. Test all share options

**Test on Android TalkBack:**
1. Enable TalkBack (Settings → Accessibility)
2. Same steps as iOS
3. Verify gestures work (swipe, double-tap)

---

## Testing Status

### Task 14: Integration Testing
- [ ] Twitter share (desktop)
- [ ] Twitter share (mobile)
- [ ] Twitter popup blocker fallback
- [ ] WhatsApp share (mobile)
- [ ] WhatsApp share (desktop)
- [ ] Clipboard copy success
- [ ] Clipboard copy fallback (execCommand)
- [ ] Clipboard copy error case
- [ ] Guest user flow (sign-in prompt)
- [ ] Database logging (share_events table)
- [ ] Cross-browser (Chrome, Firefox, Safari, Edge)

### Task 15: Accessibility Testing
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus trap in popover
- [ ] ARIA labels verified
- [ ] Screen reader test (VoiceOver/NVDA)
- [ ] Guest flow screen reader test
- [ ] axe DevTools audit (0 critical violations)
- [ ] Lighthouse audit (≥90 score)
- [ ] Mobile VoiceOver (iOS)
- [ ] Mobile TalkBack (Android)

---

## Notes

**Critical Paths:**
1. Auth user share to Twitter (most common)
2. Guest user sees sign-in prompt (conversion path)
3. Mobile WhatsApp share (viral growth)

**Known Limitations:**
- Cannot test actual Twitter/WhatsApp posting (only intent/dialog opening)
- Database verification requires local Supabase instance or production access
- Screen reader testing requires physical device or VM setup

**Follow-Up:**
- Analytics: Monitor share_events table for channel breakdown
- Conversion: Track guest → auth after seeing share prompt
- Performance: Monitor WhatsApp app open latency on slow networks
