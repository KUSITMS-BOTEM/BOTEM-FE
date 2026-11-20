import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import { fundingService } from "@/apis/funding/fundingService";
import { myContributionsQueryKey } from "@/hooks/queries/contribution/useMyContributionsQuery";
import type { RollingPaperAttachmentType } from "@/types/funding/rollingPaperAttachment";
import {
  type LetterInput,
  toMessageContributionRequest,
} from "@/utils/contribution/toMessageContributionRequest";

type CreateMessageContributionVariables = {
  letter: LetterInput & {
    voice?: { blob: Blob; durationSeconds: number; transcript: string };
    photo?: File;
  };
  // 실패 후 재시도해도 같은 키를 써서 서버가 중복 참여를 만들지 않게 한다
  requestKey: string;
  // 비회원일 때만 있다
  guestPassword?: string;
};

export const useCreateMessageContributionMutation = (fundingId: number) => {
  const queryClient = useQueryClient();

  // 발급 → S3 PUT까지 묶어 올리고 보탬 요청에 넣을 fileUrl을 돌려준다
  const upload = async (attachmentType: RollingPaperAttachmentType, file: Blob) => {
    const issued = await fundingService.createRollingPaperAttachmentUploadUrl(fundingId, {
      attachmentType,
      contentType: file.type,
      contentLength: file.size,
    });
    if (!issued) throw new Error("업로드 URL 발급에 실패했습니다.");
    const { uploadUrl, fileUrl } = issued;
    await fundingService.uploadRollingPaperAttachment(uploadUrl, file);
    return fileUrl;
  };

  return useMutation({
    mutationFn: async ({
      letter,
      requestKey,
      guestPassword,
    }: CreateMessageContributionVariables) => {
      const [photoUrl, voiceUrl] = await Promise.all([
        letter.photo && upload("PHOTO", letter.photo),
        letter.voice && upload("VOICE", letter.voice.blob),
      ]);
      return contributionService.createMessageContribution(fundingId, {
        ...toMessageContributionRequest(letter, { requestKey, guestPassword }),
        photoUrl,
        ...(voiceUrl && {
          voiceUrl,
          voiceDurationSeconds: letter.voice?.durationSeconds,
          voiceTranscript: letter.voice?.transcript || null,
        }),
      });
    },
    // 이동 전에 반영해야 돌아온 화면이 보탬 전 상태를 캐시에서 읽지 않는다
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: myContributionsQueryKey(fundingId) }),
  });
};
