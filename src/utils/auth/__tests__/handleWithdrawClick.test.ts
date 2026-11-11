import type { useRouter } from "next/navigation";

import { handleWithdrawClick } from "../handleWithdrawClick";

type Router = ReturnType<typeof useRouter>;

describe("handleWithdrawClick", () => {
  it("탈퇴 성공 시 랜딩으로 이동한다", () => {
    const mutate = vi.fn((_variables: unknown, options: { onSuccess: () => void }) =>
      options.onSuccess(),
    ) as unknown as Parameters<typeof handleWithdrawClick>[0];
    const router = { replace: vi.fn() } as unknown as Router;

    handleWithdrawClick(mutate, router);

    expect(router.replace).toHaveBeenCalledWith("/");
  });
});
