import { act, render, screen } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";

import FundingMessage from "@/widgets/funding/FundingMessage";

vi.mock("framer-motion", async importOriginal => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: vi.fn(() => false),
}));

const STORY = "올해 생일엔 노캔 헤드폰이 갖고 싶어요";
const PLEDGE = "성공하면 인증샷을 꼭 올릴게요";

// 높이 맞춤용 숨김 사본(aria-hidden)을 제외한, 실제로 보이는 문구만 찾는다
const visible = (text: string) => screen.queryByText(text, { selector: "p:not([aria-hidden])" });

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe("FundingMessage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("사연과 공약이 모두 있으면 처음에는 사연만 보인다", () => {
    render(<FundingMessage story={STORY} pledge={PLEDGE} />);

    expect(visible(STORY)).toBeInTheDocument();
    expect(visible(PLEDGE)).not.toBeInTheDocument();
  });

  it("5초가 지나면 공약으로 넘어간다", () => {
    render(<FundingMessage story={STORY} pledge={PLEDGE} />);

    advance(5000);

    expect(visible(PLEDGE)).toBeInTheDocument();
  });

  it("하나만 있으면 시간이 지나도 슬라이드 없이 그 문구만 보인다", () => {
    render(<FundingMessage story={STORY} />);

    advance(10000);

    expect(visible(STORY)).toBeInTheDocument();
    expect(screen.queryByText(PLEDGE)).not.toBeInTheDocument();
  });

  it("둘 다 없으면 아무것도 렌더하지 않는다", () => {
    const { container } = render(<FundingMessage />);

    expect(container).toBeEmptyDOMElement();
  });

  it("움직임 줄이기 설정이면 회전 없이 사연과 공약을 모두 보여준다", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<FundingMessage story={STORY} pledge={PLEDGE} />);

    advance(10000);

    expect(visible(STORY)).toBeInTheDocument();
    expect(visible(PLEDGE)).toBeInTheDocument();
  });
});
