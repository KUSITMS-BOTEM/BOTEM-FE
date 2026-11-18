import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider, QueryObserver } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { giftVerificationService } from "@/apis/gift-verification/giftVerificationService";
import { useCompleteGiftVerificationMutation } from "@/hooks/mutations/gift-verification/useCompleteGiftVerificationMutation";
import { giftVerificationBannerQueryKey } from "@/hooks/queries/home/useGiftVerificationBannerQuery";
import { giftVerificationTargetsQueryKey } from "@/hooks/queries/home/useGiftVerificationTargetsQuery";

vi.mock("@/apis/gift-verification/giftVerificationService", () => ({
  giftVerificationService: {
    createImageUploadUrl: vi.fn(),
    uploadImage: vi.fn(),
    complete: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

const image = new File(["content"], "gift.png", { type: "image/png" });

const uploadUrlResult = {
  uploadUrl: "https://mock-s3.botem.local/gift-verification/upload-token",
  imageUrl: "https://mock-s3.botem.local/gift-verification/image-url",
};

const variables = {
  giftVerificationId: 101,
  image,
  thankYouMessage: "고마워!",
  replacementProductName: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useCompleteGiftVerificationMutation", () => {
  it("업로드 URL 발급 → S3 PUT → 완료 요청 순서로 호출하고 구매 여부를 true로 보낸다", async () => {
    const calls: string[] = [];
    vi.mocked(giftVerificationService.createImageUploadUrl).mockImplementation(async () => {
      calls.push("upload-url");
      return uploadUrlResult;
    });
    vi.mocked(giftVerificationService.uploadImage).mockImplementation(async () => {
      calls.push("put");
    });
    vi.mocked(giftVerificationService.complete).mockImplementation(async () => {
      calls.push("complete");
      return null;
    });
    const { result } = renderHook(() => useCompleteGiftVerificationMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(calls).toEqual(["upload-url", "put", "complete"]);
    expect(giftVerificationService.createImageUploadUrl).toHaveBeenCalledWith(101, {
      contentType: "image/png",
      contentLength: image.size,
    });
    expect(giftVerificationService.uploadImage).toHaveBeenCalledWith(
      uploadUrlResult.uploadUrl,
      image,
    );
    expect(giftVerificationService.complete).toHaveBeenCalledWith(101, {
      imageUrl: uploadUrlResult.imageUrl,
      thankYouMessage: "고마워!",
      purchasedThroughBotemLink: true,
      replacementProductName: null,
    });
  });

  it("감사 메시지가 공백뿐이면 thankYouMessage를 null로 보낸다", async () => {
    vi.mocked(giftVerificationService.createImageUploadUrl).mockResolvedValue(uploadUrlResult);
    vi.mocked(giftVerificationService.uploadImage).mockResolvedValue(undefined);
    vi.mocked(giftVerificationService.complete).mockResolvedValue(null);
    const { result } = renderHook(() => useCompleteGiftVerificationMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ ...variables, thankYouMessage: "   " });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(giftVerificationService.complete).toHaveBeenCalledWith(
      101,
      expect.objectContaining({ thankYouMessage: null }),
    );
  });

  it("S3 PUT이 실패하면 완료 요청을 호출하지 않고 에러 상태가 된다", async () => {
    const error = new Error("인증 사진 업로드에 실패했습니다.");
    vi.mocked(giftVerificationService.createImageUploadUrl).mockResolvedValue(uploadUrlResult);
    vi.mocked(giftVerificationService.uploadImage).mockRejectedValue(error);
    const { result } = renderHook(() => useCompleteGiftVerificationMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(giftVerificationService.complete).not.toHaveBeenCalled();
  });

  it("성공하면 인증 목록·배너를 다시 받지 않고 오래됨 표시만 해 인증 화면에서 대상이 사라지지 않게 한다", async () => {
    vi.mocked(giftVerificationService.createImageUploadUrl).mockResolvedValue(uploadUrlResult);
    vi.mocked(giftVerificationService.uploadImage).mockResolvedValue(undefined);
    vi.mocked(giftVerificationService.complete).mockResolvedValue(null);
    const queryClient = new QueryClient();
    const targetsFn = vi.fn().mockResolvedValue({ pendingCount: 1, targets: [] });
    await queryClient.fetchQuery({ queryKey: giftVerificationTargetsQueryKey, queryFn: targetsFn });
    queryClient.setQueryData(giftVerificationBannerQueryKey, { visible: true, pendingCount: 1 });
    // 인증 화면처럼 목록을 구독 중인(active) 상태를 만든다 — 기본 무효화라면 이때 바로 다시 받는다
    const unsubscribe = new QueryObserver(queryClient, {
      queryKey: giftVerificationTargetsQueryKey,
      queryFn: targetsFn,
      staleTime: Infinity,
    }).subscribe(() => {});
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useCompleteGiftVerificationMutation(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    unsubscribe();
    expect(targetsFn).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryState(giftVerificationTargetsQueryKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(giftVerificationBannerQueryKey)?.isInvalidated).toBe(true);
  });
});
