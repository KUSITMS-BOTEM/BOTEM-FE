import type { ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingOpenCompleteSheet from "@/widgets/funding/FundingOpenCompleteSheet";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

let profileName: string | null = null;
vi.mock("@/hooks/queries/user/useMyProfileQuery", () => ({
  useMyProfileQuery: () => ({ data: { name: profileName } }),
}));

const mockProfile = (name: string | null) => {
  profileName = name;
};

const wish = {
  id: 1,
  productName: "소니 WH-1000XM5",
  productImageUrl: "https://example.com/1.png",
  price: 468000,
};
const info = { targetAmount: "429000", deadline: "2099-11-13" };

const renderSheet = (
  onClose = vi.fn(),
  props: Partial<ComponentProps<typeof FundingOpenCompleteSheet>> = {},
) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <FundingOpenCompleteSheet
        open
        variant="surprise"
        recipientName="민지"
        wish={wish}
        info={info}
        fundingId={1}
        onClose={onClose}
        {...props}
      />
    </QueryClientProvider>,
  );

describe("FundingOpenCompleteSheet", () => {
  it("서프라이즈 시작 안내와 수신자 비밀 문구를 보여준다", () => {
    mockProfile("지유");
    renderSheet();

    expect(screen.getByText("서프라이즈가 시작됐어요!")).toBeInTheDocument();
    expect(screen.getByText("쉿! 민지님에겐 비밀! 위시 알림도 몰래 켰어요")).toBeInTheDocument();
  });

  it("내 프로필 name이 없으면 카드에 내가 여는으로 보여준다", () => {
    mockProfile(null);
    renderSheet();

    expect(screen.getByText("내가 여는")).toBeInTheDocument();
  });

  it("내 프로필 name이 있으면 그 이름을 카드에 보여준다", () => {
    mockProfile("이정민");
    renderSheet();

    expect(screen.getByText("이정민가 여는")).toBeInTheDocument();
  });

  describe("공유하기", () => {
    const originalShare = Object.getOwnPropertyDescriptor(navigator, "share");
    afterEach(() => {
      if (originalShare) Object.defineProperty(navigator, "share", originalShare);
      else delete (navigator as unknown as Record<string, unknown>).share;
    });

    it("클릭하면 수신자 이름이 든 제목과 /share/1 링크로 공유한다", async () => {
      mockProfile("지유");
      const share = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "share", {
        value: share,
        configurable: true,
        writable: true,
      });
      renderSheet();

      await userEvent.click(screen.getByRole("button", { name: "공유하기" }));

      expect(share).toHaveBeenCalledWith({
        title: "민지님 서프라이즈 펀딩",
        url: `${window.location.origin}/share/1`,
      });
    });
  });

  it("surprise variant는 D-day 배지·달성률·링크 복사 버튼이 없다", () => {
    mockProfile("지유");
    renderSheet(vi.fn(), { progress: 80 });

    expect(screen.queryByText(/^D-/)).not.toBeInTheDocument();
    expect(screen.queryByText(/달성/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "링크 복사" })).not.toBeInTheDocument();
  });

  describe("funding variant", () => {
    const renderFunding = (props: Partial<ComponentProps<typeof FundingOpenCompleteSheet>> = {}) =>
      renderSheet(vi.fn(), { variant: "funding", ...props });

    it("서프라이즈 안내 대신 '공유 카드 다시 받기' 제목을 보여준다", () => {
      mockProfile("지유");
      renderFunding();

      expect(screen.getByText("공유 카드 다시 받기")).toBeInTheDocument();
      expect(screen.queryByText("서프라이즈가 시작됐어요!")).not.toBeInTheDocument();
    });

    it("D-day 배지와 progress에 맞는 달성률 문구를 카드에 보여준다", () => {
      mockProfile("지유");
      renderFunding({ progress: 80, info: { ...info, deadline: "2099-11-13" } });

      expect(screen.getByText(/^D-\d+$/)).toBeInTheDocument();
      expect(screen.getByText("80% 달성! 아주 조금 남았어요!")).toBeInTheDocument();
    });

    it("progress가 없으면 달성률 문구를 숨긴다", () => {
      mockProfile("지유");
      renderFunding();

      expect(screen.queryByText(/달성/)).not.toBeInTheDocument();
    });

    it("공유하기와 링크 복사 버튼을 함께 보여준다", () => {
      mockProfile("지유");
      renderFunding();

      expect(screen.getByRole("button", { name: "공유하기" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "링크 복사" })).toBeInTheDocument();
    });

    it("링크 복사를 누르면 공유창 없이 /share/1 링크를 복사한다", async () => {
      mockProfile("지유");
      const writeText = vi.fn().mockResolvedValue(undefined);
      const share = vi.fn();
      Object.defineProperty(navigator, "share", {
        value: share,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
        writable: true,
      });
      renderFunding();

      await userEvent.click(screen.getByRole("button", { name: "링크 복사" }));

      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/share/1`);
      expect(share).not.toHaveBeenCalled();
      expect(await screen.findByText("링크를 복사했어요")).toBeInTheDocument();
    });
  });

  it("X(닫기)를 누르면 onClose를 호출한다", async () => {
    mockProfile("지유");
    const onClose = vi.fn();
    renderSheet(onClose);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
