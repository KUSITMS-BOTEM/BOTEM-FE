import type { RollingPaperMessage } from "@/types/funding/rollingPaper";
import { isValidUrl } from "@/utils/isValidUrl";

export type RollingPaperVoice = {
  url: string;
  durationSeconds: number | null;
  transcript: string | null;
  senderName: string;
};

// 서버 응답 URL이라 http/https만 재생한다. 음성이 없거나 주소가 올바르지 않으면 null
export function toRollingPaperVoice(message: RollingPaperMessage): RollingPaperVoice | null {
  if (!message.voiceUrl || !isValidUrl(message.voiceUrl)) return null;

  return {
    url: message.voiceUrl,
    durationSeconds: message.voiceDurationSeconds,
    transcript: message.voiceTranscript,
    senderName: message.participantName,
  };
}
