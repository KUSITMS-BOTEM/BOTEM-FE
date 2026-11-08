import type { useRouter } from "next/navigation";

import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";

import { handleLogoutClick, handleWithdrawClick } from "../helpers";

type Router = ReturnType<typeof useRouter>;

const createRouter = () => ({ replace: vi.fn() }) as unknown as Router;

beforeEach(() => {
  useAuthStore.getState().setAccessToken("access-token");
  vi.spyOn(queryClient, "removeQueries");
});

afterEach(() => {
  vi.restoreAllMocks();
});

const createSuccessMutate = <T>() =>
  vi.fn((_variables: unknown, options: { onSuccess: () => void }) =>
    options.onSuccess(),
  ) as unknown as T;

describe("handleLogoutClick", () => {
  it("로그아웃 성공 시 accessToken과 프로필 캐시를 지우고 랜딩으로 이동한다", () => {
    const mutate = createSuccessMutate<Parameters<typeof handleLogoutClick>[0]>();
    const router = createRouter();

    handleLogoutClick(mutate, router);

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ["users", "me"] });
    expect(router.replace).toHaveBeenCalledWith("/");
  });
});

describe("handleWithdrawClick", () => {
  it("탈퇴 성공 시 accessToken과 프로필 캐시를 지우고 랜딩으로 이동한다", () => {
    const mutate = createSuccessMutate<Parameters<typeof handleWithdrawClick>[0]>();
    const router = createRouter();

    handleWithdrawClick(mutate, router);

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ["users", "me"] });
    expect(router.replace).toHaveBeenCalledWith("/");
  });
});
