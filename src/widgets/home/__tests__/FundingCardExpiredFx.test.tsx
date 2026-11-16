import { render, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";

import type { FundingCardExpiredFxPhase } from "@/widgets/home/fundingCardFxMotion";
import FundingCardExpiredFx from "@/widgets/home/FundingCardExpiredFx";

afterEach(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const renderFx = (phase: FundingCardExpiredFxPhase, onExitEnd: () => void = vi.fn()) =>
  render(
    <FundingCardExpiredFx
      label="기간이 만료되었어요."
      labelId="fx-label"
      phase={phase}
      animate
      onExitEnd={onExitEnd}>
      <div>카드 내용</div>
    </FundingCardExpiredFx>,
  );

const findExitFade = () => document.body.querySelector(":scope > .fixed.inset-0");

describe("FundingCardExpiredFx", () => {
  it("라벨을 labelId를 가진 요소로 렌더하고 children도 렌더한다", () => {
    renderFx("idle");

    expect(screen.getByText("기간이 만료되었어요.")).toHaveAttribute("id", "fx-label");
    expect(screen.getByText("카드 내용")).toBeInTheDocument();
  });

  it("idle 단계에서는 화면 페이드를 그리지 않는다", () => {
    renderFx("idle");

    expect(findExitFade()).not.toBeInTheDocument();
  });

  it("press 단계에서는 document.body에 화면 페이드를 그린다", () => {
    renderFx("press");

    expect(findExitFade()).toBeInTheDocument();
  });

  it("press 단계에서 페이드가 끝나면 onExitEnd를 호출한다", async () => {
    MotionGlobalConfig.skipAnimations = true;
    const onExitEnd = vi.fn();
    renderFx("press", onExitEnd);

    await waitFor(() => expect(onExitEnd).toHaveBeenCalledTimes(1));
  });
});
