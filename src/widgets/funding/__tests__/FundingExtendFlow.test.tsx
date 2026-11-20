import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useExtendFundingMutation } from "@/hooks/mutations/funding/useExtendFundingMutation";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useFundingExtendToastStore } from "@/store/fundingExtendToastStore";
import { useGiftChangeStore } from "@/store/giftChangeStore";
import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";
import FundingExtendFlow from "@/widgets/funding/FundingExtendFlow";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/hooks/queries/funding/useFundingManagementQuery", () => ({
  useFundingManagementQuery: vi.fn(),
}));
vi.mock("@/hooks/mutations/funding/useExtendFundingMutation", () => ({
  useExtendFundingMutation: vi.fn(),
}));

const extendMutate = vi.fn();

// 시트는 마감일만 읽으므로 나머지 필드는 채우지 않는다
const mockManagement = (deadline?: string) => {
  vi.mocked(useFundingManagementQuery).mockReturnValue({
    data: deadline ? ({ deadline } as OwnerFundingDetailResponse) : undefined,
  } as unknown as ReturnType<typeof useFundingManagementQuery>);
  vi.mocked(useExtendFundingMutation).mockReturnValue({
    mutate: extendMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useExtendFundingMutation>);
};

beforeEach(() => {
  vi.clearAllMocks();
  useFundingExtendToastStore.setState({ pending: false });
});

describe("FundingExtendFlow", () => {
  it("관리 상세(마감일)가 아직 없으면 열려 있어도 시트를 렌더하지 않는다", () => {
    mockManagement();

    render(<FundingExtendFlow fundingId={7} open collectedAmount={0} onClose={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "연장하기" })).not.toBeInTheDocument();
  });

  it("관리 상세가 있으면 그 마감일을 기존 마감일로 보여준다", () => {
    mockManagement("2026-11-13T23:59:59.999999");

    render(<FundingExtendFlow fundingId={7} open collectedAmount={0} onClose={vi.fn()} />);

    expect(screen.getByText(/기존 마감일은 11월 13일까지에요/)).toBeInTheDocument();
  });

  it("연장에 성공하면 연장 토스트를 예약하고 선물 변경 상태를 비운 뒤 펀딩 상세로 replace 한다", async () => {
    mockManagement("2026-11-13T23:59:59.999999");
    extendMutate.mockImplementation((_date: string, options: { onSuccess: () => void }) =>
      options.onSuccess(),
    );
    useGiftChangeStore.getState().start(7, null);
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 13));
    const user = userEvent.setup();
    render(<FundingExtendFlow fundingId={7} open collectedAmount={0} onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "새 마감일 날짜를 선택해주세요" }));
    await user.click(screen.getByRole("button", { name: /11월 20일/ }));
    await user.click(screen.getByRole("button", { name: "연장하기" }));
    vi.useRealTimers();

    expect(extendMutate.mock.calls[0][0]).toBe("2026-11-20");
    expect(useFundingExtendToastStore.getState().pending).toBe(true);
    expect(useGiftChangeStore.getState().fundingId).toBeNull();
    expect(replace).toHaveBeenCalledWith("/funding/7");
  });
});
