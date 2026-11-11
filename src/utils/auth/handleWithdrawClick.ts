import type { useRouter } from "next/navigation";

import type { useWithdrawMutation } from "@/hooks/mutations/user/useWithdrawMutation";

type WithdrawMutate = ReturnType<typeof useWithdrawMutation>["mutate"];
type Router = ReturnType<typeof useRouter>;

export const handleWithdrawClick = (mutate: WithdrawMutate, router: Router) => {
  mutate(undefined, {
    onSuccess: () => router.replace("/"),
  });
};
