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

const saveNodeAsImageMock = vi.fn();
vi.mock("@/utils/saveNodeAsImage", () => ({
  saveNodeAsImage: (...args: unknown[]) => saveNodeAsImageMock(...args),
}));
// 미리 만들기는 usePreparedImageSave 테스트가 맡는다. 여기선 어떤 노드·파일명·옵션으로 저장하는지만 본다
const preparedOptionsMock = vi.fn();
vi.mock("@/hooks/usePreparedImageSave", () => {
  return {
    usePreparedImageSave: (
      ref: { current: HTMLElement | null },
      filename: string,
      options: { contentKey?: string },
    ) => {
      preparedOptionsMock(options);
      return () => saveNodeAsImageMock(ref.current!, filename);
    },
  };
});

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

// variant마다 받는 props가 달라(surprise: recipientName / funding: cardTitle) 덮어쓸 값은 느슨하게 받는다
const renderSheet = (onClose = vi.fn(), props: Record<string, unknown> = {}) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <FundingOpenCompleteSheet
        open
        variant="surprise"
        recipientName="민지"
        wish={wish}
        info={info}
        shareKey="1"
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

    expect(screen.getByText("이정민이 여는")).toBeInTheDocument();
  });

  describe("공유하기", () => {
    it("클릭하면 링크 대신 카드를 이미지로 공유한다", async () => {
      mockProfile("지유");
      renderSheet();

      await userEvent.click(screen.getByRole("button", { name: "공유하기" }));

      expect(saveNodeAsImageMock).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        "민지의\n생일 펀딩-공유-카드.png",
      );
    });

    it("이미지 생성에 실패하면 실패 토스트를 보여준다", async () => {
      mockProfile("지유");
      saveNodeAsImageMock.mockRejectedValueOnce(new Error("fail"));
      renderSheet();

      await userEvent.click(screen.getByRole("button", { name: "공유하기" }));

      expect(await screen.findByText("이미지를 저장하지 못했어요")).toBeInTheDocument();
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
    const renderFunding = (props: Record<string, unknown> = {}) =>
      renderSheet(vi.fn(), { variant: "funding", cardTitle: "지유의 생일 펀딩", ...props });

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

    it("시트가 열린 채 달성률이 바뀌면 저장 이미지를 다시 만들도록 contentKey가 바뀐다", () => {
      mockProfile("지유");
      const { rerender } = renderFunding({ progress: 80 });
      const before = preparedOptionsMock.mock.lastCall?.[0].contentKey;

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <FundingOpenCompleteSheet
            open
            variant="funding"
            cardTitle="지유의 생일 펀딩"
            progress={90}
            wish={wish}
            info={info}
            shareKey="1"
            onClose={vi.fn()}
          />
        </QueryClientProvider>,
      );

      expect(preparedOptionsMock.mock.lastCall?.[0].contentKey).not.toBe(before);
    });

    it("progress가 없으면 달성률 문구를 숨긴다", () => {
      mockProfile("지유");
      renderFunding();

      expect(screen.queryByText(/달성/)).not.toBeInTheDocument();
    });

    it("하단 공유하기·링크 복사 버튼 대신 헤더에 공유 카드 저장 버튼을 보여준다", () => {
      mockProfile("지유");
      renderFunding();

      expect(screen.getByRole("button", { name: "공유 카드 저장" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "공유하기" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "링크 복사" })).not.toBeInTheDocument();
    });

    it("공유 카드 저장을 누르면 카드를 수신자 이름이 든 파일명의 이미지로 저장한다", async () => {
      mockProfile("지유");
      renderFunding();

      await userEvent.click(screen.getByRole("button", { name: "공유 카드 저장" }));

      expect(saveNodeAsImageMock).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        "지유의 생일 펀딩-공유-카드.png",
      );
    });

    it("이미지 저장에 실패하면 실패 토스트를 보여준다", async () => {
      mockProfile("지유");
      saveNodeAsImageMock.mockRejectedValueOnce(new Error("fail"));
      renderFunding();

      await userEvent.click(screen.getByRole("button", { name: "공유 카드 저장" }));

      expect(await screen.findByText("이미지를 저장하지 못했어요")).toBeInTheDocument();
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
