import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LetterWriteBody from "@/widgets/letter-paper/LetterWriteBody";

const letterInput = () => screen.getByRole("textbox", { name: "편지 내용" });
const nameInput = () => screen.queryByRole("textbox", { name: "친구에게 보여질 이름" });

describe("LetterWriteBody", () => {
  it("편지가 비어 있으면 안내문이 보이고 내용이 있으면 사라진다", () => {
    const { rerender } = render(
      <LetterWriteBody text="" onTextChange={vi.fn()} placeholder="지유야 생일 축하해!" />,
    );
    expect(screen.getByText("필수 작성)")).toBeInTheDocument();
    expect(screen.getByText("지유야 생일 축하해!")).toBeInTheDocument();

    rerender(
      <LetterWriteBody text="안녕" onTextChange={vi.fn()} placeholder="지유야 생일 축하해!" />,
    );
    expect(screen.queryByText("필수 작성)")).not.toBeInTheDocument();
    expect(screen.queryByText("지유야 생일 축하해!")).not.toBeInTheDocument();
  });

  it("편지를 입력하면 onTextChange가 입력값으로 호출된다", async () => {
    const onTextChange = vi.fn();
    render(<LetterWriteBody text="" onTextChange={onTextChange} placeholder="p" />);

    letterInput().textContent = "a";
    fireEvent.input(letterInput());

    expect(onTextChange).toHaveBeenCalledWith("a");
  });

  it("이름은 8글자까지만 입력할 수 있다", () => {
    render(
      <LetterWriteBody
        text=""
        onTextChange={vi.fn()}
        placeholder="p"
        name=""
        onNameChange={vi.fn()}
      />,
    );

    expect(nameInput()).toHaveAttribute("maxlength", "8");
  });

  it("onNameChange가 없으면 이름 입력란이 없다", () => {
    render(<LetterWriteBody text="" onTextChange={vi.fn()} placeholder="p" />);

    expect(nameInput()).not.toBeInTheDocument();
  });

  it("onNameChange가 있으면 이름 입력란이 있고 입력하면 호출된다", async () => {
    const onNameChange = vi.fn();
    render(
      <LetterWriteBody
        text=""
        onTextChange={vi.fn()}
        placeholder="p"
        name=""
        onNameChange={onNameChange}
      />,
    );

    await userEvent.type(nameInput()!, "민");

    expect(onNameChange).toHaveBeenCalledWith("민");
  });

  describe("편지지를 넘치는 입력", () => {
    function Harness({ onTextChange }: { onTextChange: (text: string) => void }) {
      const [text, setText] = useState("");
      return (
        <LetterWriteBody
          text={text}
          onTextChange={value => {
            setText(value);
            onTextChange(value);
          }}
          placeholder="p"
        />
      );
    }

    // jsdom에는 레이아웃이 없어 편집 영역 높이와 본문 영역(LetterPaper의 p) 높이를 직접 지정한다
    const setHeights = (editorHeight: number, areaHeight = 243) => {
      Object.defineProperty(letterInput(), "offsetHeight", {
        configurable: true,
        value: editorHeight,
      });
      Object.defineProperty(letterInput().parentElement!, "clientHeight", {
        configurable: true,
        value: areaHeight,
      });
    };
    const type = (value: string) => {
      letterInput().textContent = value;
      fireEvent.input(letterInput());
    };

    it("영역 안에 들어가는 글은 그대로 입력된다", () => {
      render(<Harness onTextChange={vi.fn()} />);
      setHeights(243);

      type("안녕");

      expect(letterInput()).toHaveTextContent("안녕");
    });

    it("영역을 넘치는 글은 직전에 들어맞던 글로 되돌린다", () => {
      const onTextChange = vi.fn();
      render(<Harness onTextChange={onTextChange} />);
      setHeights(243);
      type("안녕");

      setHeights(270);
      type("안녕하세요");

      expect(letterInput()).toHaveTextContent(/^안녕$/);
      expect(onTextChange).toHaveBeenLastCalledWith("안녕");
    });

    it("한글 조합 중에는 글을 되돌리지 않고 조합이 끝난 뒤에 되돌린다", () => {
      render(<Harness onTextChange={vi.fn()} />);
      setHeights(243);
      type("안녕");

      setHeights(270);
      fireEvent.compositionStart(letterInput());
      type("안녕하");
      expect(letterInput()).toHaveTextContent("안녕하");

      fireEvent.compositionEnd(letterInput());
      expect(letterInput()).toHaveTextContent(/^안녕$/);
    });

    it("반올림으로 생기는 1px 오차는 넘친 것으로 보지 않는다", () => {
      render(<Harness onTextChange={vi.fn()} />);
      setHeights(244);

      type("안녕하세요");

      expect(letterInput()).toHaveTextContent("안녕하세요");
    });
  });
});
