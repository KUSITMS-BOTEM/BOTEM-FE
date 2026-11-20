import { fundingService } from "@/apis/funding/fundingService";
import type { RollingPaperAttachmentType } from "@/types/funding/rollingPaperAttachment";
import {
  type LetterInput,
  toMessageContributionRequest,
} from "@/utils/contribution/toMessageContributionRequest";

export type ContributionLetter = LetterInput & {
  voice?: { blob: Blob; durationSeconds: number; transcript: string };
  photo?: File;
};

export type ContributionRequestVariables = {
  letter: ContributionLetter;
  // 실패 후 재시도해도 같은 키를 써서 서버가 중복 참여를 만들지 않게 한다
  requestKey: string;
  // 비회원일 때만 있다
  guestPassword?: string;
};

// 금액·메시지 보태기가 같은 편지 본문을 보내므로 첨부 업로드와 요청 body 조립을 함께 쓴다
export const useContributionRequestBuilder = (shareKey: string) => {
  // 발급 → S3 PUT까지 묶어 올리고 보탬 요청에 넣을 fileUrl을 돌려준다
  const upload = async (attachmentType: RollingPaperAttachmentType, file: Blob) => {
    const issued = await fundingService.createRollingPaperAttachmentUploadUrl(shareKey, {
      attachmentType,
      contentType: file.type,
      contentLength: file.size,
    });
    if (!issued) throw new Error("업로드 URL 발급에 실패했습니다.");
    const { uploadUrl, fileUrl } = issued;
    await fundingService.uploadRollingPaperAttachment(uploadUrl, file);
    return fileUrl;
  };

  return async ({ letter, requestKey, guestPassword }: ContributionRequestVariables) => {
    const [photoUrl, voiceUrl] = await Promise.all([
      letter.photo && upload("PHOTO", letter.photo),
      letter.voice && upload("VOICE", letter.voice.blob),
    ]);
    return {
      ...toMessageContributionRequest(letter, { requestKey, guestPassword }),
      photoUrl,
      ...(voiceUrl && {
        voiceUrl,
        voiceDurationSeconds: letter.voice?.durationSeconds,
        voiceTranscript: letter.voice?.transcript || null,
      }),
    };
  };
};
