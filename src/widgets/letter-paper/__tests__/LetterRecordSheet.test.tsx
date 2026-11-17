import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LetterRecordSheet from "@/widgets/letter-paper/LetterRecordSheet";

function renderSheet(props: Partial<React.ComponentProps<typeof LetterRecordSheet>> = {}) {
  const handlers = {
    onStart: vi.fn(),
    onStop: vi.fn(),
    onDone: vi.fn(),
    onClose: vi.fn(),
  };
  render(
    <LetterRecordSheet
      status="idle"
      error={null}
      color="lime"
      transcript=""
      interim=""
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

describe("LetterRecordSheet", () => {
  it("대기 중에는 안내 문구와 녹음 시작 버튼이 보이고 누르면 onStart가 호출된다", async () => {
    const { onStart } = renderSheet();
    expect(screen.getByText(/최대 30초까지 녹음하며/)).toBeInTheDocument();
    expect(screen.getByText("탭으로 녹음 시작")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "녹음 시작" }));

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("녹음 중에는 선택한 색 버튼과 자막이 보이고 누르면 onStop이 호출된다", async () => {
    const { onStop } = renderSheet({ status: "recording", transcript: "생일 축하해" });
    const button = screen.getByRole("button", { name: "녹음 중지" });
    expect(button).toHaveClass("bg-semantic-fill-lime");
    expect(screen.getByText("생일")).toBeInTheDocument();
    expect(screen.getByText("탭하면 녹음이 중지돼요")).toBeInTheDocument();

    await userEvent.click(button);

    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("완료되면 자막 전체와 재녹음·녹음 완료 버튼이 보인다", async () => {
    const { onStart, onDone } = renderSheet({ status: "done", transcript: "생일 축하해 정말로" });
    expect(screen.getByText("생일 축하해 정말로")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "재녹음" }));
    await userEvent.click(screen.getByRole("button", { name: "녹음 완료" }));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("자막이 비어 있으면 안내 문구를 보여준다", () => {
    renderSheet({ status: "done", transcript: "" });

    expect(screen.getByText("자막을 만들지 못했어요")).toBeInTheDocument();
  });

  it("지원하지 않는 브라우저면 안내 문구를 보이고 녹음 버튼이 비활성이다", () => {
    renderSheet({ error: "unsupported" });

    expect(screen.getByText("이 브라우저에서는 녹음할 수 없어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "녹음 시작" })).toBeDisabled();
  });

  it("마이크 권한을 거부했으면 안내 문구를 보이고 다시 시도할 수 있다", () => {
    renderSheet({ error: "denied" });

    expect(screen.getByRole("alert")).toHaveTextContent("마이크 권한을 허용해 주세요");
    expect(screen.getByRole("button", { name: "녹음 시작" })).toBeEnabled();
  });

  it("마이크를 사용할 수 없으면 권한 안내와 다른 문구를 alert로 보인다", () => {
    renderSheet({ error: "unavailable" });

    expect(screen.getByRole("alert")).toHaveTextContent("마이크를 사용할 수 없어요");
  });

  it("닫기 버튼을 누르면 onClose가 호출된다", async () => {
    const { onClose } = renderSheet();

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
