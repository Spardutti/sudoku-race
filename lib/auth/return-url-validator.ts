const ALLOWED_PATHS = ["/", "/puzzle", "/leaderboard", "/profile"];
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

    return "/";
  } catch {
    return "/";
  }
}
