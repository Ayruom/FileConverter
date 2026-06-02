"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_COOKIE = "all-files-convertor-cookie-consent";

function hasAcceptedCookies() {
  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie === `${CONSENT_COOKIE}=true`);
}

export function ConsentScripts({
  adsenseClient,
  plausibleDomain
}: {
  adsenseClient?: string;
  plausibleDomain?: string;
}) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    setAccepted(hasAcceptedCookies());
    const interval = window.setInterval(() => setAccepted(hasAcceptedCookies()), 1000);
    return () => window.clearInterval(interval);
  }, []);

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
