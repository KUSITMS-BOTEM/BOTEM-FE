import { render } from "@testing-library/react";

import FundingResultConfettiPiece from "@/widgets/funding/FundingResultConfettiPiece";
import type { ConfettiPiece } from "@/widgets/funding/fundingResultMotion";

const PIECE: ConfettiPiece = { shape: "dot", color: "lime", at: 2.5, x: 10, y: 10, rotate: 90 };

const getBody = (piece: ConfettiPiece) =>
  render(<FundingResultConfettiPiece piece={piece} />).container.firstElementChild
    ?.firstElementChild;

describe("FundingResultConfettiPiece", () => {
  it.each([
    ["lime", "bg-base-lime-500"],
    ["pink", "bg-base-pink-500"],
    ["blue", "bg-base-blue-500"],
  ] as const)("color=%s면 %s 색으로 그린다", (color, expected) => {
    expect(getBody({ ...PIECE, color })).toHaveClass(expected);
  });

  it.each([
    ["streamer", "h-[18px]"],
    ["strip", "h-2.5"],
    ["dot", "rounded-full"],
  ] as const)("shape=%s면 %s 모양으로 그린다", (shape, expected) => {
    expect(getBody({ ...PIECE, shape })).toHaveClass(expected);
  });
});
