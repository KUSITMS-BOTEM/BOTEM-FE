import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useDeleteWishMutation } from "@/hooks/mutations/wish/useDeleteWishMutation";
import { useWishQuery } from "@/hooks/queries/wish/useWishQuery";
import { ApiError } from "@/types/api";
import type { WishResponse } from "@/types/wish/wish";
import WishDetailContainer from "@/widgets/wish/WishDetailContainer";

vi.mock("@/hooks/queries/wish/useWishQuery", () => ({ useWishQuery: vi.fn() }));
vi.mock("@/hooks/mutations/wish/useDeleteWishMutation", () => ({
  useDeleteWishMutation: vi.fn(),
}));

const replace = vi.fn();
const back = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, back }),
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

describe("WishDetailContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(screen.getByRole("button", { name: "이 상품으로 펀딩 열기" })).toBeInTheDocument();
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
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");

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

    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
    expect(deleteWish).not.toHaveBeenCalled();
  });

  it("인증 에러(AUTH_*)면 랜딩('/')으로 replace한다", () => {
    mockWishQuery({ error: new ApiError("AUTH_001", "인증 실패") as never });

    render(<WishDetailContainer />);

    expect(replace).toHaveBeenCalledWith("/");
  });

  it("그 외 API 에러면 에러 메시지로 alert를 띄운다", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    mockWishQuery({ error: new ApiError("WISH_001", "위시 조회 실패") as never });

    render(<WishDetailContainer />);

    expect(alertSpy).toHaveBeenCalledWith("위시 조회 실패");
    expect(replace).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
