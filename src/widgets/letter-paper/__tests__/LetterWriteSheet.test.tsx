import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LetterWriteSheet from "@/widgets/letter-paper/LetterWriteSheet";

function renderSheet(props: Partial<React.ComponentProps<typeof LetterWriteSheet>> = {}) {
  return render(
    <LetterWriteSheet open onClose={vi.fn()} recipientName="지유" isLoggedIn {...props} />,
  );
}

const nameInput = () => screen.queryByRole("textbox", { name: "친구에게 보여질 이름" });
const letterInput = () => screen.getByRole("textbox", { name: "편지 내용" });
// plaintext-only는 user-event가 편집 가능으로 보지 않아 내용을 넣고 input 이벤트를 직접 발생시킨다
const typeLetter = (value: string) => {
  letterInput().textContent = value;
  fireEvent.input(letterInput());
};

describe("LetterWriteSheet", () => {
  it("수신자 이름이 들어간 제목과 안내 문구를 보여준다", () => {
    renderSheet();

    expect(screen.getByText(/지유에게 직접/)).toBeInTheDocument();
    expect(screen.getByText("지유야 생일 축하해!")).toBeInTheDocument();
  });

  it("받침이 있는 이름에는 '아'를 붙인다", () => {
    renderSheet({ recipientName: "민준" });

    expect(screen.getByText("민준아 생일 축하해!")).toBeInTheDocument();
  });

  it("편지를 입력하기 시작하면 안내 문구가 사라진다", async () => {
    renderSheet();

    typeLetter("안녕");

    expect(screen.queryByText("지유야 생일 축하해!")).not.toBeInTheDocument();
    expect(letterInput()).toHaveTextContent("안녕");
  });

  it("로그인 상태에서는 이름 입력란이 없다", () => {
    renderSheet({ isLoggedIn: true });

    expect(nameInput()).not.toBeInTheDocument();
  });

  it("비로그인 상태에서는 이름 입력란이 있고 이름을 적을 수 있다", async () => {
    renderSheet({ isLoggedIn: false });

    await userEvent.type(nameInput()!, "민수");

    expect(nameInput()).toHaveValue("민수");
  });

  it("이름을 적고 포커스를 벗어나면 입력란이 사라지고 From 영역을 누르면 다시 나타난다", async () => {
    renderSheet({ isLoggedIn: false });

    await userEvent.type(nameInput()!, "민수");
    await userEvent.tab();
    expect(nameInput()).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /From\. 민수/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /From\. 민수/ }));
    expect(nameInput()).toHaveValue("민수");
    expect(nameInput()).toHaveFocus();
  });

  it("입력란이 열려 있을 때 From 영역을 누르면 누르는 순간 사라지지 않고 클릭이 끝나면 접힌다", async () => {
    renderSheet({ isLoggedIn: false });
    await userEvent.type(nameInput()!, "민수");
    const from = screen.getByRole("button", { name: /From\. 민수/ });

    fireEvent.mouseDown(from);
    expect(nameInput()).toBeInTheDocument();

    await userEvent.click(from);
    expect(nameInput()).not.toBeInTheDocument();
  });

  it("이름이 비어 있으면 포커스를 벗어나도 입력란이 남는다", async () => {
    renderSheet({ isLoggedIn: false });

    await userEvent.click(nameInput()!);
    await userEvent.tab();

    expect(nameInput()).toBeInTheDocument();
  });

  it("로그인 상태에서는 From 영역이 버튼이 아니다", () => {
    renderSheet({ isLoggedIn: true });

    expect(screen.queryByRole("button", { name: /From\./ })).not.toBeInTheDocument();
  });

  it("로그인 상태에서는 편지가 비어 있으면 다음이 비활성이고 적으면 활성이다", async () => {
    renderSheet();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();

    typeLetter("생일 축하해");

    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
  });

  it("비로그인 상태에서는 이름까지 적어야 다음이 활성이다", async () => {
    renderSheet({ isLoggedIn: false });

    typeLetter("생일 축하해");
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();

    await userEvent.type(nameInput()!, "민수");
    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
  });

  it("다음을 누르면 입력한 값과 선택한 색으로 onNext가 호출된다", async () => {
    const onNext = vi.fn();
    renderSheet({ isLoggedIn: false, onNext });

    typeLetter("생일 축하해");
    await userEvent.type(nameInput()!, "민수");
    await userEvent.click(screen.getByRole("button", { name: "파랑" }));
    await userEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(onNext).toHaveBeenCalledWith({ text: "생일 축하해", name: "민수", color: "blue" });
  });

  it("시트를 닫았다 다시 열면 빈 편지로 시작한다", async () => {
    const { rerender } = renderSheet();
    typeLetter("생일 축하해");

    await userEvent.click(screen.getByRole("button", { name: "이전" }));
    rerender(<LetterWriteSheet open={false} onClose={vi.fn()} recipientName="지유" isLoggedIn />);
    await waitFor(() => expect(screen.queryByRole("textbox", { name: "편지 내용" })).toBeNull());
    rerender(<LetterWriteSheet open onClose={vi.fn()} recipientName="지유" isLoggedIn />);

    expect(await screen.findByRole("button", { name: "다음" })).toBeDisabled();
    expect(letterInput()).toBeEmptyDOMElement();
  });

  it("이전 버튼을 누르면 onClose가 호출된다", async () => {
    const onClose = vi.fn();
    renderSheet({ onClose });

    await userEvent.click(screen.getByRole("button", { name: "이전" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("편지지에 포커스가 가면 말풍선이 사라진다", async () => {
    renderSheet();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    await userEvent.click(letterInput());

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("비로그인 상태에서 이름 입력란에 포커스가 가도 말풍선이 사라진다", async () => {
    renderSheet({ isLoggedIn: false });

    await userEvent.click(nameInput()!);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("플러스 버튼으로 툴 영역을 열고 X로 닫으면 말풍선은 다시 나타나지 않는다", async () => {
    renderSheet();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.queryByText("어떤 툴을 추가할까요?")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "나만의 편지 만들기" }));
    expect(screen.getByText("어떤 툴을 추가할까요?")).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("button", { name: "닫기" }).at(-1)!);
    expect(screen.queryByText("어떤 툴을 추가할까요?")).not.toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
