import { render } from "@testing-library/react";

import FundingResultFriendDot from "@/widgets/funding/FundingResultFriendDot";
import { FRIEND_SPOTS } from "@/widgets/funding/fundingResultMotion";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

describe("FundingResultFriendDot", () => {
  it("프로필 사진이 있으면 친구 프로필 사진을 그린다", () => {
    const { container } = render(
      <FundingResultFriendDot
        index={0}
        count={8}
        contributor={{ userId: 1, profileImageUrl: "https://example.com/me.png" }}
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/me.png");
  });

  it.each([
    ["사진이 없으면", undefined],
    ["http(s)가 아닌 URL이면", "javascript:alert(1)"],
  ])("%s 기본 프로필 아이콘을 그린다", (_, profileImageUrl) => {
    const { container } = render(
      <FundingResultFriendDot index={0} count={8} contributor={{ userId: 1, profileImageUrl }} />,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("맡은 조각 방향의 Figma 자리에서 출발한다", () => {
    const { container } = render(
      <FundingResultFriendDot index={0} count={1} contributor={{ userId: 1 }} />,
    );

    expect(container.firstElementChild).toHaveClass(...FRIEND_SPOTS[4].className.split(" "));
  });
});
