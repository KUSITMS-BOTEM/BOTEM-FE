import { useErrorDialogStore } from "../errorDialogStore";

describe("useErrorDialogStore", () => {
  afterEach(() => {
    useErrorDialogStore.getState().closeErrorDialog();
  });

  it("초기 message는 null이다", () => {
    expect(useErrorDialogStore.getState().message).toBeNull();
  });

  it("openErrorDialog로 message를 저장한다", () => {
    useErrorDialogStore.getState().openErrorDialog("오류가 발생했어요.");

    expect(useErrorDialogStore.getState().message).toBe("오류가 발생했어요.");
  });

  it("closeErrorDialog로 message를 비운다", () => {
    useErrorDialogStore.getState().openErrorDialog("오류가 발생했어요.");
    useErrorDialogStore.getState().closeErrorDialog();

    expect(useErrorDialogStore.getState().message).toBeNull();
  });

  it("onClose를 넘기면 closeErrorDialog 시점에 한 번만 실행한다", () => {
    const onClose = vi.fn();
    useErrorDialogStore.getState().openErrorDialog("오류가 발생했어요.", onClose);
    expect(onClose).not.toHaveBeenCalled();

    useErrorDialogStore.getState().closeErrorDialog();
    useErrorDialogStore.getState().closeErrorDialog();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
