export type MicBlockedApp = "kakaotalk" | "other";

// 인스타그램 인앱은 마이크가 되므로 대상이 아니다. 네이버·라인·페이스북은 동작 여부를 확인하지 못한 채 포함했다
export function getMicBlockedInApp(userAgent: string): MicBlockedApp | null {
  if (/KAKAOTALK/i.test(userAgent)) return "kakaotalk";
  if (/NAVER\(inapp|\bLine\/|FBAN|FBAV/.test(userAgent)) return "other";
  return null;
}

// 외부 브라우저로 여는 스킴은 카카오톡 것만 알고 있다. 사용자 클릭 핸들러 안에서 바로 호출해야 iOS가 막지 않는다
export function openInKakaoExternalBrowser(url: string) {
  window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
}
