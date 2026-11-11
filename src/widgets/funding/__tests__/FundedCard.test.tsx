import { fireEvent, render, screen } from "@testing-library/react";

import FundedCard from "@/widgets/funding/FundedCard";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

const BASE = {
  productName: "에어팟",
  productImageUrl: "/airpods.png",
  participantCount: 8,
};

describe("FundedCard", () => {
  it("목표를 달성하면 '목표 달성', 아니면 '모인 만큼 전달'과 참여 인원을 보여준다", () => {
    const { rerender } = render(<FundedCard {...BASE} fundingType="BIRTHDAY" goalAchieved />);
    expect(screen.getByText("목표 달성 · 8명 참여")).toBeInTheDocument();

    rerender(<FundedCard {...BASE} fundingType="BIRTHDAY" goalAchieved={false} />);
    expect(screen.getByText("모인 만큼 전달 · 8명 참여")).toBeInTheDocument();
  });

  it.each([
    ["NEED", ["인증 필요", "내 생일"]],
    ["DONE", ["인증 완료", "내 생일"]],
    [undefined, ["내 생일"]],
  ] as const)("내 생일 펀딩은 인증 상태 %s에 맞는 배지를 보여준다", (proofStatus, labels) => {
    const { container } = render(
      <FundedCard {...BASE} fundingType="BIRTHDAY" goalAchieved proofStatus={proofStatus} />,
    );

    const badges = [...container.querySelectorAll("span.rounded-lg")].map(el => el.textContent);
    expect(badges).toEqual(labels);
  });

  it("서프라이즈 펀딩은 받는 사람 이름의 서프라이즈 배지만 보여준다", () => {
    render(<FundedCard {...BASE} fundingType="SURPRISE" goalAchieved recipientName="서준" />);

    expect(screen.getByText("서준 서프라이즈")).toBeInTheDocument();
    expect(screen.queryByText("내 생일")).not.toBeInTheDocument();
  });

  it("이미지 URL이 비어 있으면 이미지를 그리지 않는다", () => {
    const { container } = render(
      <FundedCard {...BASE} productImageUrl="" fundingType="BIRTHDAY" goalAchieved />,
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("이미지 로드에 실패하면 이미지를 지운다", () => {
    const { container } = render(<FundedCard {...BASE} fundingType="BIRTHDAY" goalAchieved />);

    fireEvent.error(container.querySelector("img")!);

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});
