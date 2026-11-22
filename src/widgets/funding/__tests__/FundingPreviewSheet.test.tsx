import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingPreviewSheet from "@/widgets/funding/FundingPreviewSheet";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

const wish = {
  id: 1,
  productName: "소니 WH-1000XM5",
  productImageUrl: "https://example.com/1.png",
  price: 468000,
};
const info = { targetAmount: "429000", deadline: "2099-11-13" };

const renderSheet = (props = {}) =>
  render(
    <FundingPreviewSheet
      open
      wish={wish}
      info={info}
      title="지유의 펀딩"
      onClose={vi.fn()}
      {...props}
    />,
  );

describe("FundingPreviewSheet", () => {
  it("입력한 상품·목표 금액과 진행률 60%를 카드에 보여준다", () => {
    renderSheet();

    expect(screen.getByRole("dialog", { name: "미리보기" })).toBeInTheDocument();
    expect(screen.getByText("지유의 펀딩")).toBeInTheDocument();
    expect(screen.getByText("소니 WH-1000XM5")).toBeInTheDocument();
    expect(screen.getByText("목표가 429,000원")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "펀딩 달성률" })).toHaveAttribute(
      "aria-valuenow",
      "60",
    );
  });

  it("마감일을 카드에 보여준다", () => {
    renderSheet();

    expect(screen.getByText(/마감 11월 13일/)).toBeInTheDocument();
  });

  it("입력한 사연을 제목 아래에 보여준다", () => {
    renderSheet({ info: { ...info, story: "생일 선물" } });

    expect(screen.getByText("생일 선물")).toBeInTheDocument();
  });

  it("공약만 있어도 보여준다", () => {
    renderSheet({ info: { ...info, pledge: "춤추기" } });

    expect(screen.getByText("춤추기")).toBeInTheDocument();
  });

  it("사연·공약이 없으면 메시지 박스를 그리지 않는다", () => {
    renderSheet();

    expect(screen.queryByText("생일 선물")).not.toBeInTheDocument();
  });

  it("locked면 카드 마감일 옆에만 자물쇠를 보여주고, 아니면 보여주지 않는다", () => {
    const { container, rerender } = renderSheet({ locked: true });
    const lockedCount = container.ownerDocument.querySelectorAll("svg[aria-hidden]").length;

    rerender(
      <FundingPreviewSheet open wish={wish} info={info} title="지유의 펀딩" onClose={vi.fn()} />,
    );

    expect(container.ownerDocument.querySelectorAll("svg[aria-hidden]").length).toBe(
      lockedCount - 1,
    );
  });

  it("닫기를 누르면 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    renderSheet({ onClose });

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
