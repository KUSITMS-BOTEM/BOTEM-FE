"use client";

import { useEffect } from "react";
import { isGoogleAppBrowser } from "@/utils/isGoogleAppBrowser";

// 스크린샷 기준 툴바가 가리는 높이 추정값(실기기 미검증)
const GOOGLE_APP_TOOLBAR_HEIGHT = "62px";

export default function InAppTopInset() {
  useEffect(() => {
    if (!isGoogleAppBrowser(navigator.userAgent)) return;
    document.documentElement.style.setProperty("--app-top-offset", GOOGLE_APP_TOOLBAR_HEIGHT);
  }, []);

  return null;
}
