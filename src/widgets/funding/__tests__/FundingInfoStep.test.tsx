import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { WishResponse } from "@/types/wish/wish";
import { getTodayDate } from "@/utils/funding/formatDeadline";
import FundingInfoStep from "@/widgets/funding/FundingInfoStep";

const wish: WishResponse = {
  id: 1,
  productName: "상품",
  productImageUrl: "https://example.com/1.png",
  price: 468000,
  productUrl: "https://example.com",
  status: "AVAILABLE",
  fundingId: null,
};

const renderStep = (onNext = vi.fn()) => render(<FundingInfoStep wish={wish} onNext={onNext} />);

describe("FundingInfoStep", () => {
  it("목표 금액은 비어 있고 안내 문구에 위시 가격을 보여준다", () => {
    renderStep();

    expect(screen.getByText("목표 금액은 얼마인가요?")).toBeInTheDocument();
    expect(screen.getByLabelText("목표 금액")).toHaveValue("");
    expect(screen.getByText("기본 상품 가격은 468,000원이에요")).toBeInTheDocument();
  });

  it("기본 상품 가격 칩을 누르면 목표 금액이 위시 가격으로 채워진다", async () => {
    renderStep();

    await userEvent.click(screen.getByRole("button", { name: "기본 상품 가격" }));

    expect(screen.getByLabelText("목표 금액")).toHaveValue("468,000");
  });

  it("숫자 외 문자는 무시하고 천 단위 쉼표로 보여준다", async () => {
    renderStep();

    const input = screen.getByLabelText("목표 금액");
    await userEvent.type(input, "12a3456");

    expect(input).toHaveValue("123,456");
  });

  it("직접 입력한 뒤 칩을 누르면 목표 금액이 위시 가격으로 바뀐다", async () => {
    renderStep();

    const input = screen.getByLabelText("목표 금액");
    await userEvent.type(input, "1000");
    await userEvent.click(screen.getByRole("button", { name: "기본 상품 가격" }));

    expect(input).toHaveValue("468,000");
  });

  it("목표 금액을 입력하는 동안에는 마감일이 나타나지 않는다", async () => {
    renderStep();

    await userEvent.type(screen.getByLabelText("목표 금액"), "1000");

    expect(screen.queryByText("마감일")).not.toBeInTheDocument();
  });

  it("금액을 입력하고 포커스가 빠지면 마감일이 나타나고 제목·칩·안내 문구가 바뀐다", async () => {
    renderStep();

    await userEvent.type(screen.getByLabelText("목표 금액"), "1000");
    await userEvent.tab();

    expect(screen.getByText("마감일")).toBeInTheDocument();
    expect(screen.getByText("언제까지 모을까요?")).toBeInTheDocument();
    expect(screen.queryByText("목표 금액은 얼마인가요?")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "기본 상품 가격" })).not.toBeInTheDocument();
    expect(screen.queryByText("기본 상품 가격은 468,000원이에요")).not.toBeInTheDocument();
  });

  it("금액을 입력하고 Enter를 누르면 마감일이 나타난다", async () => {
    renderStep();

    await userEvent.type(screen.getByLabelText("목표 금액"), "1000{Enter}");

    expect(screen.getByText("마감일")).toBeInTheDocument();
  });

  it("금액이 비어 있으면 포커스가 빠져도 마감일이 나타나지 않는다", async () => {
    renderStep();

    await userEvent.click(screen.getByLabelText("목표 금액"));
    await userEvent.tab();

    expect(screen.queryByText("마감일")).not.toBeInTheDocument();
  });

  it("금액을 입력한 뒤 칩을 눌러도 칩 클릭이 유실되지 않고 이후에 마감일이 나타난다", async () => {
    renderStep();

    const input = screen.getByLabelText("목표 금액");
    await userEvent.type(input, "1000");
    await userEvent.click(screen.getByRole("button", { name: "기본 상품 가격" }));
    expect(screen.queryByText("마감일")).not.toBeInTheDocument();
    await userEvent.tab();

    expect(input).toHaveValue("468,000");
    expect(screen.getByText("마감일")).toBeInTheDocument();
  });

  it("마감일이 나타난 뒤 금액을 지워도 마감일은 유지된다", async () => {
    renderStep();

    const input = screen.getByLabelText("목표 금액");
    await userEvent.type(input, "1000");
    await userEvent.tab();
    await userEvent.clear(input);
    await userEvent.tab();

    expect(screen.getByText("마감일")).toBeInTheDocument();
  });

  it("마감일에서 날짜를 고르면 연도와 요일을 포함해 보여준다", async () => {
    const { container } = renderStep();

    await userEvent.type(screen.getByLabelText("목표 금액"), "1000");
    await userEvent.tab();
    fireEvent.change(container.querySelector('input[type="date"]')!, {
      target: { value: "2099-12-25" },
    });

    expect(screen.getByText(/^2099\.12\.25 \(.\)$/)).toBeInTheDocument();
  });

  it("마감일 캘린더는 오늘 이전 날짜를 선택할 수 없고, 직접 입력한 과거 날짜는 무시한다", async () => {
    const { container } = renderStep();

    await userEvent.type(screen.getByLabelText("목표 금액"), "1000");
    await userEvent.tab();
    const dateInput = container.querySelector('input[type="date"]')!;
    fireEvent.change(dateInput, { target: { value: "2000-01-01" } });

    expect(dateInput).toHaveAttribute("min", getTodayDate());
    expect(screen.getByText("선택해주세요")).toBeInTheDocument();
  });

  describe("마감일 이후 사연 단계", () => {
    const revealDeadline = async (container: HTMLElement) => {
      await userEvent.type(screen.getByLabelText("목표 금액"), "1000");
      await userEvent.tab();
      const dateInput = container.querySelector<HTMLInputElement>('input[type="date"]')!;
      return dateInput;
    };

    it("날짜를 고르고 포커스가 빠지면 사연이 나타나고 제목이 바뀐다", async () => {
      const { container } = renderStep();
      const dateInput = await revealDeadline(container);

      fireEvent.change(dateInput, { target: { value: "2099-12-25" } });
      expect(screen.queryByLabelText("사연")).not.toBeInTheDocument();
      fireEvent.blur(dateInput);

      expect(screen.getByLabelText("사연")).toBeInTheDocument();
      expect(screen.getByText("어떤 사연인지 들려주세요")).toBeInTheDocument();
      expect(screen.queryByText("언제까지 모을까요?")).not.toBeInTheDocument();
    });

    it("날짜를 고르지 않고 포커스가 빠지면 사연이 나타나지 않는다", async () => {
      const { container } = renderStep();
      const dateInput = await revealDeadline(container);

      fireEvent.blur(dateInput);

      expect(screen.queryByLabelText("사연")).not.toBeInTheDocument();
      expect(screen.getByText("언제까지 모을까요?")).toBeInTheDocument();
    });

    it("사연이 나타난 뒤 날짜를 지워도 사연은 유지된다", async () => {
      const { container } = renderStep();
      const dateInput = await revealDeadline(container);

      fireEvent.change(dateInput, { target: { value: "2099-12-25" } });
      fireEvent.blur(dateInput);
      fireEvent.change(dateInput, { target: { value: "" } });

      expect(screen.getByLabelText("사연")).toBeInTheDocument();
    });

    it("사연 모션이 끝나면 사연에 포커스한다", async () => {
      const { container } = renderStep();
      const dateInput = await revealDeadline(container);

      fireEvent.change(dateInput, { target: { value: "2099-12-25" } });
      fireEvent.blur(dateInput);

      await waitFor(() => expect(screen.getByLabelText("사연")).toHaveFocus(), {
        timeout: 3000,
      });
    });
  });

  describe("사연 이후 공약 단계", () => {
    const reachStory = async (container: HTMLElement) => {
      await userEvent.type(screen.getByLabelText("목표 금액"), "1000");
      await userEvent.tab();
      const dateInput = container.querySelector<HTMLInputElement>('input[type="date"]')!;
      fireEvent.change(dateInput, { target: { value: "2099-12-25" } });
      fireEvent.blur(dateInput);
      return screen.getByLabelText("사연");
    };

    it("사연을 입력하고 포커스가 빠지면 공약·다음 버튼이 나타나고 제목이 바뀐다", async () => {
      const { container } = renderStep();
      const story = await reachStory(container);

      await userEvent.type(story, "생일 선물");
      expect(screen.queryByLabelText("공약")).not.toBeInTheDocument();
      fireEvent.blur(story);

      expect(screen.getByLabelText("공약")).toBeInTheDocument();
      expect(screen.getByText("공약도 걸어볼까요?")).toBeInTheDocument();
      expect(screen.getByText("선택이에요. 없으면 건너뛰어도 돼요")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "다음" })).toBeInTheDocument();
    });

    it("사연이 비었거나 공백뿐이면 포커스가 빠져도 공약이 나타나지 않는다", async () => {
      const { container } = renderStep();
      const story = await reachStory(container);

      await userEvent.type(story, "   ");
      fireEvent.blur(story);

      expect(screen.queryByLabelText("공약")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "다음" })).not.toBeInTheDocument();
    });

    it("목표 금액·마감일·사연이 모두 채워져 있으면 공약이 비어 있어도 다음 버튼이 활성화된다", async () => {
      const { container } = renderStep();
      const story = await reachStory(container);
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);

      expect(screen.getByLabelText("공약")).toHaveValue("");
      expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
    });

    it("목표 금액·마감일·사연 중 하나라도 비우면 다음 버튼이 비활성화된다", async () => {
      const { container } = renderStep();
      const story = await reachStory(container);
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);
      const nextButton = screen.getByRole("button", { name: "다음" });

      await userEvent.clear(story);
      expect(nextButton).toBeDisabled();
      await userEvent.type(story, "생일 선물");
      expect(nextButton).toBeEnabled();

      fireEvent.change(container.querySelector('input[type="date"]')!, { target: { value: "" } });
      expect(nextButton).toBeDisabled();
      fireEvent.change(container.querySelector('input[type="date"]')!, {
        target: { value: "2099-12-25" },
      });
      expect(nextButton).toBeEnabled();

      await userEvent.clear(screen.getByLabelText("목표 금액"));
      expect(nextButton).toBeDisabled();
    });

    it("텍스트 필드에 포커스가 있는 동안 터치 기기에서 CTA를 숨기고, 포커스가 빠지면 다시 보인다", async () => {
      const { container } = renderStep();
      const story = await reachStory(container);
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);
      const cta = screen.getByRole("button", { name: "다음" }).closest(".fixed")!;
      const HIDE_CLASS = "pointer-coarse:hidden";

      expect(cta).not.toHaveClass(HIDE_CLASS);
      await userEvent.click(screen.getByLabelText("공약"));
      expect(cta).toHaveClass(HIDE_CLASS);
      await userEvent.click(screen.getByLabelText("사연"));
      expect(cta).toHaveClass(HIDE_CLASS);
      await userEvent.tab();
      await userEvent.tab();
      await userEvent.click(document.body);
      expect(cta).not.toHaveClass(HIDE_CLASS);
    });

    it("날짜 input에 포커스가 있어도 CTA를 숨기지 않는다", async () => {
      const { container } = renderStep();
      const story = await reachStory(container);
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);
      const cta = screen.getByRole("button", { name: "다음" }).closest(".fixed")!;

      container.querySelector<HTMLInputElement>('input[type="date"]')!.focus();

      expect(cta).not.toHaveClass("pointer-coarse:hidden");
    });

    it("다음 버튼을 누르면 onNext를 호출한다", async () => {
      const onNext = vi.fn();
      const { container } = renderStep(onNext);
      const story = await reachStory(container);
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);

      await userEvent.click(screen.getByRole("button", { name: "다음" }));

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it("사연을 지워도 공약 단계는 유지된다", async () => {
      const { container } = renderStep();
      const story = await reachStory(container);
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);
      await userEvent.clear(story);

      expect(screen.getByLabelText("공약")).toBeInTheDocument();
    });
  });

  it("입력 영역 모션이 끝나면 목표 금액에 포커스한다", async () => {
    renderStep();

    expect(screen.getByLabelText("목표 금액")).not.toHaveFocus();
    await waitFor(() => expect(screen.getByLabelText("목표 금액")).toHaveFocus(), {
      timeout: 3000,
    });
  });
});
