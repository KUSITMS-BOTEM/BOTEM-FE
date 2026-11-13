import { act, render, screen, waitFor } from "@testing-library/react";
import { motionValue } from "framer-motion";

import RollingPaperWheelCard from "@/widgets/rolling-paper/RollingPaperWheelCard";
import { ARRIVAL_CARD_ENTRANCES } from "@/widgets/rolling-paper/rollingPaperMotion";

const readPose = (element: HTMLElement) => {
  const transform = element.style.transform;
  return {
    rotate: Number(/rotate\((-?[\d.]+)deg\)/.exec(transform)?.[1]),
    scale: Number(/scale\(([\d.]+)\)/.exec(transform)?.[1]),
    opacity: Number(element.style.opacity),
  };
};

describe("RollingPaperWheelCard", () => {
  it("progress와 같은 번호의 카드는 기울지 않고 원래 크기로 불투명하게 보인다", () => {
    render(<RollingPaperWheelCard index={0} count={5} progress={motionValue(0)} entrance={null} />);

    expect(readPose(screen.getByTestId("wheel-card"))).toEqual({ rotate: 0, scale: 1, opacity: 1 });
  });

  it("이웃 카드는 중앙보다 작고 기울어져 있다", () => {
    render(<RollingPaperWheelCard index={1} count={5} progress={motionValue(0)} entrance={null} />);

    const { rotate, scale } = readPose(screen.getByTestId("wheel-card"));

    expect(scale).toBeLessThan(1);
    expect(rotate).not.toBe(0);
  });

  it("progress가 바뀌면 카드가 따라 중앙으로 이동한다", async () => {
    const progress = motionValue(0);
    render(<RollingPaperWheelCard index={1} count={5} progress={progress} entrance={null} />);

    act(() => progress.set(1));

    await waitFor(() =>
      expect(readPose(screen.getByTestId("wheel-card"))).toEqual({
        rotate: 0,
        scale: 1,
        opacity: 1,
      }),
    );
  });

  it("등장 모션이 있으면 등장 래퍼가 투명하게 시작한다", () => {
    render(
      <RollingPaperWheelCard
        index={0}
        count={5}
        progress={motionValue(0)}
        entrance={ARRIVAL_CARD_ENTRANCES[0]}
      />,
    );

    expect(screen.getByTestId("wheel-card").parentElement).toHaveStyle({ opacity: "0" });
  });

  it("겹쳐 있는 바깥 래퍼는 클릭을 통과시키고 실제 카드만 클릭을 받는다", () => {
    render(<RollingPaperWheelCard index={0} count={5} progress={motionValue(0)} entrance={null} />);

    const card = screen.getByTestId("wheel-card");

    expect(card.parentElement).toHaveClass("pointer-events-none");
    expect(card).toHaveClass("pointer-events-auto");
  });

  it("등장 모션이 없으면 래퍼가 바로 보인다", () => {
    render(<RollingPaperWheelCard index={0} count={5} progress={motionValue(0)} entrance={null} />);

    expect(screen.getByTestId("wheel-card").parentElement).toHaveStyle({ opacity: "1" });
  });
});
