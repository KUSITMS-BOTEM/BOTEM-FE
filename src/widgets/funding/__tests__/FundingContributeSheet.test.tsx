import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockPointer } from "@/__tests__/mockPointer";
import FundingContributeSheet from "@/widgets/funding/FundingContributeSheet";

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

beforeEach(() => {
  mockPointer("coarse");
});

const MAX_AMOUNT = 49382715;

type HarnessProps = { onNext?: (amount: number) => void; onClose?: () => void };

function Harness({ onNext = vi.fn(), onClose }: HarnessProps) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button onClick={() => setOpen(true)}>열기</button>
      <FundingContributeSheet
        open={open}
        hostName="지유"
        maxAmount={MAX_AMOUNT}
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
        onNext={onNext}
      />
    </>
  );
}

const getInput = () => screen.getByRole("textbox", { name: "보탬 금액" });
const getNext = () => screen.getByRole("button", { name: "다음" });
const TOAST_TEXT = `최대 ${MAX_AMOUNT.toLocaleString("ko-KR")}원까지 보탤 수 있어요`;

describe("FundingContributeSheet", () => {
  describe("초기 상태", () => {
    it("호스트 이름이 들어간 제목과 빈 입력으로 시작한다", () => {
      render(<Harness />);

      expect(screen.getByText("지유에게 보태기")).toBeInTheDocument();
      expect(getInput()).toHaveValue("");
    });

    it("금액이 0이면 다음 버튼이 비활성화된다", () => {
      render(<Harness />);

      expect(getNext()).toBeDisabled();
    });
  });

  describe("금액 입력", () => {
    it("숫자를 입력하면 천 단위 콤마로 표시된다", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.type(getInput(), "12000");

      expect(getInput()).toHaveValue("12,000");
    });

    it("숫자가 아닌 문자는 무시한다", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.type(getInput(), "1a2b");

      expect(getInput()).toHaveValue("12");
    });

    it("입력을 모두 지우면 다음 버튼이 다시 비활성화된다", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.type(getInput(), "5000");
      expect(getNext()).toBeEnabled();
      await user.clear(getInput());

      expect(getNext()).toBeDisabled();
    });
  });

  describe("금액 칩", () => {
    it("칩을 누를 때마다 금액이 누적된다", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.click(screen.getByRole("button", { name: "5,000원" }));
      expect(getInput()).toHaveValue("5,000");
      await user.click(screen.getByRole("button", { name: "10,000원" }));
      expect(getInput()).toHaveValue("15,000");
      await user.click(screen.getByRole("button", { name: "50,000원" }));
      expect(getInput()).toHaveValue("65,000");
    });

    it("직접 입력한 금액 위에 칩 금액이 더해진다", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.type(getInput(), "1000");
      await user.click(screen.getByRole("button", { name: "5,000원" }));

      expect(getInput()).toHaveValue("6,000");
    });
  });

  describe("남은 금액 초과", () => {
    it("금액이 남은 금액과 같으면 다음 버튼이 활성화되고 안내가 보이지 않는다", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.type(getInput(), String(MAX_AMOUNT));

      expect(getNext()).toBeEnabled();
      expect(screen.queryByText(TOAST_TEXT)).not.toBeInTheDocument();
    });

    it("금액이 남은 금액보다 1원 크면 다음 버튼이 비활성화되고 안내가 보인다", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.type(getInput(), String(MAX_AMOUNT + 1));

      expect(getNext()).toBeDisabled();
      expect(screen.getByText(TOAST_TEXT)).toBeInTheDocument();
    });

    it("초과한 뒤 금액을 줄이면 다시 활성화되고 안내가 사라진다", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.type(getInput(), String(MAX_AMOUNT + 1));
      await user.type(getInput(), "{Backspace}");

      expect(getNext()).toBeEnabled();
      await waitFor(() => expect(screen.queryByText(TOAST_TEXT)).not.toBeInTheDocument());
    });
  });

  describe("다음", () => {
    it("유효한 금액에서 누르면 숫자 금액으로 onNext를 한 번 호출한다", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      render(<Harness onNext={onNext} />);

      await user.click(screen.getByRole("button", { name: "5,000원" }));
      await user.click(screen.getByRole("button", { name: "10,000원" }));
      await user.click(getNext());

      expect(onNext).toHaveBeenCalledTimes(1);
      expect(onNext).toHaveBeenCalledWith(15000);
    });

    it("초과 금액에서는 눌러도 onNext를 호출하지 않는다", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      render(<Harness onNext={onNext} />);

      await user.type(getInput(), String(MAX_AMOUNT + 1));
      await user.click(getNext());

      expect(onNext).not.toHaveBeenCalled();
    });
  });

  describe("닫기", () => {
    it("닫고 다시 열면 입력값이 비어 있다", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Harness onClose={onClose} />);

      await user.type(getInput(), "5000");
      await user.click(screen.getByRole("button", { name: "닫기", hidden: true }));
      expect(onClose).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole("button", { name: "열기" }));

      expect(await screen.findByRole("textbox", { name: "보탬 금액" })).toHaveValue("");
    });
  });
});
