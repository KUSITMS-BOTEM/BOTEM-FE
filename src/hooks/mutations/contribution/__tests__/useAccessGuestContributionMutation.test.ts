import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import { useAccessGuestContributionMutation } from "@/hooks/mutations/contribution/useAccessGuestContributionMutation";
import { ApiError } from "@/types/api";
import type { GuestContributionResponse } from "@/types/contribution/contribution";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: {
    accessGuestContribution: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { mutations: { retry: false } } }) },
    children,
  );

const body = { participantName: "민지", guestPassword: "1234" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAccessGuestContributionMutation", () => {
  it("펀딩 id와 이름·비밀번호로 서비스를 호출하고 보탬을 돌려준다", async () => {
    const response = { contributionId: 31, accessToken: "token" } as GuestContributionResponse;
    vi.mocked(contributionService.accessGuestContribution).mockResolvedValue(response);
    const { result } = renderHook(() => useAccessGuestContributionMutation("share-key-5"), {
      wrapper,
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contributionService.accessGuestContribution).toHaveBeenCalledWith("share-key-5", body);
    expect(result.current.data).toEqual(response);
  });

  it("이름·비밀번호 불일치(FUNDING_025)는 error로 남아 화면이 시트 안에서 안내할 수 있다", async () => {
    vi.mocked(contributionService.accessGuestContribution).mockRejectedValue(
      new ApiError("FUNDING_025"),
    );
    const { result } = renderHook(() => useAccessGuestContributionMutation("share-key-5"), {
      wrapper,
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ code: "FUNDING_025" });
  });
});
