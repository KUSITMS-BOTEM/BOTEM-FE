import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import KakaoLoginButton from "@/components/KakaoLoginButton";

describe("KakaoLoginButton", () => {
  it("children으로 전달한 텍스트가 그대로 렌더된다", () => {
    render(<KakaoLoginButton>카카오 로그인</KakaoLoginButton>);

    expect(screen.getByRole("button", { name: "카카오 로그인" })).toBeInTheDocument();
  });

  it("onClick이 전달되면 클릭 시 호출된다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<KakaoLoginButton onClick={handleClick}>카카오 로그인</KakaoLoginButton>);

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("className prop이 기존 클래스와 함께 병합되어 적용된다", () => {
    render(<KakaoLoginButton className="mt-4">카카오 로그인</KakaoLoginButton>);
    const button = screen.getByRole("button");

    expect(button.className).toContain("mt-4");
    expect(button.className).toContain("bg-[#FEE500]");
  });

  it("disabled 같은 button HTML 속성이 그대로 전달된다", () => {
    render(<KakaoLoginButton disabled>카카오 로그인</KakaoLoginButton>);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
