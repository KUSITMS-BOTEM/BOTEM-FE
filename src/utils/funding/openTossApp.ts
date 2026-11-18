const TOSS_APP_SCHEME = "supertoss://";
const APP_SWITCH_WAIT_MS = 1500;
const MOBILE_USER_AGENT = /Android|iPhone|iPad|iPod/i;

// 앱이 열리면 브라우저가 백그라운드로 가므로, 대기 시간 안에 화면이 숨겨졌는지로 성공을 판단한다
// shortcut: 앱 전환을 감지하는 휴리스틱이라 오탐이 있을 수 있다. 토스가 공식 딥링크(화면 지정)를 제공하면 교체
export const openTossApp = () =>
  new Promise<boolean>(resolve => {
    if (!MOBILE_USER_AGENT.test(navigator.userAgent)) {
      resolve(false);
      return;
    }

    let opened = false;
    const handleVisibilityChange = () => {
      if (document.hidden) opened = true;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.location.href = TOSS_APP_SCHEME;

    setTimeout(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resolve(opened);
    }, APP_SWITCH_WAIT_MS);
  });
