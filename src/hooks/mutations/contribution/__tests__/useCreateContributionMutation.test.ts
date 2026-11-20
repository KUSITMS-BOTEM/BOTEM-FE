import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import { fundingService } from "@/apis/funding/fundingService";
import { useCreateContributionMutation } from "@/hooks/mutations/contribution/useCreateContributionMutation";
import { myContributionsQueryKey } from "@/hooks/queries/contribution/useMyContributionsQuery";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: { createContribution: vi.fn() },
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
  vi.mocked(contributionService.createContribution).mockResolvedValue({
    contributionId: 1,
    status: "AWAITING_TRANSFER",
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

describe("useCreateContributionMutation", () => {
  it("금액과 편지를 함께 제출하고 내 보탬 캐시를 무효화한다", async () => {
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateContributionMutation("share-key-5"), { wrapper });

    result.current.mutate({ letter, requestKey: "k", guestPassword: "1234", amount: 30000 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.createRollingPaperAttachmentUploadUrl).not.toHaveBeenCalled();
    expect(contributionService.createContribution).toHaveBeenCalledWith(
      "share-key-5",
      expect.objectContaining({
        requestKey: "k",
        amount: 30000,
        paperTemplateCode: "ORANGE_VIVID_SOLID",
        participantName: "민지",
        guestPassword: "1234",
      }),
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: myContributionsQueryKey("share-key-5") });
  });

  it("사진을 올린 뒤 fileUrl과 금액을 함께 보낸다", async () => {
    const photo = new File(["p"], "p.png", { type: "image/png" });
    const { result } = renderHook(() => useCreateContributionMutation("share-key-5"), { wrapper });

    result.current.mutate({ letter: { ...letter, photo }, requestKey: "k", amount: 1000 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contributionService.createContribution).toHaveBeenCalledWith(
      "share-key-5",
      expect.objectContaining({ photoUrl: "https://cdn/PHOTO", amount: 1000 }),
    );
  });

  it("업로드가 실패하면 보탬을 제출하지 않는다", async () => {
    vi.mocked(fundingService.uploadRollingPaperAttachment).mockRejectedValue(new Error("fail"));
    const photo = new File(["p"], "p.png", { type: "image/png" });
    const { result } = renderHook(() => useCreateContributionMutation("share-key-5"), { wrapper });

    result.current.mutate({ letter: { ...letter, photo }, requestKey: "k", amount: 1000 });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(contributionService.createContribution).not.toHaveBeenCalled();
  });
});
