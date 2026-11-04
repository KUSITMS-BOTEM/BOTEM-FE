import { render, screen } from "@testing-library/react";

import FieldMessage from "@/components/FieldMessage";

describe("FieldMessage", () => {
  it("state를 생략하면 default 글자색(tertiary)이다", () => {
    render(<FieldMessage>안내</FieldMessage>);

    expect(screen.getByText("안내").closest("div")).toHaveClass("text-semantic-text-tertiary");
  });

  it("state가 error이면 danger 글자색이다", () => {
    render(<FieldMessage state="error">안내</FieldMessage>);

    expect(screen.getByText("안내").closest("div")).toHaveClass("text-semantic-text-danger");
  });

  it("state가 success이면 success 글자색이다", () => {
    render(<FieldMessage state="success">안내</FieldMessage>);

    expect(screen.getByText("안내").closest("div")).toHaveClass("text-semantic-text-success");
  });

  it.each(["default", "error", "success"] as const)(
    "state가 %s여도 아이콘 svg는 스크린리더에서 숨겨진다",
    state => {
      const { container } = render(<FieldMessage state={state}>안내</FieldMessage>);

      expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    },
  );

  it("id를 넘기면 문구 요소에 그대로 적용된다", () => {
    render(<FieldMessage id="field-help">안내</FieldMessage>);

    expect(screen.getByText("안내").closest("div")).toHaveAttribute("id", "field-help");
  });

  it("블록 요소를 children으로 넣어도 p 안에 중첩되지 않는다", () => {
    render(
      <FieldMessage>
        <div>블록 안내</div>
      </FieldMessage>,
    );

    expect(screen.getByText("블록 안내").closest("p")).toBeNull();
  });
});
