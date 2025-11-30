export function shareToTwitter(text: string): void {
  const encodedText = encodeURIComponent(text);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

  const popup = window.open(twitterUrl, "_blank", "noopener,noreferrer");

  if (!popup || popup.closed || typeof popup.closed === "undefined") {
    copyToClipboard(text);
  }
}

export function shareToWhatsApp(text: string): void {
  const encodedText = encodeURIComponent(text);
  const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);

  const whatsappUrl = isMobile
    ? `whatsapp://send?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);

    return success;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}
