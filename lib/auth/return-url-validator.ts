const ALLOWED_PATHS = ["/", "/puzzle", "/leaderboard", "/profile"];
const ALLOWED_PATH_PREFIXES = ["/puzzle/"];
const LOCALE_PATTERN = /^\/[a-z]{2}(\/|$)/;

export function validateReturnUrl(returnUrl: string | null): string {
  if (!returnUrl) {
    return "/";
  }

  try {
    if (!returnUrl.startsWith("/")) {
      return "/";
    }

    if (returnUrl.includes("//")) {
      return "/";
    }

    const pathname = returnUrl.split("?")[0].split("#")[0];

    if (ALLOWED_PATHS.includes(pathname)) {
      return returnUrl;
    }

    const pathnameWithoutLocale = pathname.replace(LOCALE_PATTERN, "/");
    if (ALLOWED_PATHS.includes(pathnameWithoutLocale)) {
      return returnUrl;
    }

    // Check if path starts with allowed prefix (e.g., /puzzle/easy, /puzzle/medium)
    if (ALLOWED_PATH_PREFIXES.some(prefix => pathnameWithoutLocale.startsWith(prefix))) {
      return returnUrl;
    }

    return "/";
  } catch {
    return "/";
  }
}
