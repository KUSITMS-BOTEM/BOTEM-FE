import type { RollingPaperMessage } from "@/types/funding/rollingPaper";
import { toLetterPaperProps } from "@/widgets/rolling-paper/toLetterPaperProps";

const message = (overrides: Partial<RollingPaperMessage> = {}): RollingPaperMessage => ({
  messageId: 1,
  participantName: "민지",
  participantProfileImageUrl: null,
  content: "생일 축하해!",
  paperTemplateCode: "LIME_DOT_GRID",
  decorationCode: null,
  photoUrl: null,
  voiceUrl: null,
  voiceDurationSeconds: null,
  voiceTranscript: null,
  ...overrides,
});

describe("toLetterPaperProps", () => {
  it("편지지 코드를 색과 스타일로, 본문·보낸 사람을 그대로 옮긴다", () => {
    expect(toLetterPaperProps(message())).toMatchObject({
      color: "lime",
      style: "dotGrid",
      text: "생일 축하해!",
      senderName: "민지",
    });
  });

  it("본문이 없으면 빈 문자열로 둔다", () => {
    expect(toLetterPaperProps(message({ content: null })).text).toBe("");
  });

  it("우리 규칙에 맞지 않는 편지지 코드는 기본 편지지로 둔다", () => {
    expect(toLetterPaperProps(message({ paperTemplateCode: "BLACK_CONFETTI" }))).toMatchObject({
      color: "orange",
      style: "vividSolid",
    });
  });

  it("스티커 코드가 있으면 큰·작은 아이콘을 채우고, 없으면 비운다", () => {
    const withSticker = toLetterPaperProps(message({ decorationCode: "CAKE|HEART" }));
    expect(withSticker.largeIcon).toBeTruthy();
    expect(withSticker.smallIcon).toBeTruthy();

    const onlySmall = toLetterPaperProps(message({ decorationCode: "|HEART" }));
    expect(onlySmall.largeIcon).toBeFalsy();
    expect(onlySmall.smallIcon).toBeTruthy();

    const none = toLetterPaperProps(message());
    expect(none.largeIcon).toBeFalsy();
    expect(none.smallIcon).toBeFalsy();
  });

  it("음성이 있을 때만 음성 배지를 표시한다", () => {
    expect(toLetterPaperProps(message()).hasVoiceMessage).toBe(false);
    expect(
      toLetterPaperProps(message({ voiceUrl: "https://cdn.example.com/voice.m4a" }))
        .hasVoiceMessage,
    ).toBe(true);
  });

  it("http/https 사진 주소만 사진으로 쓴다", () => {
    expect(
      toLetterPaperProps(message({ photoUrl: "https://image.example.com/a.jpg" })).photoSrc,
    ).toBe("https://image.example.com/a.jpg");
    expect(
      toLetterPaperProps(message({ photoUrl: "javascript:alert(1)" })).photoSrc,
    ).toBeUndefined();
    expect(toLetterPaperProps(message({ photoUrl: null })).photoSrc).toBeUndefined();
  });
});
