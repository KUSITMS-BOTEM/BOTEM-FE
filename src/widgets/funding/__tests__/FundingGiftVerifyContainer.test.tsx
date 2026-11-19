import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useCompleteGiftVerificationMutation } from "@/hooks/mutations/gift-verification/useCompleteGiftVerificationMutation";
import { useGiftVerificationTargetsQuery } from "@/hooks/queries/home/useGiftVerificationTargetsQuery";
import type { GiftVerificationTargetResponse } from "@/types/home/home";
import FundingGiftVerifyContainer from "@/widgets/funding/FundingGiftVerifyContainer";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useParams: () => ({ fundingId: "12" }),
}));
vi.mock("@/hooks/queries/home/useGiftVerificationTargetsQuery");
vi.mock("@/hooks/mutations/gift-verification/useCompleteGiftVerificationMutation");
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock-url");
  URL.revokeObjectURL = vi.fn();
  global.createImageBitmap = vi.fn(() =>
    Promise.resolve({ close: vi.fn() }),
  ) as unknown as typeof createImageBitmap;
});

const refetch = vi.fn();
const mutate = vi.fn();

const target: GiftVerificationTargetResponse = {
  giftVerificationId: 101,
  fundingId: 12,
  productName: "에어팟",
  productImageUrl: "/airpods.png",
  fundingDeadline: "2026-10-13T23:59:59",
  participantCount: 6,
  replacementProductName: null,
};

const mockQuery = (state: {
  targets?: GiftVerificationTargetResponse[];
  isLoading?: boolean;
  isError?: boolean;
}) => {
  vi.mocked(useGiftVerificationTargetsQuery).mockReturnValue({
    data: state.targets
      ? { pendingCount: state.targets.length, targets: state.targets }
      : undefined,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
    refetch,
  } as unknown as ReturnType<typeof useGiftVerificationTargetsQuery>);
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useCompleteGiftVerificationMutation).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useCompleteGiftVerificationMutation>);
});

describe("FundingGiftVerifyContainer", () => {
  it("목록을 불러오는 중에는 로딩 상태를 보여준다", () => {
    mockQuery({ isLoading: true });

    render(<FundingGiftVerifyContainer />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("목록 조회에 실패하면 '다시 시도'로 재요청한다", async () => {
    mockQuery({ isError: true });
    render(<FundingGiftVerifyContainer />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("받아둔 목록이 있으면 다시 불러오기에 실패해도 작성 화면을 유지한다", () => {
    mockQuery({ targets: [target], isError: true });

    render(<FundingGiftVerifyContainer />);

    expect(screen.getByRole("button", { name: "선물 도착 인증 보내기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("해당 fundingId의 인증 대상이 없으면 '홈으로 가기'로 /home에 replace한다", async () => {
    mockQuery({ targets: [{ ...target, fundingId: 99 }] });
    render(<FundingGiftVerifyContainer />);

    await userEvent.click(screen.getByRole("button", { name: "홈으로 가기" }));

    expect(replace).toHaveBeenCalledWith("/home");
  });

  it("제출이 성공한 뒤 홈으로 넘어가는 동안에는 보내기 버튼을 잠근다", () => {
    mockQuery({ targets: [target] });
    vi.mocked(useCompleteGiftVerificationMutation).mockReturnValue({
      mutate,
      isPending: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useCompleteGiftVerificationMutation>);

    render(<FundingGiftVerifyContainer />);

    expect(screen.getByRole("button", { name: "선물 도착 인증 보내기" })).toBeDisabled();
  });

  it("제출이 성공하면 /home으로 replace한다", async () => {
    mockQuery({ targets: [target] });
    mutate.mockImplementation((_variables, options: { onSuccess?: () => void }) =>
      options.onSuccess?.(),
    );
    const { container } = render(<FundingGiftVerifyContainer />);
    const photo = new File(["dummy"], "gift.png", { type: "image/png" });
    await userEvent.upload(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      photo,
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "선물 도착 인증 보내기" })).toBeEnabled(),
    );

    await userEvent.click(screen.getByRole("button", { name: "선물 도착 인증 보내기" }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ giftVerificationId: 101, image: photo }),
      expect.anything(),
    );
    expect(replace).toHaveBeenCalledWith("/home");
  });
});
