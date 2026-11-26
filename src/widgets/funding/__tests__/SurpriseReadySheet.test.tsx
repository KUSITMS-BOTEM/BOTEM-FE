import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { createImageFile, shareOrDownloadImage } from "@/utils/saveNodeAsImage";
import SurpriseReadySheet from "@/widgets/funding/SurpriseReadySheet";

vi.mock("@/utils/saveNodeAsImage", () => ({
  createImageFile: vi.fn(),
  shareOrDownloadImage: vi.fn(),
}));
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
  const cardFile = new File(["png"], "지유-선물-준비-완료.png", { type: "image/png" });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createImageFile).mockResolvedValue(cardFile);
  });

  it("공개 시각과 함께한 친구 수를 안내한다", () => {
    render(<SurpriseReadySheet {...baseProps} />);

    expect(screen.getByText("선물 준비 완료!")).toBeVisible();
    expect(screen.getByText(/10월 13일 0시에 지유에게 공개돼요/)).toBeVisible();
    expect(screen.getByText(/함께한 친구 7명에게 알렸어요/)).toBeVisible();
  });

  it("공개 시각이 없으면 '곧'으로 안내한다", () => {
    render(<SurpriseReadySheet {...baseProps} revealDateLabel={undefined} />);

    expect(screen.getByText(/곧 지유에게 공개돼요/)).toBeVisible();
  });

  it("카드에 달성률·상품명·펀딩 기간을 보여준다", () => {
    render(<SurpriseReadySheet {...baseProps} />);

    expect(screen.getByText("92% 달성")).toBeInTheDocument();
    expect(screen.getByText("소니 WH-1000XM5")).toBeVisible();
    expect(screen.getByText("10월 31일 ~ 11월 15일")).toBeVisible();
  });

  it("우측 상단 닫기를 누르면 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    render(<SurpriseReadySheet {...baseProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("미리 만든 이미지가 없을 때 공유하기를 누르면 카드를 이미지로 만들어 저장한다", async () => {
    render(<SurpriseReadySheet {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "공유하기" }));

    expect(createImageFile).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      "지유-선물-준비-완료.png",
    );
    expect(shareOrDownloadImage).toHaveBeenCalledWith(cardFile);
  });

  it("시트가 열리고 카드 모션이 끝나면 이미지를 미리 만들어, 공유하기에서 다시 만들지 않고 바로 넘긴다", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      render(<SurpriseReadySheet {...baseProps} />);
      expect(createImageFile).not.toHaveBeenCalled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });
      expect(createImageFile).toHaveBeenCalledTimes(1);

      await userEvent.click(screen.getByRole("button", { name: "공유하기" }));

      expect(createImageFile).toHaveBeenCalledTimes(1);
      expect(shareOrDownloadImage).toHaveBeenCalledWith(cardFile);
    } finally {
      vi.useRealTimers();
    }
  });

  it("시트가 닫혀 있으면 이미지를 미리 만들지 않는다", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      render(<SurpriseReadySheet {...baseProps} open={false} />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      expect(createImageFile).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("이미지를 만드는 동안 공유하기를 잠가 다시 눌러도 한 번만 만든다", async () => {
    vi.mocked(createImageFile).mockReturnValueOnce(new Promise<File>(() => {}));
    render(<SurpriseReadySheet {...baseProps} />);
    const button = screen.getByRole("button", { name: "공유하기" });

    await userEvent.click(button);
    await userEvent.click(button);

    expect(button).toBeDisabled();
    expect(createImageFile).toHaveBeenCalledTimes(1);
  });

  it("이미지 저장에 실패하면 안내 토스트를 보여준다", async () => {
    vi.mocked(createImageFile).mockRejectedValueOnce(new Error("fail"));
    render(<SurpriseReadySheet {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "공유하기" }));

    expect(await screen.findByText("이미지를 저장하지 못했어요")).toBeInTheDocument();
  });
});
