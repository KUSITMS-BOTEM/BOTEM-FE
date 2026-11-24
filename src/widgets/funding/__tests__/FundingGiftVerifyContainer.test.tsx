import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useCompleteGiftVerificationMutation } from "@/hooks/mutations/gift-verification/useCompleteGiftVerificationMutation";
import { useGiftVerificationTargetsQuery } from "@/hooks/queries/home/useGiftVerificationTargetsQuery";
import { useShareLink } from "@/hooks/useShareLink";
import type { GiftVerificationTargetResponse } from "@/types/home/home";
import FundingGiftVerifyContainer from "@/widgets/funding/FundingGiftVerifyContainer";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useParams: () => ({ fundingId: "12" }),
}));
vi.mock("@/hooks/queries/home/useGiftVerificationTargetsQuery");
vi.mock("@/hooks/mutations/gift-verification/useCompleteGiftVerificationMutation");
vi.mock("@/hooks/queries/funding/useFundingManagementQuery");
vi.mock("@/hooks/useShareLink");
vi.mock("@/components/effects/hero-motion/HeroMotion", () => ({ default: () => null }));
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
const share = vi.fn();

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
  vi.mocked(useShareLink).mockReturnValue({ toast: null, share, copyLink: vi.fn() });
  vi.mocked(useCompleteGiftVerificationMutation).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useCompleteGiftVerificationMutation>);
  vi.mocked(useFundingManagementQuery).mockReturnValue({
    data: undefined,
    isError: false,
  } as unknown as ReturnType<typeof useFundingManagementQuery>);
});

const managementData = {
  shareKey: "abc123",
  type: "BIRTHDAY",
  title: null,
  celebrantName: "세윤",
  product: { name: "에어팟", imageUrl: "/airpods.png" },
  deadline: "2026-10-13T23:59:59",
  targetAmount: 300000,
  confirmedPercentage: 100,
  participants: [],
  participantCount: 0,
};

const renderAfterVerified = () => {
  mockQuery({ targets: [] });
  vi.mocked(useCompleteGiftVerificationMutation).mockReturnValue({
    mutate,
    isPending: false,
    isSuccess: true,
  } as unknown as ReturnType<typeof useCompleteGiftVerificationMutation>);
  vi.mocked(useFundingManagementQuery).mockReturnValue({
    data: managementData,
    isError: false,
  } as unknown as ReturnType<typeof useFundingManagementQuery>);
  render(<FundingGiftVerifyContainer />);
};

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

  it("사진과 감사 메세지를 채워 보내면 대상 정보로 인증을 요청한다", async () => {
    mockQuery({ targets: [target] });
    const { container } = render(<FundingGiftVerifyContainer />);
    const photo = new File(["dummy"], "gift.png", { type: "image/png" });
    await userEvent.upload(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      photo,
    );
    await userEvent.type(screen.getByRole("textbox"), "고마워!");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "선물 도착 인증 보내기" })).toBeEnabled(),
    );

    await userEvent.click(screen.getByRole("button", { name: "선물 도착 인증 보내기" }));

    expect(mutate).toHaveBeenCalledWith({
      giftVerificationId: 101,
      image: photo,
      thankYouMessage: "고마워!",
      replacementProductName: null,
    });
  });

  it("인증을 보내고 나면 함께한 친구 공유 시트를 띄우고, 공유 키를 받기 전에 닫으면 /home으로 replace한다", async () => {
    mockQuery({ targets: [target] });
    vi.mocked(useCompleteGiftVerificationMutation).mockReturnValue({
      mutate,
      isPending: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useCompleteGiftVerificationMutation>);
    vi.mocked(useFundingManagementQuery).mockReturnValue({
      data: undefined,
      isError: false,
    } as unknown as ReturnType<typeof useFundingManagementQuery>);

    render(<FundingGiftVerifyContainer />);

    const sheet = screen.getByRole("dialog", { name: "공유하기" });
    expect(sheet).toBeInTheDocument();
    expect(useFundingManagementQuery).toHaveBeenCalledWith(12, { enabled: true });

    await userEvent.click(within(sheet).getByRole("button", { name: "닫기" }));

    expect(replace).toHaveBeenCalledWith("/home");
  });

  it("공유 시트를 닫으면 친구들이 보게 될 인증 결과 화면으로 replace한다", async () => {
    mockQuery({ targets: [target] });
    vi.mocked(useCompleteGiftVerificationMutation).mockReturnValue({
      mutate,
      isPending: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useCompleteGiftVerificationMutation>);
    vi.mocked(useFundingManagementQuery).mockReturnValue({
      data: {
        shareKey: "abc123",
        type: "BIRTHDAY",
        title: null,
        celebrantName: "세윤",
        product: { name: "에어팟", imageUrl: "/airpods.png" },
        deadline: "2026-10-13T23:59:59",
        targetAmount: 300000,
        confirmedPercentage: 100,
        participants: [],
        participantCount: 0,
      },
      isError: false,
    } as unknown as ReturnType<typeof useFundingManagementQuery>);
    render(<FundingGiftVerifyContainer />);

    const sheet = screen.getByRole("dialog", { name: "공유하기" });
    await userEvent.click(within(sheet).getByRole("button", { name: "닫기" }));

    expect(replace).toHaveBeenCalledWith("/share/abc123/gift");
  });

  describe("공유 완료", () => {
    const shareFromSheet = async () => {
      share.mockResolvedValue(true);
      renderAfterVerified();
      await userEvent.click(screen.getByRole("button", { name: "친구에게 공유하기" }));
    };

    it("기기 공유창으로 보내면 시트를 닫고 보냈다는 완료 화면을 보여준다", async () => {
      await shareFromSheet();

      expect(
        await screen.findByText("보태준 친구들에게\n선물 도착 인증을 보냈어요!", {
          normalizer: text => text,
        }),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.queryByRole("dialog", { name: "공유하기" })).not.toBeInTheDocument(),
      );
      expect(screen.queryByText("인증할 선물이 없어요")).not.toBeInTheDocument();
    });

    it("공유창을 닫았으면 완료 화면으로 넘어가지 않는다", async () => {
      share.mockResolvedValue(false);
      renderAfterVerified();

      await userEvent.click(screen.getByRole("button", { name: "친구에게 공유하기" }));

      expect(screen.getByRole("dialog", { name: "공유하기" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "완료하기" })).not.toBeInTheDocument();
    });

    it("완료 화면에서 '완료하기'를 누르면 /home으로 replace한다", async () => {
      await shareFromSheet();

      await userEvent.click(await screen.findByRole("button", { name: "완료하기" }));

      await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
    });

    it("완료 화면에서 닫기(X)를 누르면 /home으로 replace한다", async () => {
      await shareFromSheet();
      await screen.findByRole("button", { name: "완료하기" });

      await userEvent.click(
        within(screen.getByRole("banner")).getByRole("button", { name: "닫기" }),
      );

      await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
      expect(replace).not.toHaveBeenCalledWith("/share/abc123/gift");
    });
  });
});
