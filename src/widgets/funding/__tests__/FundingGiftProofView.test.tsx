import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import FundingGiftProofView from "@/widgets/funding/FundingGiftProofView";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("FundingGiftProofView", () => {
  beforeEach(() => push.mockClear());

  it("마감 안내와 참여 인원·상품명을 보여준다", () => {
    render(<FundingGiftProofView contributorCount={8} productName="소니 WH-1000XM5" />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "이미 펀딩이 마감됐어요!선물 인증이 도착했어요",
    );
    expect(screen.getByText("친구 8명의 보탬으로 소니 WH-1000XM5 완성!")).toBeInTheDocument();
  });

  it("홈으로·닫기는 /home으로 이동한다", async () => {
    const user = userEvent.setup();
    render(<FundingGiftProofView contributorCount={8} productName="상품" />);

    await user.click(screen.getByRole("button", { name: "홈으로" }));
    await user.click(screen.getByRole("button", { name: "닫기" }));

    expect(push).toHaveBeenNthCalledWith(1, "/home");
    await waitFor(() => expect(push).toHaveBeenNthCalledWith(2, "/home"));
  });

  it("나도 만들기는 펀딩 시트를 열도록 /home?open=funding으로 이동한다", async () => {
    const user = userEvent.setup();
    render(<FundingGiftProofView contributorCount={8} productName="상품" />);

    await user.click(screen.getByRole("button", { name: "나도 만들기" }));

    expect(push).toHaveBeenCalledWith("/home?open=funding");
  });
});
