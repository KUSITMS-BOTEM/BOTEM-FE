import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CheckBox from "@/components/CheckBox";

describe("CheckBox", () => {
  describe("label", () => {
    it("label을 전달하면 checkbox의 접근 가능한 이름이 된다", () => {
      render(<CheckBox label="약관 동의" />);

      expect(screen.getByRole("checkbox", { name: "약관 동의" })).toBeInTheDocument();
    });

    it("label을 생략하면 라벨 영역에 텍스트가 렌더되지 않는다", () => {
      render(<CheckBox />);

      expect(screen.getByRole("checkbox").closest("label")).toHaveTextContent("");
    });

    it("label이 빈 문자열이면 텍스트가 렌더되지 않는다", () => {
      render(<CheckBox label="" />);

      expect(screen.getByRole("checkbox").closest("label")).toHaveTextContent("");
    });

    it("label이 숫자 0이어도 레이블 텍스트 영역에 렌더된다", () => {
      render(<CheckBox label={0} />);

      const label = screen.getByRole("checkbox", { name: "0" }).closest("label");
      expect(screen.getByText("0")).not.toBe(label);
    });

    it("링크가 포함된 label도 접근 가능한 이름이 되고, 텍스트를 클릭하면 토글된다", async () => {
      const user = userEvent.setup();
      render(
        <CheckBox
          label={
            <>
              <a href="#terms">이용약관</a>에 동의
            </>
          }
        />,
      );
      const checkbox = screen.getByRole("checkbox", { name: "이용약관에 동의" });

      await user.click(screen.getByText("에 동의", { exact: false }));

      expect(checkbox).toBeChecked();
    });
  });

  describe("상호작용", () => {
    it("클릭하면 체크되고 다시 클릭하면 해제된다", async () => {
      const user = userEvent.setup();
      render(<CheckBox label="약관 동의" />);
      const checkbox = screen.getByRole("checkbox");

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("라벨 텍스트를 클릭해도 체크 상태가 토글된다", async () => {
      const user = userEvent.setup();
      render(<CheckBox label="약관 동의" />);

      await user.click(screen.getByText("약관 동의"));

      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("Space 키를 누르면 포커스된 checkbox가 토글된다", async () => {
      const user = userEvent.setup();
      render(<CheckBox label="약관 동의" />);

      await user.tab();
      await user.keyboard(" ");

      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("클릭하면 onChange가 호출된다", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<CheckBox label="약관 동의" onChange={handleChange} />);

      await user.click(screen.getByRole("checkbox"));

      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("checked / defaultChecked", () => {
    it("defaultChecked를 주면 초기에 체크된 상태로 렌더된다", () => {
      render(<CheckBox defaultChecked label="약관 동의" />);

      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("checked를 부모가 제어하면 부모 상태 변경에 따라서만 값이 바뀐다", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { rerender } = render(<CheckBox checked={false} onChange={handleChange} />);
      const checkbox = screen.getByRole("checkbox");

      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(checkbox).not.toBeChecked();

      rerender(<CheckBox checked onChange={handleChange} />);
      expect(checkbox).toBeChecked();
    });

    it("state와 연결하면 클릭 시 체크 상태가 갱신된다", async () => {
      function Controlled() {
        const [checked, setChecked] = useState(false);
        return <CheckBox checked={checked} onChange={e => setChecked(e.target.checked)} />;
      }
      const user = userEvent.setup();
      render(<Controlled />);

      await user.click(screen.getByRole("checkbox"));

      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  describe("disabled", () => {
    it("disabled를 생략하면 기본값 false가 적용되어 활성 상태다", () => {
      render(<CheckBox label="약관 동의" />);

      expect(screen.getByRole("checkbox")).toBeEnabled();
    });

    it("disabled=true면 input이 비활성화되고 라벨에 opacity-30·cursor-not-allowed가 적용된다", () => {
      render(<CheckBox disabled label="약관 동의" />);
      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label");

      expect(checkbox).toBeDisabled();
      expect(label?.className).toContain("opacity-30");
      expect(label?.className).toContain("cursor-not-allowed");
    });

    it("disabled=true 상태에서는 클릭해도 onChange가 호출되지 않고 체크되지 않는다", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<CheckBox disabled label="약관 동의" onChange={handleChange} />);

      await user.click(screen.getByRole("checkbox"));

      expect(handleChange).not.toHaveBeenCalled();
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });
  });

  describe("props 전달", () => {
    it("className이 기존 클래스와 함께 병합되어 라벨에 적용된다", () => {
      render(<CheckBox className="mt-4" label="약관 동의" />);
      const label = screen.getByRole("checkbox").closest("label");

      expect(label?.className).toContain("mt-4");
      expect(label?.className).toContain("inline-flex");
    });

    it("name, value, aria-describedby 같은 input 속성이 그대로 전달된다", () => {
      render(<CheckBox name="terms" value="agree" aria-describedby="help" />);
      const checkbox = screen.getByRole("checkbox");

      expect(checkbox).toHaveAttribute("name", "terms");
      expect(checkbox).toHaveAttribute("value", "agree");
      expect(checkbox).toHaveAttribute("aria-describedby", "help");
    });
  });
});
