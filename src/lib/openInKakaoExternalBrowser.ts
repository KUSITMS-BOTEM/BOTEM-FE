// 외부 브라우저로 여는 스킴은 카카오톡 것만 알고 있다. 사용자 클릭 핸들러 안에서 바로 호출해야 iOS가 막지 않는다
export function openInKakaoExternalBrowser(url: string) {
  window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
}
