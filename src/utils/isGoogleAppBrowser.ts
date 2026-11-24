// 구글 앱 인앱 브라우저는 상단 툴바가 웹뷰 위에 겹쳐 뜨지만 safe-area-inset-top에 그 높이를 알려주지 않는다
export function isGoogleAppBrowser(userAgent: string): boolean {
  return /\bGSA\//.test(userAgent);
}
