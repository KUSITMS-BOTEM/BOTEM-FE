import { useMutation } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import {
  type ContributionLetter,
  useContributionRequestBuilder,
} from "@/hooks/mutations/contribution/useContributionRequestBuilder";
import type { GuestContributionResponse } from "@/types/contribution/contribution";

// access는 수정 화면을 열기 전에 받아 둔 본인 확인 응답이다. 토큰과 기존 첨부를 여기서 쓴다
type Variables = { letter: ContributionLetter; access: GuestContributionResponse };

// 서버는 첨부를 통째로 교체하므로 새로 올리지 않은 사진·음성은 기존 값을 다시 보내 지워지지 않게 한다
export const useUpdateGuestContributionMutation = (shareKey: string) => {
  const buildRequest = useContributionRequestBuilder(shareKey);

  return useMutation({
    mutationFn: async ({ letter, access }: Variables) => {
      // requestKey는 보탬 생성용이라 수정 body에는 넣지 않는다
      const built = await buildRequest({ letter, requestKey: "" });
      const voice = built.voiceUrl ? built : access;
      return contributionService.updateGuestContribution(shareKey, access.accessToken, {
        participantName: access.participantName,
        message: built.message,
        paperTemplateCode: built.paperTemplateCode,
        decorationCode: built.decorationCode ?? null,
        photoUrl: built.photoUrl ?? access.photoUrl,
        voiceUrl: voice.voiceUrl ?? null,
        voiceDurationSeconds: voice.voiceDurationSeconds ?? null,
        voiceTranscript: voice.voiceTranscript ?? null,
      });
    },
  });
};
