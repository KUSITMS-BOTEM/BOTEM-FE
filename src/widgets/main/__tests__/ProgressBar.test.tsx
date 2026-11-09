import { render, screen } from "@testing-library/react";

import ProgressBar from "@/widgets/main/ProgressBar";

describe("ProgressBar", () => {
  it("progress 값이 aria-valuenow와 채움 너비에 반영된다", () => {
    render(<ProgressBar progress={40} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar.querySelector<HTMLElement>("[style]")).toHaveStyle({ width: "40%" });
  });

  it("progress가 0이면 valuenow 0, 너비 0%다", () => {
    render(<ProgressBar progress={0} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(bar.querySelector<HTMLElement>("[style]")).toHaveStyle({ width: "0%" });
  });

  it("progress가 100이면 valuenow 100, 너비 100%다", () => {
    render(<ProgressBar progress={100} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(bar.querySelector<HTMLElement>("[style]")).toHaveStyle({ width: "100%" });
  });

  it("progress가 음수면 0으로 보정된다", () => {
    render(<ProgressBar progress={-20} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(bar.querySelector<HTMLElement>("[style]")).toHaveStyle({ width: "0%" });
  });

  it("progress가 100을 넘으면 100으로 보정된다", () => {
    render(<ProgressBar progress={150} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(bar.querySelector<HTMLElement>("[style]")).toHaveStyle({ width: "100%" });
  });

  it("className prop이 루트에 적용된다", () => {
    render(<ProgressBar progress={10} className="custom-progress" />);

    expect(screen.getByRole("progressbar")).toHaveClass("custom-progress");
  });

  it("progress가 NaN이면 너비 0%이고 aria-valuenow를 생략한다", () => {
    render(<ProgressBar progress={NaN} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar.querySelector<HTMLElement>("[style]")).toHaveStyle({ width: "0%" });
  });

  it("aria-labelledby로 연결한 요소가 접근 가능한 이름이 된다", () => {
    render(
      <>
        <p id="funding-title">엄마 생일 선물</p>
        <ProgressBar progress={10} aria-labelledby="funding-title" />
      </>,
    );

    expect(screen.getByRole("progressbar", { name: "엄마 생일 선물" })).toBeInTheDocument();
  });
});
