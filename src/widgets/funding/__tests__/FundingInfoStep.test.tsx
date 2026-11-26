import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockPointer } from "@/__tests__/mockPointer";
import { pickWheelDate } from "@/__tests__/pickWheelDate";
import FundingInfoStep from "@/widgets/funding/FundingInfoStep";

const renderStep = (onNext = vi.fn()) => render(<FundingInfoStep onNext={onNext} />);

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
  it("마감일 단계로 시작하고 사연·공약은 아직 보이지 않는다", () => {
    renderStep();

    expect(screen.getByText("언제까지 모을까요?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^마감일/ })).toBeInTheDocument();
    expect(screen.queryByLabelText("사연")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("공약")).not.toBeInTheDocument();
  });

  it("마감일에서 날짜를 고르면 연도와 요일을 포함해 보여준다", async () => {
    renderStep();

    await pickDeadline();

    expect(screen.getByText(/^2027\.12\.25 \(.\)$/)).toBeInTheDocument();
  });

  it("마감일 휠은 내일 이전 날짜를 보여주지 않고 내일이 선택된 상태로 열린다", async () => {
    renderStep();

    await userEvent.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));

    expect(screen.queryByRole("button", { name: "10월" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "13일" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "14일" })).toHaveAttribute("aria-pressed", "true");
  });

  describe("마감일 이후 사연 단계", () => {
    it("날짜를 확정하면 사연이 나타나고 제목이 바뀐다", async () => {
      renderStep();

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

      await userEvent.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));
      expect(screen.queryByLabelText("사연")).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: /11월 20일/ }));

      expect(screen.getByLabelText("사연")).toBeInTheDocument();
      expect(screen.getByText("어떤 사연인지 들려주세요")).toBeInTheDocument();
    });

    it("날짜를 확정하지 않고 시트를 닫으면 사연이 나타나지 않는다", async () => {
      renderStep();

      await userEvent.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));
      await userEvent.click(screen.getByRole("button", { name: "닫기" }));

      expect(screen.queryByLabelText("사연")).not.toBeInTheDocument();
      expect(screen.getByText("언제까지 모을까요?")).toBeInTheDocument();
    });

    it("사연이 나타난 뒤 날짜를 다시 골라도 사연은 유지된다", async () => {
      renderStep();

      await pickDeadline();
      await pickDeadline({ year: 2026, month: 12, day: 1 });

      expect(screen.getByLabelText("사연")).toBeInTheDocument();
    });

    it("사연 모션이 끝나면 사연에 포커스한다", async () => {
      renderStep();

      await pickDeadline();

      await waitFor(() => expect(screen.getByLabelText("사연")).toHaveFocus(), {
        timeout: 3000,
      });
    });
  });

  describe("사연 이후 공약 단계", () => {
    const reachStory = async () => {
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

    it("마감일·사연이 채워져 있으면 공약이 비어 있어도 다음 버튼이 활성화된다", async () => {
      renderStep();
      const story = await reachStory();
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);

      expect(screen.getByLabelText("공약")).toHaveValue("");
      expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
    });

    it("마감일·사연 중 하나라도 비우면 다음 버튼이 비활성화된다", async () => {
      renderStep();
      const story = await reachStory();
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);
      const nextButton = screen.getByRole("button", { name: "다음" });

      await userEvent.clear(story);
      expect(nextButton).toBeDisabled();
      await userEvent.type(story, "생일 선물");
      expect(nextButton).toBeEnabled();
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
});

describe("FundingInfoStep 수정 모드", () => {
  const initialValues = {
    deadline: "2099-11-13",
    story: "사연",
    pledge: "공약",
  };
  const renderEdit = (onNext = vi.fn()) =>
    render(
      <FundingInfoStep onNext={onNext} initialValues={initialValues} submitLabel="수정 완료" />,
    );

  it("입력했던 값이 모두 채워져 있고 수정 완료가 비활성화돼 있다", () => {
    renderEdit();

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
