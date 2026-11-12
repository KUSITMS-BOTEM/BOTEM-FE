import { fireEvent, render, screen } from "@testing-library/react";

import { mockPointer } from "@/__tests__/mockPointer";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import BirthdayEditContainer from "@/widgets/user/BirthdayEditContainer";

vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn() }) }));
vi.mock("@/hooks/queries/user/useMyProfileQuery");

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

const mockBirthday = (birthday: string | null) =>
  vi.mocked(useMyProfileQuery).mockReturnValue({
    data: { birthday },
  } as unknown as ReturnType<typeof useMyProfileQuery>);

beforeEach(() => {
  mockPointer("coarse");
  vi.clearAllMocks();
});

describe("BirthdayEditContainer", () => {
  it("현재 생일을 'M월 D일'로 보여준다", () => {
    mockBirthday("10-13");
    render(<BirthdayEditContainer />);

    expect(screen.getByText("10월 13일")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수정 완료" })).toBeEnabled();
  });

  it("생일이 없으면 수정 완료가 비활성이고, 날짜를 고르면 표시되며 활성이 된다", () => {
    mockBirthday(null);
    const { container } = render(<BirthdayEditContainer />);
    const submit = screen.getByRole("button", { name: "수정 완료" });

    expect(submit).toBeDisabled();

    fireEvent.change(container.querySelector('input[type="date"]')!, {
      target: { value: "2000-03-07" },
    });

    expect(screen.getByText("3월 7일")).toBeInTheDocument();
    expect(submit).toBeEnabled();
  });
});
