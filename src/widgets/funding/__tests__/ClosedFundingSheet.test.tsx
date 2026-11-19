import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useClosedFundingsQuery } from "@/hooks/queries/funding/useClosedFundingsQuery";
import ClosedFundingSheet from "@/widgets/funding/ClosedFundingSheet";

vi.mock("@/hooks/queries/funding/useClosedFundingsQuery");

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

const mockQuery = (value: Record<string, unknown>) =>
  vi.mocked(useClosedFundingsQuery).mockReturnValue({
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    ...value,
  } as unknown as ReturnType<typeof useClosedFundingsQuery>);

describe("ClosedFundingSheet", () => {
  it("로딩 중에는 스켈레톤을 보여준다", () => {
    mockQuery({ isPending: true });
    render(<ClosedFundingSheet open onClose={vi.fn()} />);

    expect(screen.getByRole("status", { name: "마감된 펀딩 불러오는 중" })).toBeInTheDocument();
  });

  it("마감된 펀딩이 없으면 빈 상태 문구를 보여준다", () => {
    mockQuery({ data: { fundings: [] } });
    render(<ClosedFundingSheet open onClose={vi.fn()} />);

    expect(screen.getByText("마감된 펀딩이 없어요.")).toBeInTheDocument();
  });

  it("조회에 실패하면 안내와 다시 시도 버튼을 보여주고, 누르면 refetch한다", async () => {
    const refetch = vi.fn();
    mockQuery({ isError: true, refetch });
    render(<ClosedFundingSheet open onClose={vi.fn()} />);

    expect(screen.getByText("마감된 펀딩을 불러오지 못했어요.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalled();
  });

  it("마감된 펀딩이 있으면 날짜별 목록을 보여준다", () => {
    mockQuery({
      data: {
        fundings: [
          {
            fundingId: 1,
            type: "BIRTHDAY",
            productName: "에어팟 프로 2",
            productImageUrl: "",
            deadline: "2025-10-13T23:59:59.999999",
            targetReached: true,
            participantCount: 8,
            recipientName: null,
            giftVerificationStatus: "REQUIRED",
          },
        ],
      },
    });
    render(<ClosedFundingSheet open onClose={vi.fn()} />);

    expect(screen.getByText("2025.10.13")).toBeInTheDocument();
    expect(screen.getByText("에어팟 프로 2")).toBeInTheDocument();
    expect(screen.getByText("인증 필요")).toBeInTheDocument();
  });

  it("닫기 대신 뒤로 가기 버튼이 있고, 누르면 onClose를 호출한다", async () => {
    mockQuery({ data: { fundings: [] } });
    const onClose = vi.fn();
    render(<ClosedFundingSheet open onClose={onClose} />);

    expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(onClose).toHaveBeenCalled();
  });
});
