"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";

const CONSENT_COOKIE = "all-files-convertor-cookie-consent";

function hasAcceptedCookies() {
  if (typeof document === "undefined") {
    return false;
  }
  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie === `${CONSENT_COOKIE}=true`);
}

function subscribeToCookieConsent(callback: () => void) {
  const interval = window.setInterval(callback, 1000);
  return () => window.clearInterval(interval);
}

export function ConsentScripts({
  adsenseClient,
  plausibleDomain
}: {
  adsenseClient?: string;
  plausibleDomain?: string;
}) {
  const accepted = useSyncExternalStore(subscribeToCookieConsent, hasAcceptedCookies, () => false);

  if (!accepted) {
    return null;
  }

  return (
    <>
      {adsenseClient ? (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      ) : null}
      {plausibleDomain ? (
        <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
      ) : null}
    </>
  );
}
