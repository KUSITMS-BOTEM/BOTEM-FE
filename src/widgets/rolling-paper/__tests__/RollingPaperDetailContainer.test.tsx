import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import RollingPaperDetailContainer from "@/widgets/rolling-paper/RollingPaperDetailContainer";

vi.mock("@/hooks/queries/funding/useFundingResultQuery", () => ({
  useFundingResultQuery: vi.fn(),
}));
vi.mock("@/widgets/rolling-paper/RollingPaperWheel", () => ({
  default: ({ count }: { count: number }) => (
    <div data-testid="rolling-paper-wheel" data-count={count} />
  ),
}));

const backMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: backMock }),
}));

const refetch = vi.fn();

const mockQuery = (value: { data?: { messageCount: number }; isLoading?: boolean }) => {
  vi.mocked(useFundingResultQuery).mockReturnValue({
    data: undefined,
    isLoading: false,
    refetch,
    ...value,
  } as unknown as ReturnType<typeof useFundingResultQuery>);
};

beforeEach(() => vi.clearAllMocks());

describe("RollingPaperDetailContainer", () => {
  it("rollingPaperId를 펀딩 id로 보고 숫자로 바꿔 결과를 조회한다", () => {
    mockQuery({ isLoading: true });

    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    expect(useFundingResultQuery).toHaveBeenCalledWith(12);
  });

  it("뒤로 가기 버튼을 누르면 이전 페이지로 돌아간다", async () => {
    mockQuery({ data: { messageCount: 5 } });
    const user = userEvent.setup();
    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    await user.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(backMock).toHaveBeenCalledTimes(1);
  });

  it("결과의 메세지 개수만큼 편지지 휠을 그린다", () => {
    mockQuery({ data: { messageCount: 7 } });

    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    expect(screen.getByTestId("rolling-paper-wheel")).toHaveAttribute("data-count", "7");
  });

  it("뒤로 가기 버튼은 페이드인을 위해 투명하게 시작한다", () => {
    mockQuery({ data: { messageCount: 5 } });

    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    expect(screen.getByRole("button", { name: "뒤로 가기" }).parentElement).toHaveStyle({
      opacity: "0",
    });
  });

  it("로딩 중이면 로딩 안내를 보여주고 휠은 그리지 않는다", () => {
    mockQuery({ isLoading: true });

    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    expect(screen.getByRole("status")).toHaveTextContent("메세지를 불러오는 중이에요");
    expect(screen.queryByTestId("rolling-paper-wheel")).not.toBeInTheDocument();
  });

  it("조회에 실패하면 에러 문구와 '다시 시도'를 보여주고 누르면 refetch한다", async () => {
    mockQuery({});
    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    expect(screen.getByText("메세지를 불러오지 못했어요")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("메세지가 0개면 빈 안내를 보여주고 휠은 그리지 않는다", () => {
    mockQuery({ data: { messageCount: 0 } });

    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    expect(screen.getByText("도착한 메세지가 없어요")).toBeInTheDocument();
    expect(screen.queryByTestId("rolling-paper-wheel")).not.toBeInTheDocument();
  });
});
