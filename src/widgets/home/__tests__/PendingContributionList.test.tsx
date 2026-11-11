import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { PendingContributionResponse } from "@/types/contribution/contribution";
import PendingContributionList from "@/widgets/home/PendingContributionList";

const contributions: PendingContributionResponse[] = [
  { contributionId: 1, senderName: "하린이", depositMethod: "토스뱅크 계좌" },
  { contributionId: 2, senderName: "도윤이", depositMethod: "토스뱅크 계좌" },
];

const baseProps = {
  contributions,
  isLoading: false,
  isError: false,
  onRetry: vi.fn(),
  selectedIds: [] as number[],
  onSelectedIdsChange: vi.fn(),
  onOpenFunding: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PendingContributionList", () => {
  it("로딩 중에는 aria-busy 스켈레톤만 보여주고 목록은 보여주지 않는다", () => {
    const { container } = render(
      <PendingContributionList {...baseProps} contributions={undefined} isLoading />,
    );

    expect(container.querySelector("[aria-busy='true']")).not.toBeNull();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("에러이고 데이터가 없으면 에러 문구와 다시 시도 버튼을 보여준다", () => {
    render(<PendingContributionList {...baseProps} contributions={undefined} isError />);

    expect(screen.getByText("보탬 내역을 불러오지 못했어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("다시 시도를 누르면 onRetry를 호출한다", async () => {
    render(<PendingContributionList {...baseProps} contributions={undefined} isError />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(baseProps.onRetry).toHaveBeenCalledTimes(1);
  });

  it("에러여도 이미 받은 데이터가 있으면 목록을 계속 보여준다", () => {
    render(<PendingContributionList {...baseProps} isError />);

    expect(screen.getByText("하린이의 보탬")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("데이터가 없고 로딩·에러도 아니면 아무것도 렌더하지 않는다", () => {
    const { container } = render(
      <PendingContributionList {...baseProps} contributions={undefined} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("빈 배열이면 '모든 내역을 확인했어요'와 펀딩 열기 버튼을 보여준다", () => {
    render(<PendingContributionList {...baseProps} contributions={[]} />);

    expect(screen.getByText("모든 내역을 확인했어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "펀딩 열기" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("펀딩 열기를 누르면 onOpenFunding을 호출한다", async () => {
    render(<PendingContributionList {...baseProps} contributions={[]} />);

    await userEvent.click(screen.getByRole("button", { name: "펀딩 열기" }));

    expect(baseProps.onOpenFunding).toHaveBeenCalledTimes(1);
  });

  it("N건이면 '미확인 보탬 N건' 헤더와 N개 아이템을 보여준다", () => {
    render(<PendingContributionList {...baseProps} />);

    expect(screen.getByText("미확인 보탬 2건")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("selectedIds에 포함된 아이템만 체크 상태로 보여준다", () => {
    render(<PendingContributionList {...baseProps} selectedIds={[2]} />);

    const [first, second] = screen.getAllByRole("checkbox");
    expect(first).not.toBeChecked();
    expect(second).toBeChecked();
  });

  it("미선택 아이템을 체크하면 기존 선택에 id를 더해 onSelectedIdsChange를 호출한다", async () => {
    render(<PendingContributionList {...baseProps} selectedIds={[2]} />);

    await userEvent.click(screen.getAllByRole("checkbox")[0]!);

    expect(baseProps.onSelectedIdsChange).toHaveBeenCalledWith([2, 1]);
  });

  it("선택된 아이템을 해제하면 해당 id를 뺀 배열로 onSelectedIdsChange를 호출한다", async () => {
    render(<PendingContributionList {...baseProps} selectedIds={[1, 2]} />);

    await userEvent.click(screen.getAllByRole("checkbox")[0]!);

    expect(baseProps.onSelectedIdsChange).toHaveBeenCalledWith([2]);
  });
});
