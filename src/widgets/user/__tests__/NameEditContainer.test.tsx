import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import NameEditContainer from "@/widgets/user/NameEditContainer";

const back = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ back }) }));
vi.mock("@/hooks/queries/user/useMyProfileQuery");

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useMyProfileQuery).mockReturnValue({
    data: { nickname: "지유" },
  } as unknown as ReturnType<typeof useMyProfileQuery>);
});

describe("NameEditContainer", () => {
  it("현재 이름으로 입력창을 채운다", () => {
    render(<NameEditContainer />);

    expect(screen.getByLabelText("이름")).toHaveValue("지유");
    expect(screen.getByRole("button", { name: "수정 완료" })).toBeEnabled();
  });

  it("이름을 비우거나 공백만 남기면 수정 완료가 비활성이다", async () => {
    render(<NameEditContainer />);
    const input = screen.getByLabelText("이름");
    const submit = screen.getByRole("button", { name: "수정 완료" });

    await userEvent.clear(input);
    expect(submit).toBeDisabled();

    await userEvent.type(input, "   ");
    expect(submit).toBeDisabled();

    await userEvent.type(input, "보탬");
    expect(submit).toBeEnabled();
  });

  it("뒤로 가기는 이전 화면으로 돌아간다", async () => {
    render(<NameEditContainer />);

    await userEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(back).toHaveBeenCalled();
  });
});
