import { render, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";

import type { FundingCardFxPhase } from "@/widgets/home/fundingCardFxMotion";
import FundingCardCompleteFx from "@/widgets/home/FundingCardCompleteFx";

afterEach(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const renderFx = (
  phase: FundingCardFxPhase,
  handlers: { onPressEnd?: () => void; onBurstEnd?: () => void } = {},
) =>
  render(
    <FundingCardCompleteFx
      label="터트려볼까요?"
      labelId="fx-label"
      phase={phase}
      animate
      onPressEnd={handlers.onPressEnd ?? vi.fn()}
      onBurstEnd={handlers.onBurstEnd ?? vi.fn()}>
      <div>카드 내용</div>
    </FundingCardCompleteFx>,
  );

const findWhiteout = () => document.body.querySelector(":scope > .fixed.inset-0");

describe("FundingCardCompleteFx", () => {
  it("라벨을 labelId를 가진 요소로 렌더하고 children도 렌더한다", () => {
    renderFx("idle");

    expect(screen.getByText("터트려볼까요?")).toHaveAttribute("id", "fx-label");
    expect(screen.getByText("카드 내용")).toBeInTheDocument();
  });

  it.each<FundingCardFxPhase>(["idle", "press"])(
    "%s 단계에서는 화이트아웃을 그리지 않는다",
    phase => {
      renderFx(phase);

      expect(findWhiteout()).not.toBeInTheDocument();
    },
  );

  it("burst 단계에서는 document.body에 화이트아웃을 그린다", () => {
    renderFx("burst");

    expect(findWhiteout()).toBeInTheDocument();
  });

  it("burst 단계에서 화이트아웃 애니메이션이 끝나면 onBurstEnd를 호출한다", async () => {
    MotionGlobalConfig.skipAnimations = true;
    const onBurstEnd = vi.fn();
    renderFx("burst", { onBurstEnd });

    await waitFor(() => expect(onBurstEnd).toHaveBeenCalledTimes(1));
  });

  it("press 단계에서 카드 애니메이션이 끝나면 onPressEnd를 호출한다", async () => {
    MotionGlobalConfig.skipAnimations = true;
    const onPressEnd = vi.fn();
    renderFx("press", { onPressEnd });

    await waitFor(() => expect(onPressEnd).toHaveBeenCalledTimes(1));
  });
});
