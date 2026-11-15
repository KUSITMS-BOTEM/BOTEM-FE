import { act, render, screen, waitFor } from "@testing-library/react";
import { motionValue } from "framer-motion";

import RollingPaperWheelProfile from "@/widgets/rolling-paper/RollingPaperWheelProfile";

const readScale = (element: HTMLElement) =>
  Number(/scale\(([\d.]+)\)/.exec(element.style.transform)?.[1]);

describe("RollingPaperWheelProfile", () => {
  it("progress와 같은 번호의 프로필은 원래 크기로 보인다", () => {
    render(
      <RollingPaperWheelProfile index={0} count={5} progress={motionValue(0)} animated={false} />,
    );

    expect(readScale(screen.getByTestId("wheel-profile"))).toBe(1);
  });

  it("이웃 프로필은 중앙보다 작다", () => {
    render(
      <RollingPaperWheelProfile index={1} count={5} progress={motionValue(0)} animated={false} />,
    );

    expect(readScale(screen.getByTestId("wheel-profile"))).toBeLessThan(1);
  });

  it("progress가 바뀌면 프로필이 따라 중앙으로 이동한다", async () => {
    const progress = motionValue(0);
    render(<RollingPaperWheelProfile index={1} count={5} progress={progress} animated={false} />);

    act(() => progress.set(1));

    await waitFor(() => expect(readScale(screen.getByTestId("wheel-profile"))).toBe(1));
  });

  it("등장 모션이 있으면 래퍼가 투명하게 시작한다", () => {
    render(<RollingPaperWheelProfile index={0} count={5} progress={motionValue(0)} animated />);

    expect(screen.getByTestId("wheel-profile").parentElement).toHaveStyle({ opacity: "0" });
  });

  it("등장 모션이 없으면 래퍼가 바로 보인다", () => {
    render(
      <RollingPaperWheelProfile index={0} count={5} progress={motionValue(0)} animated={false} />,
    );

    expect(screen.getByTestId("wheel-profile").parentElement).toHaveStyle({ opacity: "1" });
  });
});
