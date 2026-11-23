export type MicBlockedApp = "kakaotalk" | "other";

// 인스타그램 인앱은 마이크가 되므로 대상이 아니다. 네이버·라인·페이스북은 동작 여부를 확인하지 못한 채 포함했다
export function getMicBlockedInApp(userAgent: string): MicBlockedApp | null {
  if (/KAKAOTALK/i.test(userAgent)) return "kakaotalk";
  if (/NAVER\(inapp|\bLine\/|FBAN|FBAV/.test(userAgent)) return "other";
  return null;
}
