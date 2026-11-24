import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SenderNameInput from "@/widgets/letter-paper/SenderNameInput";

const nameInput = () => screen.getByRole("textbox", { name: "친구에게 보여질 이름" });

function renderInput(props: Partial<React.ComponentProps<typeof SenderNameInput>> = {}) {
  return render(
    <SenderNameInput name="" onNameChange={vi.fn()} onBlur={vi.fn()} color="orange" {...props} />,
  );
}

describe("SenderNameInput", () => {
  it("이름이 비어 있으면 안내 문구가 보인다", () => {
    renderInput();

    expect(nameInput()).toHaveAttribute("placeholder", "당신의 이름은 무엇인가요?");
  });

  it("이름은 8글자까지만 입력할 수 있다", () => {
    renderInput();

    expect(nameInput()).toHaveAttribute("maxlength", "8");
  });

  it("입력하면 onNameChange가 입력값으로 호출된다", async () => {
    const onNameChange = vi.fn();
    renderInput({ onNameChange });

    await userEvent.type(nameInput(), "민");

    expect(onNameChange).toHaveBeenCalledWith("민");
  });
});
