import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockPointer } from "@/__tests__/mockPointer";
import { pickWheelDate } from "@/__tests__/pickWheelDate";
import type { WishResponse } from "@/types/wish/wish";
import FundingInfoStep from "@/widgets/funding/FundingInfoStep";

const wish: WishResponse = {
  id: 1,
  productName: "상품",
  productImageUrl: "https://example.com/1.png",
  price: 468000,
  productUrl: "https://example.com",
  sellerName: "쿠팡 Apple 공식 브랜드관",
  status: "AVAILABLE",
  fundingId: null,
};

const renderStep = (onNext = vi.fn()) => render(<FundingInfoStep wish={wish} onNext={onNext} />);

beforeEach(() => {
  mockPointer("coarse");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 13));
});

afterEach(() => vi.useRealTimers());

// 마감일 휠 시트를 열어 날짜를 확정한다
const pickDeadline = async (date = { year: 2027, month: 12, day: 25 }) => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /^마감일/ }));
  await pickWheelDate(user, date);
};

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

  it("금액을 입력한 뒤 칩을 누르면 칩 클릭이 유실되지 않고 바로 마감일이 나타난다", async () => {
    renderStep();

    const input = screen.getByLabelText("목표 금액");
    await userEvent.type(input, "1000");
    await userEvent.click(screen.getByRole("button", { name: "기본 상품 가격" }));

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
    renderStep();

    await userEvent.type(screen.getByLabelText("목표 금액"), "1000");
    await userEvent.tab();
    await pickDeadline();

    expect(screen.getByText(/^2027\.12\.25 \(.\)$/)).toBeInTheDocument();
  });

  it("마감일 휠은 오늘 이전 날짜를 보여주지 않고 오늘이 선택된 상태로 열린다", async () => {
    renderStep();

    await userEvent.type(screen.getByLabelText("목표 금액"), "1000");
    await userEvent.tab();
    await userEvent.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));

    expect(screen.queryByRole("button", { name: "10월" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "12일" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "13일" })).toHaveAttribute("aria-pressed", "true");
  });

  describe("마감일 이후 사연 단계", () => {
    const revealDeadline = async () => {
      await userEvent.type(screen.getByLabelText("목표 금액"), "1000");
      await userEvent.tab();
    };

    it("날짜를 확정하면 사연이 나타나고 제목이 바뀐다", async () => {
      renderStep();
      await revealDeadline();

      await userEvent.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));
      expect(screen.queryByLabelText("사연")).not.toBeInTheDocument();
      await pickWheelDate(userEvent.setup(), { year: 2027, month: 12, day: 25 });

      expect(screen.getByLabelText("사연")).toBeInTheDocument();
      expect(screen.getByText("어떤 사연인지 들려주세요")).toBeInTheDocument();
      expect(screen.queryByText("언제까지 모을까요?")).not.toBeInTheDocument();
    });

    it("마우스 환경에서는 달력에서 날짜를 고르면 포커스 이동 없이 사연이 나타나고 제목이 바뀐다", async () => {
      mockPointer("fine");
      renderStep();
      await revealDeadline();

      await userEvent.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));
      expect(screen.queryByLabelText("사연")).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: /11월 20일/ }));

      expect(screen.getByLabelText("사연")).toBeInTheDocument();
      expect(screen.getByText("어떤 사연인지 들려주세요")).toBeInTheDocument();
    });

    it("날짜를 확정하지 않고 시트를 닫으면 사연이 나타나지 않는다", async () => {
      renderStep();
      await revealDeadline();

      await userEvent.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));
      await userEvent.click(screen.getByRole("button", { name: "닫기" }));

      expect(screen.queryByLabelText("사연")).not.toBeInTheDocument();
      expect(screen.getByText("언제까지 모을까요?")).toBeInTheDocument();
    });

    it("사연이 나타난 뒤 날짜를 다시 골라도 사연은 유지된다", async () => {
      renderStep();
      await revealDeadline();

      await pickDeadline();
      await pickDeadline({ year: 2026, month: 12, day: 1 });

      expect(screen.getByLabelText("사연")).toBeInTheDocument();
    });

    it("사연 모션이 끝나면 사연에 포커스한다", async () => {
      renderStep();
      await revealDeadline();

      await pickDeadline();

      await waitFor(() => expect(screen.getByLabelText("사연")).toHaveFocus(), {
        timeout: 3000,
      });
    });
  });

  describe("사연 이후 공약 단계", () => {
    const reachStory = async () => {
      await userEvent.type(screen.getByLabelText("목표 금액"), "1000");
      await userEvent.tab();
      await pickDeadline();
      const story = screen.getByLabelText("사연");
      // 모션이 끝나며 일어나는 자동 포커스가 이후 입력 도중 끼어들지 않도록 먼저 기다린다
      await waitFor(() => expect(story).toHaveFocus(), { timeout: 3000 });
      return story;
    };

    it("사연을 입력하고 포커스가 빠지면 공약·다음 버튼이 나타나고 제목이 바뀐다", async () => {
      renderStep();
      const story = await reachStory();

      await userEvent.type(story, "생일 선물");
      expect(screen.queryByLabelText("공약")).not.toBeInTheDocument();
      fireEvent.blur(story);

      expect(screen.getByLabelText("공약")).toBeInTheDocument();
      expect(screen.getByText("공약도 걸어볼까요?")).toBeInTheDocument();
      expect(screen.getByText("선택이에요. 없으면 건너뛰어도 돼요")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "다음" })).toBeInTheDocument();
    });

    it("사연이 비었거나 공백뿐이면 포커스가 빠져도 공약이 나타나지 않는다", async () => {
      renderStep();
      const story = await reachStory();

      await userEvent.type(story, "   ");
      fireEvent.blur(story);

      expect(screen.queryByLabelText("공약")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "다음" })).not.toBeInTheDocument();
    });

    it("목표 금액·마감일·사연이 모두 채워져 있으면 공약이 비어 있어도 다음 버튼이 활성화된다", async () => {
      renderStep();
      const story = await reachStory();
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);

      expect(screen.getByLabelText("공약")).toHaveValue("");
      expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
    });

    it("목표 금액·마감일·사연 중 하나라도 비우면 다음 버튼이 비활성화된다", async () => {
      renderStep();
      const story = await reachStory();
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);
      const nextButton = screen.getByRole("button", { name: "다음" });

      await userEvent.clear(story);
      expect(nextButton).toBeDisabled();
      await userEvent.type(story, "생일 선물");
      expect(nextButton).toBeEnabled();

      await userEvent.clear(screen.getByLabelText("목표 금액"));
      expect(nextButton).toBeDisabled();
    });

    it("텍스트 필드에 포커스가 있는 동안 터치 기기에서 CTA를 숨기고, 포커스가 빠지면 다시 보인다", async () => {
      renderStep();
      const story = await reachStory();
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

    it("마감일 버튼에 포커스가 있어도 CTA를 숨기지 않는다", async () => {
      renderStep();
      const story = await reachStory();
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);
      const cta = screen.getByRole("button", { name: "다음" }).closest(".fixed")!;

      screen.getByRole("button", { name: /^마감일/ }).focus();

      expect(cta).not.toHaveClass("pointer-coarse:hidden");
    });

    it("다음 버튼을 누르면 onNext를 호출한다", async () => {
      const onNext = vi.fn();
      renderStep(onNext);
      const story = await reachStory();
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);

      await userEvent.click(screen.getByRole("button", { name: "다음" }));

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it("사연을 지워도 공약 단계는 유지된다", async () => {
      renderStep();
      const story = await reachStory();
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

describe("FundingInfoStep 수정 모드", () => {
  const initialValues = {
    targetAmount: "429000",
    deadline: "2099-11-13",
    story: "사연",
    pledge: "공약",
  };
  const renderEdit = (onNext = vi.fn()) =>
    render(
      <FundingInfoStep
        wish={wish}
        onNext={onNext}
        initialValues={initialValues}
        submitLabel="수정 완료"
      />,
    );

  it("입력했던 값이 모두 채워져 있고 수정 완료가 비활성화돼 있다", () => {
    renderEdit();

    expect(screen.getByLabelText("목표 금액")).toHaveValue("429,000");
    expect(screen.getByLabelText("사연")).toHaveValue("사연");
    expect(screen.getByLabelText("공약")).toHaveValue("공약");
    expect(screen.getByRole("button", { name: "수정 완료" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "다음" })).not.toBeInTheDocument();
  });

  it("값을 바꾸면 수정 완료가 활성화되고 누르면 바뀐 값으로 onNext를 호출한다", async () => {
    const onNext = vi.fn();
    renderEdit(onNext);

    await userEvent.type(screen.getByLabelText("공약"), "!");
    await userEvent.click(screen.getByRole("button", { name: "수정 완료" }));

    expect(onNext).toHaveBeenCalledWith({ ...initialValues, pledge: "공약!" });
  });

  it("필수값(사연)을 비우면 값이 바뀌어도 수정 완료가 비활성화된다", async () => {
    renderEdit();

    await userEvent.clear(screen.getByLabelText("사연"));

    expect(screen.getByRole("button", { name: "수정 완료" })).toBeDisabled();
  });
});
