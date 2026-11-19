import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockPointer } from "@/__tests__/mockPointer";
import { pickWheelDate } from "@/__tests__/pickWheelDate";
import SurpriseInfoStep from "@/widgets/funding/SurpriseInfoStep";

const wish = { id: 1, productName: "상품", productImageUrl: undefined, price: 468000 };

type StepProps = Partial<React.ComponentProps<typeof SurpriseInfoStep>>;

const renderStep = (props: StepProps = {}) =>
  render(<SurpriseInfoStep wish={wish} recipientName="민지" onNext={vi.fn()} {...props} />);

beforeEach(() => {
  mockPointer("coarse");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 13));
});

afterEach(() => vi.useRealTimers());

// 목표 금액을 입력하고 마감일(2027-12-25)을 확정해 공개일 단계까지 간다
const goToReveal = async () => {
  const user = userEvent.setup();
  const amount = await screen.findByLabelText("목표 금액");
  await waitFor(() => expect(amount).toHaveFocus(), { timeout: 3000 });
  await user.type(amount, "1000");
  await user.tab();
  await user.click(screen.getByRole("button", { name: /^마감일/ }));
  await pickWheelDate(user, { year: 2027, month: 12, day: 25 });
};

describe("SurpriseInfoStep", () => {
  it("목표 금액 단계에서는 마감일·공개일이 보이지 않는다", () => {
    renderStep();

    expect(screen.getByText("목표 금액은 얼마인가요?")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^마감일/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^펀딩 공개일/ })).not.toBeInTheDocument();
  });

  it("목표 금액을 입력하고 포커스가 빠지면 마감일이 나타난다", async () => {
    renderStep();
    const amount = await screen.findByLabelText("목표 금액");
    await waitFor(() => expect(amount).toHaveFocus(), { timeout: 3000 });
    await userEvent.type(amount, "1000");
    await userEvent.tab();

    expect(screen.getByText("언제까지 모을까요?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^마감일/ })).toBeInTheDocument();
  });

  it("마감일을 확정하면 공개일이 나타나고 제목과 안내 문구가 바뀐다", async () => {
    renderStep();
    await goToReveal();

    expect(screen.getByText("민지에게 언제 공개할까요?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^펀딩 공개일/ })).toBeInTheDocument();
    expect(screen.getByText("공개 시간은 밤 12시예요")).toBeInTheDocument();
    // 공개일을 정하기 전에는 다음 버튼이 없다
    expect(screen.queryByRole("button", { name: "다음" })).not.toBeInTheDocument();
  });

  it("공개일을 마감일 다음 날로 고르면 다음 버튼이 나타나고 누르면 값으로 onNext를 호출한다", async () => {
    const onNext = vi.fn();
    renderStep({ onNext });
    await goToReveal();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^펀딩 공개일/ }));
    // 고를 수 있는 날짜가 마감일 다음 날 하나뿐이라 휠이 그 날짜로 열린다
    const sheet = screen.getByRole("dialog", { name: "펀딩 공개일 선택" });
    await user.click(within(sheet).getByRole("button", { name: "확인" }));
    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(onNext).toHaveBeenCalledWith({
      targetAmount: "1000",
      deadline: "2027-12-25",
      revealDate: "2027-12-26",
    });
  });

  describe("생일 사용 칩", () => {
    it("생일 정보가 없으면 칩을 보여주지 않는다", async () => {
      renderStep();
      await goToReveal();

      expect(screen.queryByRole("button", { name: /생일 .* 사용/ })).not.toBeInTheDocument();
    });

    it("칩을 누르면 생일이 공개일에 채워지고 마감일은 생일 전날로 맞춰진다", async () => {
      // 2026-11-13 기준 121일 뒤 = 2027-03-14
      renderStep({ recipientBirthday: "03-14", recipientBirthdayDday: 121 });
      await goToReveal();

      await userEvent.click(screen.getByRole("button", { name: "생일 3월 14일 사용" }));

      expect(screen.getByRole("button", { name: /^펀딩 공개일.*2027.03.14/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^마감일.*2027.03.13/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
    });

    it("생일이 오늘이면 마감일을 만들 수 없어 칩이 비활성화된다", async () => {
      renderStep({ recipientBirthday: "11-13", recipientBirthdayDday: 0 });
      await goToReveal();

      expect(screen.getByRole("button", { name: "생일 11월 13일 사용" })).toBeDisabled();
    });
  });

  it("마감일을 다시 고르면 허용 범위를 벗어난 공개일은 비워진다", async () => {
    renderStep({ recipientBirthday: "12-26", recipientBirthdayDday: 408 });
    await goToReveal();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "생일 12월 26일 사용" }));

    await user.click(screen.getByRole("button", { name: /^마감일/ }));
    await pickWheelDate(user, { year: 2027, month: 12, day: 27 });

    expect(screen.getByRole("button", { name: "펀딩 공개일 선택해주세요" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다음" })).not.toBeInTheDocument();
  });
});

describe("SurpriseInfoStep 수정 모드", () => {
  const initialValues = {
    targetAmount: "429000",
    deadline: "2099-11-13",
    revealDate: "2099-11-14",
  };

  it("입력했던 값이 모두 채워져 있고 수정 완료가 비활성화돼 있다", () => {
    renderStep({ initialValues, submitLabel: "수정 완료" });

    expect(screen.getByLabelText("목표 금액")).toHaveValue("429,000");
    expect(screen.getByRole("button", { name: /^펀딩 공개일.*2099\.11\.14/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수정 완료" })).toBeDisabled();
  });

  it("목표 금액을 바꾸면 수정 완료가 활성화되고 누르면 바뀐 값으로 onNext를 호출한다", async () => {
    const onNext = vi.fn();
    renderStep({ initialValues, submitLabel: "수정 완료", onNext });

    fireEvent.change(screen.getByLabelText("목표 금액"), { target: { value: "500000" } });
    await userEvent.click(screen.getByRole("button", { name: "수정 완료" }));

    expect(onNext).toHaveBeenCalledWith({ ...initialValues, targetAmount: "500000" });
  });
});
