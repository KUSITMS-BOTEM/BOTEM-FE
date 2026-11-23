import { isValidUrl } from "@/utils/isValidUrl";

// 응답을 기다린 뒤 창을 열면 클릭 제스처가 끊겨 (특히 iOS Safari) 팝업이 막히므로, 클릭 즉시 빈 탭을 열어 두고 응답이 오면 보낸다.
// 그래도 새 탭이 막히는 환경(카카오톡 인앱 브라우저 등)에선 서버 상태만 바뀌고 이동이 없지 않도록 지금 탭에서 이동한다
export function openPendingTab() {
  const tab = window.open("", "_blank");
  return {
    navigate: (url: string | undefined) => {
      const isSafeUrl = !!url && isValidUrl(url);
      if (!tab) {
        if (isSafeUrl) window.location.assign(url);
        return;
      }
      if (!isSafeUrl) {
        tab.close();
        return;
      }
      tab.opener = null;
      tab.location.href = url;
    },
    close: () => tab?.close(),
  };
}
