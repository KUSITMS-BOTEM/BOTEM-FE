import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { saveNodeAsImage } from "@/utils/saveNodeAsImage";
import SurpriseReadySheet from "@/widgets/funding/SurpriseReadySheet";

vi.mock("@/utils/saveNodeAsImage", () => ({ saveNodeAsImage: vi.fn() }));
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

// jsdom에 없는 dialog API를 단순 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

const baseProps = {
  open: true,
  fundingId: "1",
  recipientName: "지유",
  revealDateLabel: "10월 13일 0시",
  contributorCount: 7,
  progress: 92,
  productImageUrl: "/product.png",
  productName: "소니 WH-1000XM5",
  startDate: "2026-10-31",
  endDate: "2026-11-15",
  onClose: vi.fn(),
};

describe("SurpriseReadySheet", () => {
  beforeEach(() => vi.clearAllMocks());

  it("공개 시각과 함께한 친구 수를 안내한다", () => {
    render(<SurpriseReadySheet {...baseProps} />);

    expect(screen.getByText("선물 준비 완료!")).toBeVisible();
    expect(screen.getByText(/10월 13일 0시에 지유에게 공개돼요/)).toBeVisible();
    expect(screen.getByText(/함께한 친구 7명에게 알렸어요/)).toBeVisible();
  });

  it("카드에 달성률·상품명·펀딩 기간을 보여준다", () => {
    render(<SurpriseReadySheet {...baseProps} />);

    expect(screen.getByText("92% 달성")).toBeInTheDocument();
    expect(screen.getByText("소니 WH-1000XM5")).toBeVisible();
    expect(screen.getByText("10월 31일 ~ 11월 15일")).toBeVisible();
  });

  it("좌측 상단 닫기를 누르면 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    render(<SurpriseReadySheet {...baseProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("이미지로 저장을 누르면 카드를 이미지로 저장한다", async () => {
    render(<SurpriseReadySheet {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "이미지로 저장" }));

    expect(saveNodeAsImage).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      "지유-선물-준비-완료.png",
    );
  });

  it("이미지 저장에 실패하면 안내 토스트를 보여준다", async () => {
    vi.mocked(saveNodeAsImage).mockRejectedValueOnce(new Error("fail"));
    render(<SurpriseReadySheet {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "이미지로 저장" }));

    expect(await screen.findByText("이미지를 저장하지 못했어요")).toBeInTheDocument();
  });
});
