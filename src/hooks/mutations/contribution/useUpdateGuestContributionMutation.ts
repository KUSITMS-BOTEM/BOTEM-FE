import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import {
  type ContributionLetter,
  useAttachmentUploader,
} from "@/hooks/mutations/contribution/useContributionRequestBuilder";
import { fundingDetailQueryKey } from "@/hooks/queries/funding/useFundingDetailQuery";
import type { GuestContributionResponse } from "@/types/contribution/contribution";
import { toLetterFields } from "@/utils/contribution/toMessageContributionRequest";

// access는 수정 화면을 열기 전에 받아 둔 본인 확인 응답이다. 토큰과 기존 첨부를 여기서 쓴다
type Variables = { letter: ContributionLetter; access: GuestContributionResponse };

// 서버는 첨부를 통째로 교체하므로 새로 올리지 않은 사진·음성은 기존 값을 다시 보내 지워지지 않게 한다
export const useUpdateGuestContributionMutation = (shareKey: string) => {
  const queryClient = useQueryClient();
  const uploadAttachments = useAttachmentUploader(shareKey);

  return useMutation({
    mutationFn: async ({ letter, access }: Variables) => {
      const [photoUrl, voiceUrl] = await uploadAttachments(letter);
      const { message, paperTemplateCode, decorationCode } = toLetterFields(letter);
      return contributionService.updateGuestContribution(shareKey, access.accessToken, {
        participantName: access.participantName,
        message,
        paperTemplateCode,
        decorationCode: decorationCode ?? null,
        photoUrl: photoUrl ?? access.photoUrl,
        voiceUrl: voiceUrl ?? access.voiceUrl ?? null,
        voiceDurationSeconds: voiceUrl
          ? (letter.voice?.durationSeconds ?? null)
          : (access.voiceDurationSeconds ?? null),
        voiceTranscript: voiceUrl
          ? letter.voice?.transcript || null
          : (access.voiceTranscript ?? null),
      });
    },
    // 상세의 참여자 이름·메시지가 수정 내용과 어긋나지 않게 다시 조회한다
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: fundingDetailQueryKey(shareKey), exact: true }),
  });
};
