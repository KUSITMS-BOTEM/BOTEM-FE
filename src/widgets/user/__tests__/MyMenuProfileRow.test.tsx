import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MyMenuProfileRow from "@/widgets/user/MyMenuProfileRow";

describe("MyMenuProfileRow", () => {
  it("이름과 생일 문구를 보여주고, 누르면 onClick을 호출한다", async () => {
    const onClick = vi.fn();
    render(<MyMenuProfileRow nickname="지유" birthdayText="생일 10월 13일" onClick={onClick} />);

    const row = screen.getByRole("button");
    expect(row).toHaveTextContent("지유");
    expect(row).toHaveTextContent("생일 10월 13일");

    await userEvent.click(row);
    expect(onClick).toHaveBeenCalled();
  });

  it("생일 문구가 없으면 생일 줄을 보여주지 않는다", () => {
    render(<MyMenuProfileRow nickname="지유" onClick={vi.fn()} />);

    expect(screen.queryByText(/생일/)).not.toBeInTheDocument();
  });
});
