import { readClipboardText, resolveClipboardPasteAction } from "../clipboardPaste";

describe("resolveClipboardPasteAction", () => {
  it("accountOnly 결과면 accountNumber만 담아 반환한다", () => {
    expect(
      resolveClipboardPasteAction({ status: "accountOnly", accountNumber: "1234567890" }),
    ).toEqual({
      accountNumber: "1234567890",
    });
  });

  it("bankAndAccount 결과면 accountNumber와 bankCode를 함께 담아 반환한다", () => {
    expect(
      resolveClipboardPasteAction({
        status: "bankAndAccount",
        bankCode: "TOSS_BANK",
        accountNumber: "1234567890",
      }),
    ).toEqual({ accountNumber: "1234567890", bankCode: "TOSS_BANK" });
  });

  it("invalidBank 결과면 등록되지 않은 은행 안내 토스트를 반환한다", () => {
    expect(resolveClipboardPasteAction({ status: "invalidBank" })).toEqual({
      toastText: "등록되지 않은 은행이에요",
    });
  });

  it("invalidAccount 결과면 계좌번호 형식 안내 토스트를 반환한다", () => {
    expect(resolveClipboardPasteAction({ status: "invalidAccount" })).toEqual({
      toastText: "계좌번호 형식을 확인해주세요",
    });
  });

  it("notFound 결과면 복사된 계좌 없음 토스트를 반환한다", () => {
    expect(resolveClipboardPasteAction({ status: "notFound" })).toEqual({
      toastText: "복사된 계좌가 없어요",
    });
  });
});

describe("readClipboardText", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("클립보드 읽기에 성공하면 텍스트를 그대로 반환한다", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { readText: vi.fn().mockResolvedValue("1234567890") },
    });

    await expect(readClipboardText()).resolves.toBe("1234567890");
  });

  it("클립보드 읽기가 실패하면(권한 거부 등) 빈 문자열을 반환한다", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { readText: vi.fn().mockRejectedValue(new Error("권한 없음")) },
    });

    await expect(readClipboardText()).resolves.toBe("");
  });
});
