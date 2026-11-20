import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PageExitMotion from "@/components/effects/PageExitMotion";
import { PAGE_EXIT_RECOVER_MS, usePageExit, type PageExitType } from "@/hooks/usePageExit";

function TestPage({ type, onComplete }: { type: PageExitType; onComplete: () => void }) {
  const { pageExit, exitPage } = usePageExit();

  return (
    <PageExitMotion exit={pageExit}>
      <button type="button" onClick={() => exitPage(type, onComplete)}>
        나가기
      </button>
    </PageExitMotion>
  );
}

describe("PageExitMotion", () => {
  it.each<PageExitType>(["slide", "fade"])(
    "%s 퇴장 애니메이션이 끝난 뒤 이동 콜백을 호출한다",
    async type => {
      const onComplete = vi.fn();
      render(<TestPage type={type} onComplete={onComplete} />);

      await userEvent.click(screen.getByRole("button", { name: "나가기" }));

      expect(onComplete).not.toHaveBeenCalled();
      await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    },
  );

  it("퇴장 중에 다시 눌러도 이동 콜백은 한 번만 호출한다", async () => {
    const onComplete = vi.fn();
    render(<TestPage type="slide" onComplete={onComplete} />);
    const button = screen.getByRole("button", { name: "나가기" });

    await userEvent.click(button);
    await userEvent.click(button);

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    await new Promise(resolve => setTimeout(resolve, 500));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("평소에는 transform이 없어 고정 헤더·BottomCTA의 기준 박스가 되지 않는다", () => {
    render(<TestPage type="slide" onComplete={vi.fn()} />);

    const content = screen.getByRole("button", { name: "나가기" }).parentElement;
    expect(content?.style.transform).toMatch(/^(none)?$/);
  });

  it("이동이 일어나지 않으면 원래 화면으로 돌아와 다시 누를 수 있다", async () => {
    // 뒤로 갈 기록이 없어 router.back()이 아무것도 하지 않는 상황
    const onComplete = vi.fn();
    render(<TestPage type="slide" onComplete={onComplete} />);
    const button = screen.getByRole("button", { name: "나가기" });

    await userEvent.click(button);
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(button.parentElement?.style.transform).toMatch(/^(none)?$/), {
      timeout: PAGE_EXIT_RECOVER_MS + 1000,
    });

    await userEvent.click(button);
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(2));
  });
});
