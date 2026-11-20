import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import { fundingService } from "@/apis/funding/fundingService";
import { useUpdateGuestContributionMutation } from "@/hooks/mutations/contribution/useUpdateGuestContributionMutation";
import { fundingDetailQueryKey } from "@/hooks/queries/funding/useFundingDetailQuery";
import type { GuestContributionResponse } from "@/types/contribution/contribution";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: { updateGuestContribution: vi.fn() },
}));
vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: {
    createRollingPaperAttachmentUploadUrl: vi.fn(),
    uploadRollingPaperAttachment: vi.fn(),
  },
}));

const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

const letter = { text: "수정한 편지", name: "민지", color: "orange", paperStyle: "vividSolid" };
const access = {
  accessToken: "guest-token",
  participantName: "민지",
  photoUrl: "https://cdn/old-photo",
  voiceUrl: "https://cdn/old-voice",
  voiceDurationSeconds: 12,
  voiceTranscript: "기존 음성",
} as GuestContributionResponse;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(contributionService.updateGuestContribution).mockResolvedValue({} as never);
  vi.mocked(fundingService.createRollingPaperAttachmentUploadUrl).mockImplementation(
    async (_shareKey, { attachmentType }) =>
      ({
        attachmentType,
        uploadUrl: `https://s3/${attachmentType}`,
        fileUrl: `https://cdn/new-${attachmentType}`,
      }) as never,
  );
});

describe("useUpdateGuestContributionMutation", () => {
  it("새로 올린 첨부가 없으면 기존 사진·음성을 그대로 다시 보내고 접근 토큰을 전달한다", async () => {
    const { result } = renderHook(() => useUpdateGuestContributionMutation("share-key-5"), {
      wrapper,
    });

    result.current.mutate({ letter, access });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.createRollingPaperAttachmentUploadUrl).not.toHaveBeenCalled();
    expect(contributionService.updateGuestContribution).toHaveBeenCalledWith(
      "share-key-5",
      "guest-token",
      expect.objectContaining({
        participantName: "민지",
        message: "수정한 편지",
        paperTemplateCode: "ORANGE_VIVID_SOLID",
        photoUrl: "https://cdn/old-photo",
        voiceUrl: "https://cdn/old-voice",
        voiceDurationSeconds: 12,
        voiceTranscript: "기존 음성",
      }),
    );
  });

  it("새 사진·음성을 올리면 업로드한 값으로 교체한다", async () => {
    const { result } = renderHook(() => useUpdateGuestContributionMutation("share-key-5"), {
      wrapper,
    });

    result.current.mutate({
      letter: {
        ...letter,
        photo: new File(["p"], "p.png", { type: "image/png" }),
        voice: {
          blob: new Blob(["v"], { type: "audio/webm" }),
          durationSeconds: 3,
          transcript: "",
        },
      },
      access,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contributionService.updateGuestContribution).toHaveBeenCalledWith(
      "share-key-5",
      "guest-token",
      expect.objectContaining({
        photoUrl: "https://cdn/new-PHOTO",
        voiceUrl: "https://cdn/new-VOICE",
        voiceDurationSeconds: 3,
        voiceTranscript: null,
      }),
    );
  });

  it("성공하면 펀딩 상세를 다시 조회한다", async () => {
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateGuestContributionMutation("share-key-5"), {
      wrapper,
    });

    result.current.mutate({ letter, access });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: fundingDetailQueryKey("share-key-5"),
      exact: true,
    });
  });

  it("업로드가 성공한 파일은 수정 요청이 실패해 재시도해도 다시 올리지 않는다", async () => {
    vi.mocked(contributionService.updateGuestContribution)
      .mockRejectedValueOnce(new Error("서버 오류"))
      .mockResolvedValueOnce({} as never);
    const photo = new File(["p"], "p.png", { type: "image/png" });
    const { result } = renderHook(() => useUpdateGuestContributionMutation("share-key-5"), {
      wrapper,
    });

    result.current.mutate({ letter: { ...letter, photo }, access });
    await waitFor(() => expect(result.current.isError).toBe(true));
    result.current.mutate({ letter: { ...letter, photo }, access });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fundingService.createRollingPaperAttachmentUploadUrl).toHaveBeenCalledTimes(1);
  });
});
