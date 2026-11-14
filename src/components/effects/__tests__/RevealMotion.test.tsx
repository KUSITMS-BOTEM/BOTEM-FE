import { useReducedMotion } from "framer-motion";
import { render, screen } from "@testing-library/react";

import RevealMotion from "@/components/effects/RevealMotion";

vi.mock("framer-motion", async importOriginal => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: vi.fn(),
}));

const makeNames = (count: number) => Array.from({ length: count }, (_, i) => `친구${i + 1}`);

const rowSizes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("ul")).map(ul => ul.querySelectorAll("li").length);

beforeEach(() => {
  vi.mocked(useReducedMotion).mockReturnValue(false);
});

describe("RevealMotion", () => {
  it("이름이 없으면 줄도 칩도 렌더하지 않는다", () => {
    const { container } = render(<RevealMotion names={[]} />);

    expect(container.querySelectorAll("ul")).toHaveLength(0);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("이름이 1명이면 한 줄에 칩 하나만 보여준다", () => {
    const { container } = render(<RevealMotion names={makeNames(1)} />);

    expect(rowSizes(container)).toEqual([1]);
  });

  it("이름이 5명이면 아랫줄 4명, 윗줄 1명이 아니라 4명과 1명 두 줄로 나눈다", () => {
    const { container } = render(<RevealMotion names={makeNames(5)} />);

    expect(rowSizes(container)).toEqual([4, 1]);
  });

  it("이름이 8명이면 4·3·1명씩 세 줄로 나눈다", () => {
    const { container } = render(<RevealMotion names={makeNames(8)} />);

    expect(rowSizes(container)).toEqual([4, 3, 1]);
  });

  it("이름이 8명을 넘으면 앞에서 8명까지만 보여준다", () => {
    render(<RevealMotion names={makeNames(10)} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(8);
    expect(screen.getByText("친구8")).toBeInTheDocument();
    expect(screen.queryByText("친구9")).not.toBeInTheDocument();
  });

  it("모션 감소 설정이 꺼져 있으면 aria-hidden 컨페티 레이어를 렌더한다", () => {
    const { container } = render(<RevealMotion names={makeNames(3)} />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("모션 감소 설정이면 컨페티를 렌더하지 않고 이름은 그대로 보여준다", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    const { container } = render(<RevealMotion names={makeNames(3)} />);

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("className prop이 루트에 적용된다", () => {
    const { container } = render(<RevealMotion names={[]} className="custom-reveal" />);

    expect(container.firstElementChild).toHaveClass("custom-reveal");
  });
});
