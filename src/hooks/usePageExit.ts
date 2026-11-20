import { useState } from "react";

export type PageExitType = "slide" | "fade";

export type PageExit = {
  type: PageExitType;
  onComplete: () => void;
  scrollY: number;
};

// 이동 콜백 호출 후 이 시간이 지나도 페이지가 남아 있으면 이동이 실패한 것으로 본다
export const PAGE_EXIT_RECOVER_MS = 1500;

export function usePageExit() {
  const [pageExit, setPageExit] = useState<PageExit | null>(null);

  const exitPage = (type: PageExitType, onComplete: () => void) => {
    const scrollY = window.scrollY;
    const completeOrRecover = () => {
      onComplete();
      // 이동하면 페이지가 언마운트돼 이 타이머는 의미가 없다. 뒤로 갈 기록이 없어 router.back()이
      // 아무것도 안 하는 등 페이지가 남아 있으면, 밀려난 빈 화면에 갇히지 않게 퇴장 상태를 되돌린다
      setTimeout(() => setPageExit(null), PAGE_EXIT_RECOVER_MS);
    };
    // 퇴장 중에 다시 눌러도 이동이 두 번 일어나지 않게 첫 요청만 받는다
    setPageExit(prev => prev ?? { type, onComplete: completeOrRecover, scrollY });
  };

  return { pageExit, exitPage };
}
