import type { RollingPaperMessage } from "@/types/funding/rollingPaper";
import { toLetterValues } from "@/utils/contribution/toLetterValues";
import { isValidUrl } from "@/utils/isValidUrl";
import type { LetterPaperProps } from "@/widgets/letter-paper/LetterPaper";

// 서버 응답 URL이라 http/https만 사진으로 쓴다. 음성은 카드가 inert라 재생하지 않고 배지만 보인다
export function toLetterPaperProps(message: RollingPaperMessage): LetterPaperProps {
  const { text, name, color, paperStyle, largeSticker, smallSticker } = toLetterValues({
    participantName: message.participantName,
    message: message.content,
    paperTemplateCode: message.paperTemplateCode,
    decorationCode: message.decorationCode,
  });

  return {
    style: paperStyle,
    color,
    text,
    senderName: name,
    hasVoiceMessage: message.voiceUrl !== null,
    photoSrc: message.photoUrl && isValidUrl(message.photoUrl) ? message.photoUrl : undefined,
    largeIcon: largeSticker && <largeSticker.Icon aria-hidden className="size-full" />,
    smallIcon: smallSticker && <smallSticker.Icon aria-hidden className="size-full" />,
  };
}
