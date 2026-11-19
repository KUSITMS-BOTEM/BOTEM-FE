import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useGiftVerificationTargetsQuery } from "@/hooks/queries/home/useGiftVerificationTargetsQuery";
import type { GiftVerificationTargetResponse } from "@/types/home/home";
import GiftVerificationBottomSheet from "@/widgets/home/GiftVerificationBottomSheet";

vi.mock("@/hooks/queries/home/useGiftVerificationTargetsQuery");

const refetch = vi.fn();

const makeTarget = (
  giftVerificationId: number,
  fundingDeadline: string,
): GiftVerificationTargetResponse => ({
  giftVerificationId,
  fundingId: giftVerificationId * 10,
  productName: `상품${giftVerificationId}`,
  productImageUrl: `/product-${giftVerificationId}.png`,
  fundingDeadline,
  participantCount: 4,
  replacementProductName: null,
});

const mockQuery = (state: { targets?: GiftVerificationTargetResponse[]; isError?: boolean }) => {
  vi.mocked(useGiftVerificationTargetsQuery).mockReturnValue({
    data: state.targets
      ? { pendingCount: state.targets.length, targets: state.targets }
      : undefined,
    isError: state.isError ?? false,
    refetch,
  } as unknown as ReturnType<typeof useGiftVerificationTargetsQuery>);
};

const renderSheet = (onVerify = vi.fn()) =>
  render(<GiftVerificationBottomSheet open onClose={vi.fn()} onVerify={onVerify} />);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GiftVerificationBottomSheet", () => {
  it("로딩 중에는 스켈레톤(role=status)을 보여준다", () => {
    mockQuery({});

    renderSheet();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("인증 대상을 마감이 이른 순서로 보여준다", () => {
    mockQuery({
      targets: [makeTarget(1, "2026-10-13T23:59:59"), makeTarget(2, "2026-09-30T23:59:59")],
    });

    renderSheet();

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("상품2")).toBeInTheDocument();
    expect(within(rows[1]).getByText("상품1")).toBeInTheDocument();
  });

  it("행의 '인증하기'를 누르면 해당 fundingId로 onVerify를 호출한다", async () => {
    const onVerify = vi.fn();
    mockQuery({ targets: [makeTarget(1, "2026-10-13T23:59:59")] });
    renderSheet(onVerify);

    await userEvent.click(screen.getByRole("button", { name: "인증하기" }));

    expect(onVerify).toHaveBeenCalledWith(10);
  });

  it("목록이 비어 있으면 안내 문구를 보여준다", () => {
    mockQuery({ targets: [] });

    renderSheet();

    expect(screen.getByText("인증할 선물을 모두 인증했어요")).toBeInTheDocument();
  });

  it("에러면 '다시 시도'로 재요청한다", async () => {
    mockQuery({ isError: true });
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
