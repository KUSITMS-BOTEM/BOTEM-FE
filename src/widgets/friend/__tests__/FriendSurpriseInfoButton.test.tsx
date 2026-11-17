import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FriendSurpriseInfoButton from "@/widgets/friend/FriendSurpriseInfoButton";

const openButton = () => screen.getByRole("button", { name: "서프라이즈 펀딩 안내" });

describe("FriendSurpriseInfoButton", () => {
  it("처음에는 안내 툴팁이 닫혀 있다", () => {
    render(<FriendSurpriseInfoButton />);

    expect(openButton()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("버튼을 누르면 서프라이즈 펀딩 안내가 열리고, 다시 누르면 닫힌다", async () => {
    const user = userEvent.setup();
    render(<FriendSurpriseInfoButton />);

    await user.click(openButton());
    expect(openButton()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("tooltip")).toHaveTextContent("비밀로 진행되는 펀딩이에요");

    await user.click(openButton());
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("툴팁 바깥을 누르면 닫힌다", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <p>바깥</p>
        <FriendSurpriseInfoButton />
      </div>,
    );

    await user.click(openButton());
    await user.click(screen.getByText("바깥"));

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("Esc를 누르면 닫힌다", async () => {
    const user = userEvent.setup();
    render(<FriendSurpriseInfoButton />);

    await user.click(openButton());
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
