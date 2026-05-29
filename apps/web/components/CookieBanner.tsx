"use client";

import CookieConsent from "react-cookie-consent";

export function CookieBanner() {
  return (
    <CookieConsent
      buttonText="Accept"
      cookieName="fileflux-cookie-consent"
      style={{ background: "#13131a", borderTop: "1px solid #2a2a3a" }}
      buttonStyle={{ background: "#ffffff", color: "#0a0a0f", borderRadius: "6px", fontWeight: 700 }}
    >
      FileFlux does not use account cookies. AdSense may set cookies for ads.
    </CookieConsent>
  );
}
