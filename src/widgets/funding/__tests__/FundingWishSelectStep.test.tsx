import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useWishesQuery } from "@/hooks/queries/wish/useWishesQuery";
import type { WishResponse, WishStatus } from "@/types/wish/wish";
import FundingWishSelectStep from "@/widgets/funding/FundingWishSelectStep";

vi.mock("@/hooks/queries/wish/useWishesQuery");

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

// jsdom 정적 이미지 처리를 단순 대체한다
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

const makeWish = (id: number, status: WishStatus): WishResponse => ({
  id,
  productName: `상품${id}`,
  productImageUrl: `https://example.com/${id}.png`,
  price: id * 1000,
  productUrl: "https://example.com",
  status,
  fundingId: null,
});

const mockQuery = (overrides: Partial<ReturnType<typeof useWishesQuery>>) =>
  vi.mocked(useWishesQuery).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useWishesQuery>);

const pageOf = (content: WishResponse[]) => ({
  content,
  page: 0,
  size: 10,
  totalElements: content.length,
  hasNext: false,
});

const renderStep = (onSelect = vi.fn()) => render(<FundingWishSelectStep onSelect={onSelect} />);

describe("FundingWishSelectStep", () => {
  it("AVAILABLE 위시만 최신 순서 그대로 최대 3개까지 보여준다", () => {
    mockQuery({
      data: pageOf([
        makeWish(1, "AVAILABLE"),
        makeWish(2, "FUNDING"),
        makeWish(3, "AVAILABLE"),
        makeWish(4, "DISCONTINUED"),
        makeWish(5, "AVAILABLE"),
        makeWish(6, "AVAILABLE"),
      ]),
    });

    renderStep();

    ["상품1", "상품3", "상품5"].forEach(name => expect(screen.getByText(name)).toBeInTheDocument());
    ["상품2", "상품4", "상품6"].forEach(name =>
      expect(screen.queryByText(name)).not.toBeInTheDocument(),
    );
    expect(screen.getByText("1,000원")).toBeInTheDocument();
  });

  it("위시를 클릭하면 해당 위시로 onSelect를 호출한다", async () => {
    const wish = makeWish(7, "AVAILABLE");
    const onSelect = vi.fn();
    mockQuery({ data: pageOf([wish]) });

    renderStep(onSelect);
    await userEvent.click(screen.getByRole("button", { name: /상품7/ }));

    expect(onSelect).toHaveBeenCalledWith(wish);
  });

  it("AVAILABLE 위시가 없으면 빈 상태 문구를 보여준다", () => {
    mockQuery({ data: pageOf([makeWish(1, "FUNDING")]) });

    renderStep();

    expect(screen.getByText("펀딩으로 열 수 있는 위시가 없어요")).toBeInTheDocument();
  });

  it("조회에 실패하면 에러 문구와 다시 시도 버튼을 보여주고, 누르면 다시 조회한다", async () => {
    const refetch = vi.fn();
    mockQuery({ isError: true, refetch });

    renderStep();

    expect(screen.getByText("위시를 불러오지 못했어요")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("로딩 중에는 목록 대신 스켈레톤을 보여준다", () => {
    mockQuery({ isLoading: true });

    const { container } = renderStep();

    expect(container.querySelector("[aria-busy]")).toBeInTheDocument();
    expect(screen.queryByText("펀딩으로 열 수 있는 위시가 없어요")).not.toBeInTheDocument();
  });

  it("상품 보기를 클릭하면 /wish/recommended로 이동한다", async () => {
    mockQuery({});

    renderStep();
    await userEvent.click(screen.getByRole("button", { name: /상품 보기/ }));

    expect(mockPush).toHaveBeenCalledWith("/wish/recommended");
  });
});
