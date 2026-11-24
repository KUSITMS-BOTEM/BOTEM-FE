import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SurpriseRevealBanner from "@/widgets/home/SurpriseRevealBanner";

const renderBanner = (participantCount: number) => {
  const onOpen = vi.fn();
  const onClose = vi.fn();
  render(
    <SurpriseRevealBanner
      organizerName="민준"
      participantCount={participantCount}
      onOpen={onOpen}
      onClose={onClose}
    />,
  );
  return { onOpen, onClose };
};

describe("SurpriseRevealBanner", () => {
  it("제목과 주최자 외 함께한 인원을 보여준다", () => {
    renderBanner(8);

    expect(screen.getByText("친구들이 몰래 준비한 선물이 있어요")).toBeInTheDocument();
    expect(screen.getByText("민준외 7명이 함께 준비했어요")).toBeInTheDocument();
  });

  it("주최자 혼자 준비했으면 함께한 인원 없이 주최자만 보여준다", () => {
    renderBanner(1);

    expect(screen.getByText("민준님이 준비했어요")).toBeInTheDocument();
  });

  it("참여자가 0명이어도 음수 인원을 보여주지 않는다", () => {
    renderBanner(0);

    expect(screen.getByText("민준님이 준비했어요")).toBeInTheDocument();
  });

  it("'열어보기'를 누르면 onOpen을 호출한다", async () => {
    const { onOpen } = renderBanner(3);

    await userEvent.click(screen.getByRole("button", { name: "열어보기" }));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("닫기를 누르면 onClose를 호출한다", async () => {
    const { onClose } = renderBanner(3);

    await userEvent.click(screen.getByRole("button", { name: "서프라이즈 선물 안내 닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
