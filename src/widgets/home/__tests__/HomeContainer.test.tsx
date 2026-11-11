import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HomeContainer from "@/widgets/home/HomeContainer";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));
vi.mock("@/hooks/mutations/auth/useLogoutMutation", () => ({
  useLogoutMutation: () => ({ mutate: vi.fn() }),
}));
vi.mock("@/hooks/mutations/user/useWithdrawMutation", () => ({
  useWithdrawMutation: () => ({ mutate: vi.fn() }),
}));
vi.mock("@/utils/wish/wishPromptStorage", () => ({ consumeWishPromptPending: () => false }));
vi.mock("@/widgets/wish/AddWishBottomSheet", () => ({ default: () => null }));
vi.mock("@/widgets/funding/FundingOpenSheet", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>펀딩 열기 시트</div> : null),
}));

describe("HomeContainer", () => {
  it("초기에는 펀딩 열기 시트가 닫혀 있다", () => {
    render(<HomeContainer />);

    expect(screen.queryByText("펀딩 열기 시트")).not.toBeInTheDocument();
  });

  it("펀딩 열기 버튼을 누르면 펀딩 열기 시트가 열린다", async () => {
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "펀딩 열기" }));

    expect(screen.getByText("펀딩 열기 시트")).toBeInTheDocument();
  });
});
