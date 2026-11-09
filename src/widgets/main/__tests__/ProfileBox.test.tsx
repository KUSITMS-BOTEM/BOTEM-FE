import { render, screen } from "@testing-library/react";

import ProfileBox from "@/widgets/main/ProfileBox";

describe("ProfileBox", () => {
  it("profiles 개수만큼 아바타(svg)를 렌더한다", () => {
    const { container } = render(<ProfileBox profiles={["orange", "lime", "pink"]} />);

    expect(container.querySelectorAll("svg")).toHaveLength(3);
  });

  it("profiles가 빈 배열이면 아바타가 없다", () => {
    const { container } = render(<ProfileBox profiles={[]} />);

    expect(container.querySelectorAll("svg")).toHaveLength(0);
  });

  it("extraCount를 전달하지 않으면 '+N'을 숨긴다", () => {
    render(<ProfileBox profiles={["orange"]} />);

    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("extraCount가 0이면 '+N'을 숨긴다", () => {
    render(<ProfileBox profiles={["orange"]} extraCount={0} />);

    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("extraCount가 5면 '+5'를 표시한다", () => {
    render(<ProfileBox profiles={["orange"]} extraCount={5} />);

    expect(screen.getByText("+5")).toBeInTheDocument();
  });

  it("extraCount가 99를 넘으면 '+99'로 제한된다", () => {
    render(<ProfileBox profiles={["orange"]} extraCount={100} />);

    expect(screen.getByText("+99")).toBeInTheDocument();
  });

  it("notification이 true면 '새 알림'이 보인다", () => {
    render(<ProfileBox profiles={["orange"]} notification />);

    expect(screen.getByRole("img", { name: "새 알림" })).toBeInTheDocument();
  });

  it("notification 기본값에서는 '새 알림'이 없다", () => {
    render(<ProfileBox profiles={["orange"]} />);

    expect(screen.queryByRole("img", { name: "새 알림" })).not.toBeInTheDocument();
  });

  it("스크린 리더에 전체 참여자 수(profiles + extraCount)를 제공한다", () => {
    render(<ProfileBox profiles={["orange", "lime"]} extraCount={3} />);

    expect(screen.getByText("참여자 5명")).toBeInTheDocument();
  });
});
