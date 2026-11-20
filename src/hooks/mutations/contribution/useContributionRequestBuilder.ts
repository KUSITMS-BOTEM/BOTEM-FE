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

// 업로드에 성공한 파일은 fileUrl을 기억해, 뒤 단계가 실패해 재시도할 때 같은 파일을 S3에 다시 올려 고아 파일을 늘리지 않는다
// fileUrl은 발급받은 펀딩에서만 유효할 수 있어 shareKey도 함께 기억한다
const uploadedUrls = new WeakMap<Blob, { shareKey: string; fileUrl: string }>();

// 첨부 업로드는 보탬 생성·수정이 함께 쓴다
export const useAttachmentUploader = (shareKey: string) => {
  // 발급 → S3 PUT까지 묶어 올리고 보탬 요청에 넣을 fileUrl을 돌려준다
  const upload = async (attachmentType: RollingPaperAttachmentType, file: Blob) => {
    const cached = uploadedUrls.get(file);
    if (cached?.shareKey === shareKey) return cached.fileUrl;
    const issued = await fundingService.createRollingPaperAttachmentUploadUrl(shareKey, {
      attachmentType,
      contentType: file.type,
      contentLength: file.size,
    });
    if (!issued) throw new Error("업로드 URL 발급에 실패했습니다.");
    const { uploadUrl, fileUrl } = issued;
    await fundingService.uploadRollingPaperAttachment(uploadUrl, file);
    uploadedUrls.set(file, { shareKey, fileUrl });
    return fileUrl;
  };

  return (letter: ContributionLetter) =>
    Promise.all([
      letter.photo && upload("PHOTO", letter.photo),
      letter.voice && upload("VOICE", letter.voice.blob),
    ]);
};

// 금액·메시지 보태기가 같은 편지 본문을 보내므로 첨부 업로드와 요청 body 조립을 함께 쓴다
export const useContributionRequestBuilder = (shareKey: string) => {
  const uploadAttachments = useAttachmentUploader(shareKey);

  return async ({ letter, requestKey, guestPassword }: ContributionRequestVariables) => {
    const [photoUrl, voiceUrl] = await uploadAttachments(letter);
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
