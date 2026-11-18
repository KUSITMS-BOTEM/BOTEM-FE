import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import BotemEditFlow from "@/widgets/funding/BotemEditFlow";

// jsdom에 없는 dialog API를 단순 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

describe("BotemEditFlow", () => {
  it("이름·비밀번호 확인 → 편지 수정 → 저장 완료 안내 후 확인을 누르면 onClose가 호출된다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<BotemEditFlow open recipientName="지유" onClose={onClose} />);

    await user.type(await screen.findByRole("textbox", { name: "이름" }), "민지");
    await user.type(screen.getByLabelText("비밀번호 4자리"), "1234");
    await user.click(screen.getByRole("button", { name: "확인" }));

    const letter = await screen.findByRole("textbox", { name: "편지 내용" });
    expect(letter).toHaveTextContent("올해도 같이 많이 웃자");
    letter.textContent = "고친 편지";
    fireEvent.input(letter);
    await user.click(screen.getByRole("button", { name: "이대로 저장하기" }));

    expect(await screen.findByRole("heading", { name: "보탬을 수정했어요" })).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "확인" }).at(-1)!);

    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "보탬을 수정했어요" })).not.toBeInTheDocument(),
    );
  });
});
