import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useReducedMotion } from "framer-motion";

import { useChooseGiftMutation } from "@/hooks/mutations/funding/useChooseGiftMutation";
import { useSurpriseRevealQuery } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { useGiftChangeStore } from "@/store/giftChangeStore";
import { ApiError } from "@/types/api";
import SurpriseResultContainer from "@/widgets/funding/SurpriseResultContainer";

const replace = vi.fn();
const push = vi.fn();
const refetch = vi.fn();
const chooseGift = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
}));
vi.mock("@/hooks/mutations/funding/useChooseGiftMutation", () => ({
  useChooseGiftMutation: vi.fn(),
}));
vi.mock("framer-motion", async importOriginal => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: vi.fn(),
}));
vi.mock("@/hooks/queries/funding/useSurpriseRevealQuery", () => ({
  useSurpriseRevealQuery: vi.fn(),
}));
vi.mock("@/widgets/funding/SurpriseResultView", () => ({
  default: ({
    surprise,
    reduceMotion,
    onClose,
    onBuy,
    onChangeGift,
  }: {
    surprise: { productName: string };
    reduceMotion: boolean;
    onClose: () => void;
    onBuy: () => void;
    onChangeGift: () => void;
  }) => (
    <div data-testid="result-view" data-reduce={String(reduceMotion)}>
      {surprise.productName}
      <button onClick={onClose}>홈으로 가기</button>
      <button onClick={onBuy}>차액으로 구매</button>
      <button onClick={onChangeGift}>다른 선물 고르기</button>
    </div>
  ),
}));
vi.mock("@/widgets/funding/skeleton/SurpriseDetailViewSkeleton", () => ({
  default: () => <div data-testid="skeleton" />,
}));

type QueryState = {
  data?: unknown;
  error?: unknown;
  isError?: boolean;
  isSuccess?: boolean;
};

const mockQuery = (state: QueryState) => {
  vi.mocked(useSurpriseRevealQuery).mockReturnValue({
    data: undefined,
    error: null,
    isError: false,
    isSuccess: false,
    refetch,
    ...state,
  } as unknown as ReturnType<typeof useSurpriseRevealQuery>);
};

const makeTab = () => ({ opener: {}, location: { href: "" }, close: vi.fn() }) as unknown as Window;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useReducedMotion).mockReturnValue(false);
  vi.mocked(useChooseGiftMutation).mockReturnValue({
    mutateAsync: chooseGift,
    isPending: false,
  } as unknown as ReturnType<typeof useChooseGiftMutation>);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SurpriseResultContainer", () => {
  it("조회 중이면 스켈레톤을 보인다", () => {
    mockQuery({});

    render(<SurpriseResultContainer fundingId="9" />);

    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("공개 전(FUNDING_016)이면 잠금 화면을 보인다", () => {
    mockQuery({ isError: true, error: new ApiError("FUNDING_016") });

    render(<SurpriseResultContainer fundingId="9" />);

    expect(screen.getByText("아직 비밀이에요")).toBeInTheDocument();
  });

  it("그 외 조회 실패면 에러 화면에서 다시 시도로 재조회한다", async () => {
    mockQuery({ isError: true, error: new ApiError("COMMON_500") });
    render(<SurpriseResultContainer fundingId="9" />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("성공했는데 데이터가 없으면 에러 화면을 보인다", () => {
    mockQuery({ isSuccess: true });

    render(<SurpriseResultContainer fundingId="9" />);

    expect(screen.getByText("잠시 문제가 생겼어요")).toBeInTheDocument();
  });

  it("에러 화면에서 닫기를 누르면 홈으로 이동한다", async () => {
    mockQuery({ isError: true, error: new Error("boom") });
    render(<SurpriseResultContainer fundingId="9" />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(replace).toHaveBeenCalledWith("/home");
  });

  it("성공하면 결과 화면을 보이고 홈으로 가기를 누르면 홈으로 이동한다", async () => {
    mockQuery({ data: { productName: "무선 헤드폰" }, isSuccess: true });
    render(<SurpriseResultContainer fundingId="9" />);

    expect(screen.getByTestId("result-view")).toHaveTextContent("무선 헤드폰");
    await userEvent.click(screen.getByRole("button", { name: "홈으로 가기" }));

    expect(replace).toHaveBeenCalledWith("/home");
  });

  it("모션 줄이기 설정이면 결과 화면에 reduceMotion을 켜서 넘긴다", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    mockQuery({ data: { productName: "무선 헤드폰" }, isSuccess: true });

    render(<SurpriseResultContainer fundingId="9" />);

    expect(screen.getByTestId("result-view")).toHaveAttribute("data-reduce", "true");
  });

  it("구매를 누르면 선물 선택을 저장하고 응답의 쿠팡 링크로 미리 연 탭을 보낸다", async () => {
    const tab = makeTab();
    vi.spyOn(window, "open").mockImplementation(() => tab);
    chooseGift.mockResolvedValue({ productUrl: "https://www.coupang.com/vp/products/1" });
    mockQuery({ data: { productName: "무선 헤드폰" }, isSuccess: true });
    render(<SurpriseResultContainer fundingId="9" />);

    await userEvent.click(screen.getByRole("button", { name: "차액으로 구매" }));

    expect(chooseGift).toHaveBeenCalledTimes(1);
    expect(tab.location.href).toBe("https://www.coupang.com/vp/products/1");
  });

  it("선물 선택 저장이 실패하면 미리 연 탭을 닫는다", async () => {
    const tab = makeTab();
    vi.spyOn(window, "open").mockImplementation(() => tab);
    chooseGift.mockRejectedValue(new ApiError("FUNDING_015"));
    mockQuery({ data: { productName: "무선 헤드폰" }, isSuccess: true });
    render(<SurpriseResultContainer fundingId="9" />);

    await userEvent.click(screen.getByRole("button", { name: "차액으로 구매" }));

    expect(tab.close).toHaveBeenCalled();
    expect(tab.location.href).toBe("");
  });

  it("다른 선물 고르기를 누르면 서프라이즈 선물 변경 화면으로 이동한다", async () => {
    mockQuery({ data: { productName: "무선 헤드폰" }, isSuccess: true });
    render(<SurpriseResultContainer fundingId="9" />);

    await userEvent.click(screen.getByRole("button", { name: "다른 선물 고르기" }));

    expect(push).toHaveBeenCalledWith("/surprised/9/change-gift");
  });

  it("홈으로 가면 다른 선물 고르기에서 기억해 둔 기존 선물을 지운다", async () => {
    useGiftChangeStore.getState().start(9, null, true);
    mockQuery({ data: { productName: "무선 헤드폰" }, isSuccess: true });
    render(<SurpriseResultContainer fundingId="9" />);

    await userEvent.click(screen.getByRole("button", { name: "홈으로 가기" }));

    expect(useGiftChangeStore.getState().fundingId).toBeNull();
    expect(useGiftChangeStore.getState().surprise).toBe(false);
  });
});
