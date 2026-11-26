import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import { useWishToastStore } from "@/store/wishToastStore";
import { useDeleteWishMutation } from "@/hooks/mutations/wish/useDeleteWishMutation";
import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import { useWishQuery } from "@/hooks/queries/wish/useWishQuery";
import { ApiError } from "@/types/api";
import type { WishResponse } from "@/types/wish/wish";
import WishDetailContainer from "@/widgets/wish/WishDetailContainer";

vi.mock("@/hooks/mutations/funding/useCreateFundingMutation", () => ({
  useCreateFundingMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/hooks/queries/user/useMyProfileQuery", () => ({
  useMyProfileQuery: () => ({ data: { name: "민지" } }),
}));
vi.mock("@/hooks/queries/wish/useWishQuery", () => ({ useWishQuery: vi.fn() }));
vi.mock("@/hooks/queries/home/useHomeFundingsQuery", () => ({ useHomeFundingsQuery: vi.fn() }));
vi.mock("@/hooks/mutations/wish/useDeleteWishMutation", () => ({
  useDeleteWishMutation: vi.fn(),
}));

const replace = vi.fn();
const back = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, back, push }),
  useParams: () => ({ wishId: "1" }),
  notFound: vi.fn(),
}));

// jsdom은 HTMLDialogElement의 showModal/close를 구현하지 않아 open 속성만 토글하도록 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

const mockWish: WishResponse = {
  id: 1,
  productName: "에어팟 프로 3",
  productImageUrl: "https://example.com/airpods.png",
  price: 359000,
  productUrl: "https://example.com/airpods",
  sellerName: "쿠팡 Apple 공식 브랜드관",
  status: "AVAILABLE",
  fundingId: null,
};

const refetch = vi.fn();
const deleteWish = vi.fn();

const mockWishQuery = (value: Partial<ReturnType<typeof useWishQuery>>) => {
  vi.mocked(useWishQuery).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    refetch,
    ...value,
  } as ReturnType<typeof useWishQuery>);
};

const mockHomeFundings = (canOpenFunding?: boolean, isPending = false, isError = false) => {
  vi.mocked(useHomeFundingsQuery).mockReturnValue({
    data: canOpenFunding === undefined ? undefined : { canOpenFunding },
    isPending,
    isError,
  } as unknown as ReturnType<typeof useHomeFundingsQuery>);
};

const LIMIT_MESSAGE = "펀딩은 최대 5개까지만 열 수 있어요";

describe("WishDetailContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHomeFundings(true);
    vi.mocked(useDeleteWishMutation).mockReturnValue({
      mutate: deleteWish,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteWishMutation>);
  });

  it("위시가 로드되면 상품명·가격과 '이 상품으로 펀딩 열기' 버튼을 보여준다", () => {
    mockWishQuery({ data: mockWish });

    render(<WishDetailContainer />);

    expect(screen.getByText("에어팟 프로 3")).toBeInTheDocument();
    expect(screen.getByText("359,000원")).toBeInTheDocument();
    expect(screen.getByText("쿠팡 Apple 공식 브랜드관")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이 상품으로 펀딩 열기" })).toBeInTheDocument();
  });

  it("'이 상품으로 펀딩 열기'를 누르면 금액 정보 시트가 열린다", async () => {
    const user = userEvent.setup();
    mockWishQuery({ data: mockWish });

    render(<WishDetailContainer />);
    expect(screen.queryByRole("dialog", { name: "금액 정보" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "이 상품으로 펀딩 열기" }));

    expect(screen.getByRole("dialog", { name: "금액 정보" })).toHaveAttribute("open");
  });

  it("판매처를 누르면 상품 링크를 새 탭으로 연다", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    mockWishQuery({ data: mockWish });

    render(<WishDetailContainer />);
    await user.click(screen.getByRole("button", { name: /쿠팡 Apple 공식 브랜드관/ }));

    expect(open).toHaveBeenCalledWith(mockWish.productUrl, "_blank", "noopener,noreferrer");
    open.mockRestore();
  });

  it("상품 링크가 http/https가 아니면 판매처를 눌러도 열지 않는다", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    mockWishQuery({ data: { ...mockWish, productUrl: "javascript:alert(1)" } });

    render(<WishDetailContainer />);
    await user.click(screen.getByRole("button", { name: /쿠팡 Apple 공식 브랜드관/ }));

    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it("로딩 중이면 스켈레톤만 보이고 상품명과 CTA 버튼은 렌더하지 않는다", () => {
    mockWishQuery({ isLoading: true });

    render(<WishDetailContainer />);

    expect(screen.queryByText("에어팟 프로 3")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "이 상품으로 펀딩 열기" })).not.toBeInTheDocument();
  });

  it("위시가 없으면 안내 문구를 보여주고 '다시 시도'를 누르면 refetch를 호출한다", async () => {
    const user = userEvent.setup();
    mockWishQuery({ data: undefined });

    render(<WishDetailContainer />);

    expect(screen.getByText("위시 정보를 불러오지 못했어요")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("삭제 아이콘을 누르면 확인 다이얼로그가 열리고 '예'를 누르면 deleteWish가 호출된다", async () => {
    const user = userEvent.setup();
    mockWishQuery({ data: mockWish });

    render(<WishDetailContainer />);
    expect(screen.getByText("내 위시에서 제거할까요?").closest("dialog")).not.toHaveAttribute(
      "open",
    );

    await user.click(screen.getByRole("button", { name: "삭제" }));
    expect(screen.getByRole("dialog", { name: "내 위시에서 제거할까요?" })).toHaveAttribute("open");

    await user.click(screen.getByRole("button", { name: "예" }));
    expect(deleteWish).toHaveBeenCalledTimes(1);
  });

  it("다이얼로그에서 '아니오'를 누르면 닫히고 deleteWish는 호출되지 않는다", async () => {
    const user = userEvent.setup();
    mockWishQuery({ data: mockWish });

    render(<WishDetailContainer />);
    await user.click(screen.getByRole("button", { name: "삭제" }));
    await user.click(screen.getByRole("button", { name: "아니오" }));

    expect(screen.getByText("내 위시에서 제거할까요?").closest("dialog")).not.toHaveAttribute(
      "open",
    );
    expect(deleteWish).not.toHaveBeenCalled();
  });

  it("펀딩 진행 중이면 뱃지·안내 문구·펀딩 CTA를 보여주고 삭제 버튼은 숨긴다", () => {
    mockWishQuery({ data: { ...mockWish, status: "FUNDING", fundingId: 5 } });

    render(<WishDetailContainer />);

    expect(screen.getByText("펀딩 중")).toBeInTheDocument();
    expect(screen.getByText("펀딩 진행중인 위시 상품은 삭제할 수 없어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "해당 상품 펀딩 보러가기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "이 상품으로 펀딩 열기" })).not.toBeInTheDocument();
  });

  it("펀딩 CTA를 누르면 해당 펀딩 페이지로 이동한다", async () => {
    const user = userEvent.setup();
    mockWishQuery({ data: { ...mockWish, status: "FUNDING", fundingId: 5 } });

    render(<WishDetailContainer />);
    await user.click(screen.getByRole("button", { name: "해당 상품 펀딩 보러가기" }));

    expect(push).toHaveBeenCalledWith("/funding/5");
  });

  it("펀딩 상태인데 fundingId가 없으면 펀딩 중으로 다루지 않아 죽은 CTA를 보여주지 않는다", () => {
    mockWishQuery({ data: { ...mockWish, status: "FUNDING", fundingId: null } });

    render(<WishDetailContainer />);

    expect(
      screen.queryByRole("button", { name: "해당 상품 펀딩 보러가기" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("펀딩 중")).not.toBeInTheDocument();
  });

  it("위시 담기 직후 이동해 왔으면 추가 토스트를 보여준다", () => {
    useWishToastStore.setState({ pending: "added" });
    mockWishQuery({ data: mockWish });

    render(<WishDetailContainer />);

    expect(screen.getByText("위시에 추가됐어요")).toBeInTheDocument();
  });

  it("담기 이력 없이 진입하면 추가 토스트가 없다", () => {
    useWishToastStore.setState({ pending: null });
    mockWishQuery({ data: mockWish });

    render(<WishDetailContainer />);

    expect(screen.queryByText("위시에 추가됐어요")).not.toBeInTheDocument();
  });

  it("펀딩 중이 아니면 뱃지와 삭제 불가 안내를 보여주지 않는다", () => {
    mockWishQuery({ data: mockWish });

    render(<WishDetailContainer />);

    expect(screen.queryByText("펀딩 중")).not.toBeInTheDocument();
    expect(
      screen.queryByText("펀딩 진행중인 위시 상품은 삭제할 수 없어요"),
    ).not.toBeInTheDocument();
  });

  it("펀딩 개설 한도에 걸리면 CTA를 비활성화하고 안내 문구를 보여준다", () => {
    mockHomeFundings(false);
    mockWishQuery({ data: mockWish });

    render(<WishDetailContainer />);

    expect(screen.getByRole("button", { name: "이 상품으로 펀딩 열기" })).toBeDisabled();
    expect(screen.getByText(LIMIT_MESSAGE)).toBeInTheDocument();
  });

  it("개설 한도에 걸려도 펀딩 중인 위시는 펀딩 보러가기를 막지 않는다", () => {
    mockHomeFundings(false);
    mockWishQuery({ data: { ...mockWish, status: "FUNDING", fundingId: 5 } });

    render(<WishDetailContainer />);

    expect(screen.getByRole("button", { name: "해당 상품 펀딩 보러가기" })).toBeEnabled();
    expect(screen.queryByText(LIMIT_MESSAGE)).not.toBeInTheDocument();
  });

  it("개설 가능 여부를 조회하는 동안에는 CTA를 비활성화하고 안내 문구는 보여주지 않는다", () => {
    mockHomeFundings(undefined, true);
    mockWishQuery({ data: mockWish });

    render(<WishDetailContainer />);

    expect(screen.getByRole("button", { name: "이 상품으로 펀딩 열기" })).toBeDisabled();
    expect(screen.queryByText(LIMIT_MESSAGE)).not.toBeInTheDocument();
  });

  it("개설 가능 여부 조회에 실패하면 CTA를 막지 않는다", () => {
    mockHomeFundings(undefined);
    mockWishQuery({ data: mockWish });

    render(<WishDetailContainer />);

    expect(screen.getByRole("button", { name: "이 상품으로 펀딩 열기" })).toBeEnabled();
    expect(screen.queryByText(LIMIT_MESSAGE)).not.toBeInTheDocument();
  });

  it("재조회에 실패하면 이전 한도 값으로 CTA를 막지 않는다", () => {
    mockHomeFundings(false, false, true);
    mockWishQuery({ data: mockWish });

    render(<WishDetailContainer />);

    expect(screen.getByRole("button", { name: "이 상품으로 펀딩 열기" })).toBeEnabled();
    expect(screen.queryByText(LIMIT_MESSAGE)).not.toBeInTheDocument();
  });

  it("인증 에러(AUTH_*)면 랜딩('/')으로 replace한다", () => {
    mockWishQuery({ error: new ApiError("AUTH_001", "인증 실패") as never });

    render(<WishDetailContainer />);

    expect(replace).toHaveBeenCalledWith("/");
  });

  it("그 외 API 에러면 매핑 테이블 메시지로 전역 Dialog를 띄운다", () => {
    mockWishQuery({ error: new ApiError("WISH_001", "위시 조회 실패") as never });

    render(<WishDetailContainer />);

    expect(useErrorDialogStore.getState().message).toBe(ERROR_MESSAGES.WISH_001.message);
    expect(replace).not.toHaveBeenCalled();
    useErrorDialogStore.getState().closeErrorDialog();
  });
});
