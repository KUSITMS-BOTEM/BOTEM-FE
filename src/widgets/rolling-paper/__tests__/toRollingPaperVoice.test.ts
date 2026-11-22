import type { RollingPaperMessage } from "@/types/funding/rollingPaper";
import { toRollingPaperVoice } from "@/widgets/rolling-paper/toRollingPaperVoice";

const message = (overrides: Partial<RollingPaperMessage> = {}): RollingPaperMessage => ({
  messageId: 1,
  participantName: "민지",
  participantProfileImageUrl: null,
  content: "생일 축하해!",
  paperTemplateCode: "LIME_DOT_GRID",
  decorationCode: null,
  photoUrl: null,
  voiceUrl: "https://cdn.example.com/voice.m4a",
  voiceDurationSeconds: 12,
  voiceTranscript: "생일 진짜 축하해!",
  ...overrides,
});

describe("toRollingPaperVoice", () => {
  it("음성 주소·길이·자막·보낸 사람을 돌려준다", () => {
    expect(toRollingPaperVoice(message())).toEqual({
      url: "https://cdn.example.com/voice.m4a",
      durationSeconds: 12,
      transcript: "생일 진짜 축하해!",
      senderName: "민지",
    });
  });

  it("음성 주소가 없으면 null이다", () => {
    expect(toRollingPaperVoice(message({ voiceUrl: null }))).toBeNull();
  });

  it("http/https가 아닌 주소는 재생하지 않는다", () => {
    expect(toRollingPaperVoice(message({ voiceUrl: "javascript:alert(1)" }))).toBeNull();
  });

  it("길이와 자막이 없어도 음성은 돌려준다", () => {
    expect(
      toRollingPaperVoice(message({ voiceDurationSeconds: null, voiceTranscript: null })),
    ).toMatchObject({ durationSeconds: null, transcript: null });
  });
});
