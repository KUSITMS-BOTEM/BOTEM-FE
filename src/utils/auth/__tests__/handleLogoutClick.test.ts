import type { useRouter } from "next/navigation";

import { handleLogoutClick } from "../handleLogoutClick";

type Router = ReturnType<typeof useRouter>;

describe("handleLogoutClick", () => {
  it("로그아웃 성공 시 랜딩으로 이동한다", () => {
    const mutate = vi.fn((_variables: unknown, options: { onSuccess: () => void }) =>
      options.onSuccess(),
    ) as unknown as Parameters<typeof handleLogoutClick>[0];
    const router = { replace: vi.fn() } as unknown as Router;

    handleLogoutClick(mutate, router);

    expect(router.replace).toHaveBeenCalledWith("/");
  });
});
