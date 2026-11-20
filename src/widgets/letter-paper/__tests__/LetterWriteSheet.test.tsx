import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LetterWriteSheet, { type LetterWriteValues } from "@/widgets/letter-paper/LetterWriteSheet";

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

const scrollIntoView = vi.fn();

describe("LetterWriteSheet", () => {
  // jsdom에는 scrollIntoView가 없다
  beforeEach(() => {
    scrollIntoView.mockClear();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  it("툴 영역을 열면 화면에 보이도록 가장 가까운 위치로 스크롤한다", async () => {
    renderSheet();
    expect(scrollIntoView).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "나만의 편지 만들기" }));

    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest", behavior: "smooth" });
  });

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

    expect(onNext).toHaveBeenCalledWith({
      text: "생일 축하해",
      name: "민수",
      color: "blue",
      paperStyle: "vividSolid",
    });
  });

  it("편지지 툴에서 style을 고르면 선택 표시가 되고 onNext에 담긴다", async () => {
    const onNext = vi.fn();
    renderSheet({ onNext });
    typeLetter("생일 축하해");
    await userEvent.click(screen.getByRole("button", { name: "나만의 편지 만들기" }));
    await userEvent.click(screen.getByRole("button", { name: "편지지" }));
    expect(screen.getByText("어떤 편지지를 쓸까요?")).toBeInTheDocument();

    scrollIntoView.mockClear();
    await userEvent.click(screen.getByRole("button", { name: "컬러 도트 편지지" }));
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start", behavior: "smooth" });
    expect(screen.getByRole("button", { name: "컬러 도트 편지지" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ paperStyle: "colorDot" }));
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

  describe("사진", () => {
    const openPhotoMode = async () => {
      await userEvent.click(screen.getByRole("button", { name: "나만의 편지 만들기" }));
      await userEvent.click(screen.getByRole("button", { name: "사진 추가" }));
    };
    const addPhoto = async (container: HTMLElement) => {
      await userEvent.upload(
        container.querySelector("input[type=file]")!,
        new File(["x"], "a.png", { type: "image/png" }),
      );
      await screen.findByAltText("선택한 사진");
    };

    beforeEach(() => {
      URL.createObjectURL = vi.fn(() => "blob:photo");
      URL.revokeObjectURL = vi.fn();
      global.createImageBitmap = vi
        .fn()
        .mockResolvedValue({ close: vi.fn() }) as unknown as typeof createImageBitmap;
    });

    it("사진 추가 툴을 고르면 툴 영역이 사라지고 사진 슬롯만 활성화되며 빈 아이콘 슬롯은 숨겨진다", async () => {
      renderSheet();

      await openPhotoMode();

      expect(screen.queryByText("어떤 툴을 추가할까요?")).not.toBeInTheDocument();
      const photoSlot = screen.getByRole("button", { name: "사진 선택" });
      expect(photoSlot).toBeEnabled();
      expect(photoSlot).toHaveClass("border-solid");
      for (const slot of screen.getAllByRole("button", { name: /아이콘 선택/, hidden: true })) {
        expect(slot.parentElement).toHaveClass("invisible");
      }
    });

    it("사진을 추가하면 삭제 버튼이 생기고, 누르면 사진이 지워져 다시 고를 수 있다", async () => {
      const { container } = renderSheet();
      await openPhotoMode();
      await addPhoto(container);

      await userEvent.click(screen.getByRole("button", { name: "사진 삭제" }));

      expect(screen.queryByAltText("선택한 사진")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "사진 선택" })).toBeEnabled();
    });

    it("사진이 추가되면 숨겨졌던 아이콘 슬롯이 다시 보이고, 사진을 지우면 다시 숨겨진다", async () => {
      const { container } = renderSheet();
      await openPhotoMode();
      const iconSlots = () => screen.getAllByRole("button", { name: /아이콘 선택/, hidden: true });

      await addPhoto(container);
      for (const slot of iconSlots()) expect(slot.parentElement).not.toHaveClass("invisible");

      await userEvent.click(screen.getByRole("button", { name: "사진 삭제" }));
      for (const slot of iconSlots()) expect(slot.parentElement).toHaveClass("invisible");
    });

    it("사진이 있을 때 툴 영역에서 사진 추가를 다시 고르면 사진이 지워지고 활성화된 빈 슬롯이 보인다", async () => {
      const { container } = renderSheet();
      await openPhotoMode();
      await addPhoto(container);
      await userEvent.click(screen.getByRole("button", { name: "나만의 편지 만들기" }));

      await userEvent.click(screen.getByRole("button", { name: "사진 추가" }));

      expect(screen.queryByAltText("선택한 사진")).not.toBeInTheDocument();
      const photoSlot = screen.getByRole("button", { name: "사진 선택" });
      expect(photoSlot).toBeEnabled();
      expect(photoSlot).toHaveClass("border-solid");
    });

    it("사진이 있을 때 스티커 툴을 고르면 사진이 숨겨지지 않고 그대로 남는다", async () => {
      const { container } = renderSheet();
      await openPhotoMode();
      await addPhoto(container);
      await userEvent.click(screen.getByRole("button", { name: "나만의 편지 만들기" }));

      await userEvent.click(screen.getByRole("button", { name: "스티커" }));

      expect(screen.getByAltText("선택한 사진").closest(".invisible")).toBeNull();
    });

    it("사진을 넣고 다음을 누르면 photo가 전달된다", async () => {
      const onNext = vi.fn();
      const { container } = renderSheet({ onNext });
      await openPhotoMode();
      await addPhoto(container);
      typeLetter("안녕");

      await userEvent.click(screen.getByRole("button", { name: "다음" }));

      expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ photo: expect.any(File) }));
    });

    it("플러스 버튼으로 툴 영역을 다시 열면 사진 슬롯 강조가 풀린다", async () => {
      renderSheet();
      await openPhotoMode();

      await userEvent.click(screen.getByRole("button", { name: "나만의 편지 만들기" }));

      expect(screen.getByText("어떤 툴을 추가할까요?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "사진 선택" })).toBeDisabled();
    });
  });

  describe("스티커", () => {
    const openStickerSheet = async () => {
      await userEvent.click(screen.getByRole("button", { name: "나만의 편지 만들기" }));
      await userEvent.click(screen.getByRole("button", { name: "스티커" }));
    };
    const slots = () => screen.getAllByRole("button", { name: /아이콘 선택/ });

    it("스티커 툴을 고르면 스티커 시트가 열리고 사진 슬롯이 숨겨진다", async () => {
      renderSheet();
      expect(screen.getByRole("button", { name: "사진 선택" }).parentElement).not.toHaveClass(
        "invisible",
      );

      await openStickerSheet();

      expect(screen.getByText("아이콘을 편지지에 붙여보세요")).toBeInTheDocument();
      expect(screen.queryByText("어떤 툴을 추가할까요?")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "사진 선택" }).parentElement).toHaveClass(
        "invisible",
      );
    });

    it("편지 작성 화면에서는 사진 슬롯을 누를 수 없다", () => {
      renderSheet();

      expect(screen.getByRole("button", { name: "사진 선택" })).toBeDisabled();
    });

    it("스티커를 고르고 슬롯을 누르면 그 슬롯에만 스티커가 붙는다", async () => {
      renderSheet();
      await openStickerSheet();

      await userEvent.click(screen.getByRole("button", { name: "하트" }));
      await userEvent.click(slots()[0]);

      expect(screen.getAllByRole("button", { name: /아이콘 삭제/ })).toHaveLength(1);
    });

    it("스티커를 고르지 않고 슬롯을 누르면 아무것도 붙지 않는다", async () => {
      renderSheet();
      await openStickerSheet();

      await userEvent.click(slots()[0]);

      expect(screen.queryByRole("button", { name: /아이콘 삭제/ })).not.toBeInTheDocument();
    });

    it("스티커 시트가 닫혀 있으면 슬롯 버튼은 비활성화된다", () => {
      renderSheet();

      slots().forEach(slot => expect(slot).toBeDisabled());
    });

    it("큰 슬롯과 작은 슬롯은 접근 가능한 이름으로 구분된다", () => {
      renderSheet();

      expect(screen.getByRole("button", { name: "큰 아이콘 선택" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "작은 아이콘 선택" })).toBeInTheDocument();
    });

    it("붙인 스티커가 onNext에 담긴다", async () => {
      const onNext = vi.fn();
      renderSheet({ onNext });
      typeLetter("생일 축하해");
      await openStickerSheet();
      await userEvent.click(screen.getByRole("button", { name: "하트" }));
      await userEvent.click(screen.getByRole("button", { name: "큰 아이콘 선택" }));

      await userEvent.click(screen.getByRole("button", { name: "다음" }));

      expect(onNext).toHaveBeenCalledWith(
        expect.objectContaining({ largeSticker: expect.objectContaining({ id: "heart" }) }),
      );
      expect(onNext.mock.calls[0][0]).not.toHaveProperty("smallSticker");
    });

    it("삭제 버튼을 누르면 붙인 스티커가 지워진다", async () => {
      renderSheet();
      await openStickerSheet();
      await userEvent.click(screen.getByRole("button", { name: "하트" }));
      await userEvent.click(slots()[1]);

      await userEvent.click(screen.getByRole("button", { name: /아이콘 삭제/ }));

      expect(screen.queryByRole("button", { name: /아이콘 삭제/ })).not.toBeInTheDocument();
    });

    it("스티커 시트를 닫으면 툴 선택으로 돌아가고 붙인 스티커는 남는다", async () => {
      renderSheet();
      await openStickerSheet();
      await userEvent.click(screen.getByRole("button", { name: "하트" }));
      await userEvent.click(slots()[0]);

      await userEvent.click(screen.getAllByRole("button", { name: "닫기" }).at(-1)!);

      expect(screen.getByText("어떤 툴을 추가할까요?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "사진 선택" }).parentElement).not.toHaveClass(
        "invisible",
      );
      expect(screen.getAllByRole("button", { name: /아이콘 삭제/ })).toHaveLength(1);
    });

    it("시트를 닫았다 다시 열면 붙인 스티커가 없다", async () => {
      const { rerender } = renderSheet();
      await openStickerSheet();
      await userEvent.click(screen.getByRole("button", { name: "하트" }));
      await userEvent.click(slots()[0]);

      await userEvent.click(screen.getByRole("button", { name: "이전" }));
      rerender(<LetterWriteSheet open={false} onClose={vi.fn()} recipientName="지유" isLoggedIn />);
      await waitFor(() => expect(screen.queryByRole("textbox", { name: "편지 내용" })).toBeNull());
      rerender(<LetterWriteSheet open onClose={vi.fn()} recipientName="지유" isLoggedIn />);

      await screen.findByRole("button", { name: "다음" });
      expect(screen.queryByRole("button", { name: /아이콘 삭제/ })).not.toBeInTheDocument();
    });
  });

  describe("음성 녹음", () => {
    class MockRecorder {
      state = "inactive";
      mimeType = "audio/webm";
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      start() {
        this.state = "recording";
      }
      stop() {
        this.state = "inactive";
        this.ondataavailable?.({ data: new Blob(["voice"]) });
        this.onstop?.();
      }
    }
    class MockRecognition {
      onresult: ((event: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      start() {}
      stop() {}
      abort() {}
    }

    beforeEach(() => {
      vi.stubGlobal("MediaRecorder", MockRecorder);
      vi.stubGlobal("webkitSpeechRecognition", MockRecognition);
      Object.defineProperty(navigator, "mediaDevices", {
        value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [] }) },
        configurable: true,
      });
    });
    afterEach(() => vi.unstubAllGlobals());

    const openRecordSheet = async () => {
      await userEvent.click(screen.getByRole("button", { name: "나만의 편지 만들기" }));
      await userEvent.click(screen.getByRole("button", { name: "녹음" }));
    };

    it("녹음 툴을 고르면 툴 선택 영역이 녹음 영역으로 바뀐다", async () => {
      renderSheet();

      await openRecordSheet();

      expect(screen.queryByText("어떤 툴을 추가할까요?")).not.toBeInTheDocument();
      expect(screen.getByText("탭으로 녹음 시작")).toBeInTheDocument();
    });

    it("녹음을 완료하면 편지지에 음성 메시지가 나타나고 onNext에 녹음 파일이 담긴다", async () => {
      const onNext = vi.fn();
      renderSheet({ onNext });
      typeLetter("생일 축하해");
      expect(screen.queryByRole("group", { name: "음성 메시지" })).not.toBeInTheDocument();

      await openRecordSheet();
      await userEvent.click(screen.getByRole("button", { name: "녹음 시작" }));
      await userEvent.click(await screen.findByRole("button", { name: "녹음 중지" }));
      await userEvent.click(screen.getByRole("button", { name: "녹음 완료" }));

      expect(screen.getByRole("group", { name: "음성 메시지" })).toBeInTheDocument();
      expect(screen.queryByText("탭으로 녹음 시작")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "다음" }));
      expect(onNext).toHaveBeenCalledWith(
        expect.objectContaining({
          voice: { blob: expect.any(Blob), transcript: "", durationSeconds: expect.any(Number) },
        }),
      );
    });

    it("녹음을 완료한 뒤 녹음 툴을 다시 고르면 이전 녹음 없이 처음 상태로 시작한다", async () => {
      renderSheet();
      await openRecordSheet();
      await userEvent.click(screen.getByRole("button", { name: "녹음 시작" }));
      await userEvent.click(await screen.findByRole("button", { name: "녹음 중지" }));
      await userEvent.click(screen.getByRole("button", { name: "녹음 완료" }));

      await openRecordSheet();

      expect(screen.getByText("탭으로 녹음 시작")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "재녹음" })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "녹음 시작" }));
      expect(await screen.findByRole("button", { name: "녹음 중지" })).toBeInTheDocument();
    });

    it("녹음 영역을 닫으면 녹음을 버리고 음성 메시지가 생기지 않는다", async () => {
      renderSheet();

      await openRecordSheet();
      await userEvent.click(screen.getAllByRole("button", { name: "닫기" }).at(-1)!);

      expect(screen.queryByText("탭으로 녹음 시작")).not.toBeInTheDocument();
      expect(screen.queryByRole("group", { name: "음성 메시지" })).not.toBeInTheDocument();
    });
  });

  describe("수정 모드", () => {
    const initialValues = {
      text: "원래 편지",
      name: "민지",
      color: "lime",
      paperStyle: "vividSolid",
    } satisfies LetterWriteValues;

    const renderEdit = (props: Partial<React.ComponentProps<typeof LetterWriteSheet>> = {}) =>
      renderSheet({ isLoggedIn: false, initialValues, onSave: vi.fn(), ...props });
    const saveButton = () => screen.getByRole("button", { name: "이대로 저장하기" });

    it("작성했던 편지를 그대로 보여주고 이름 입력란과 제목 문구는 없다", () => {
      renderEdit();

      expect(letterInput()).toHaveTextContent("원래 편지");
      expect(nameInput()).not.toBeInTheDocument();
      expect(screen.queryByText(/에게 직접/)).not.toBeInTheDocument();
      expect(screen.getByText("보탠 금액과 이름은 바꿀 수 없어요")).toBeInTheDocument();
    });

    it("From 영역은 눌러도 이름을 바꿀 수 없어 버튼이 아니다", () => {
      renderEdit();

      expect(screen.getByText("From. 민지")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /From\. 민지/ })).not.toBeInTheDocument();
    });

    it("바뀐 게 없으면 저장 버튼이 비활성이고 수정하면 활성이 된다", () => {
      renderEdit();
      expect(saveButton()).toBeDisabled();

      typeLetter("고친 편지");

      expect(saveButton()).toBeEnabled();
    });

    it("편지를 비우면 저장할 수 없다", () => {
      renderEdit();

      typeLetter("");

      expect(saveButton()).toBeDisabled();
    });

    it("편지지 색을 바꿔도 저장 버튼이 활성이 되고 원래 색으로 돌리면 다시 비활성이 된다", async () => {
      renderEdit();

      await userEvent.click(screen.getByRole("button", { name: "주황" }));
      expect(saveButton()).toBeEnabled();

      await userEvent.click(screen.getByRole("button", { name: "라임" }));
      expect(saveButton()).toBeDisabled();
    });

    it("저장하면 수정한 값을 이름과 함께 넘긴다", async () => {
      const onSave = vi.fn();
      renderEdit({ onSave });
      typeLetter("고친 편지");

      await userEvent.click(saveButton());

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ text: "고친 편지", name: "민지", color: "lime" }),
      );
    });

    it("바뀐 게 있을 때 되돌리기를 누르면 확인을 받고 '예'를 누르면 처음 작성했던 내용으로 돌아간다", async () => {
      renderEdit();
      typeLetter("고친 편지");

      await userEvent.click(screen.getByRole("button", { name: "되돌리기" }));
      expect(screen.getByRole("heading", { name: "원래대로 돌릴까요?" })).toBeInTheDocument();
      expect(letterInput()).toHaveTextContent("고친 편지");

      await userEvent.click(screen.getByRole("button", { name: "예" }));

      expect(letterInput()).toHaveTextContent("원래 편지");
      expect(saveButton()).toBeDisabled();
    });

    it("되돌리기 확인에서 '아니오'를 누르면 수정한 내용이 그대로 남는다", async () => {
      renderEdit();
      typeLetter("고친 편지");

      await userEvent.click(screen.getByRole("button", { name: "되돌리기" }));
      await userEvent.click(screen.getByRole("button", { name: "아니오" }));

      expect(letterInput()).toHaveTextContent("고친 편지");
      expect(saveButton()).toBeEnabled();
    });

    it("바뀐 게 없는데 되돌리기를 누르면 변경된 사항이 없다고 알린다", async () => {
      renderEdit();
      expect(screen.queryByText("변경된 사항이 없어요")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "되돌리기" }));

      expect(screen.getByText("변경된 사항이 없어요")).toBeInTheDocument();
    });

    it("바뀐 게 있을 때 되돌리기를 눌러도 안내 토스트는 띄우지 않는다", async () => {
      renderEdit();
      typeLetter("고친 편지");

      await userEvent.click(screen.getByRole("button", { name: "되돌리기" }));

      expect(screen.queryByText("변경된 사항이 없어요")).not.toBeInTheDocument();
    });

    it("바뀐 게 없으면 뒤로 가기 버튼으로 확인 없이 바로 닫는다", async () => {
      const onClose = vi.fn();
      renderEdit({ onClose });

      await userEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("heading", { name: "이대로 나갈까요?" })).not.toBeInTheDocument();
    });

    it("바뀐 게 있을 때 뒤로 가기를 누르면 확인을 받고 '예'를 눌러야 닫힌다", async () => {
      const onClose = vi.fn();
      renderEdit({ onClose });
      typeLetter("고친 편지");

      await userEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));
      expect(screen.getByRole("heading", { name: "이대로 나갈까요?" })).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();

      await userEvent.click(screen.getByRole("button", { name: "예" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("나가기 확인에서 '아니오'를 누르면 닫히지 않고 수정 중인 내용이 남는다", async () => {
      const onClose = vi.fn();
      renderEdit({ onClose });
      typeLetter("고친 편지");

      await userEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));
      await userEvent.click(screen.getByRole("button", { name: "아니오" }));

      expect(onClose).not.toHaveBeenCalled();
      expect(letterInput()).toHaveTextContent("고친 편지");
    });
  });
});
