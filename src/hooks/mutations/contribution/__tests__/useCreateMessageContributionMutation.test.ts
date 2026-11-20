import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import { fundingService } from "@/apis/funding/fundingService";
import { useCreateMessageContributionMutation } from "@/hooks/mutations/contribution/useCreateMessageContributionMutation";
import { myContributionsQueryKey } from "@/hooks/queries/contribution/useMyContributionsQuery";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: { createMessageContribution: vi.fn() },
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

const letter = { text: "축하해", name: "민지", color: "orange", paperStyle: "vividSolid" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(contributionService.createMessageContribution).mockResolvedValue({
    contributionId: 1,
    participantName: "민지",
    status: "MESSAGE_ONLY",
  } as never);
  vi.mocked(fundingService.createRollingPaperAttachmentUploadUrl).mockImplementation(
    async (_id, { attachmentType }) =>
      ({
        attachmentType,
        uploadUrl: `https://s3/${attachmentType}`,
        fileUrl: `https://cdn/${attachmentType}`,
      }) as never,
  );
});

describe("useCreateMessageContributionMutation", () => {
  it("첨부가 없으면 업로드 없이 바로 제출하고 내 보탬 캐시를 무효화한다", async () => {
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateMessageContributionMutation(5), { wrapper });

    result.current.mutate({ letter, requestKey: "k", guestPassword: "1234" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.createRollingPaperAttachmentUploadUrl).not.toHaveBeenCalled();
    expect(contributionService.createMessageContribution).toHaveBeenCalledWith(
      5,
      expect.objectContaining({
        requestKey: "k",
        paperTemplateCode: "ORANGE_VIVID_SOLID",
        participantName: "민지",
        guestPassword: "1234",
      }),
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: myContributionsQueryKey(5) });
  });

  it("사진·음성을 올린 뒤 fileUrl과 녹음 길이를 함께 보낸다", async () => {
    const photo = new File(["p"], "p.png", { type: "image/png" });
    const voice = {
      blob: new Blob(["v"], { type: "audio/webm" }),
      durationSeconds: 7,
      transcript: "안녕",
    };
    const { result } = renderHook(() => useCreateMessageContributionMutation(5), { wrapper });

    result.current.mutate({ letter: { ...letter, photo, voice }, requestKey: "k" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.createRollingPaperAttachmentUploadUrl).toHaveBeenCalledWith(5, {
      attachmentType: "VOICE",
      contentType: "audio/webm",
      contentLength: 1,
    });
    expect(contributionService.createMessageContribution).toHaveBeenCalledWith(
      5,
      expect.objectContaining({
        photoUrl: "https://cdn/PHOTO",
        voiceUrl: "https://cdn/VOICE",
        voiceDurationSeconds: 7,
        voiceTranscript: "안녕",
      }),
    );
  });

  it("업로드가 실패하면 보탬을 제출하지 않는다", async () => {
    vi.mocked(fundingService.uploadRollingPaperAttachment).mockRejectedValue(new Error("fail"));
    const photo = new File(["p"], "p.png", { type: "image/png" });
    const { result } = renderHook(() => useCreateMessageContributionMutation(5), { wrapper });

    result.current.mutate({ letter: { ...letter, photo }, requestKey: "k" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(contributionService.createMessageContribution).not.toHaveBeenCalled();
  });
});
