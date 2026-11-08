import type { useRouter } from "next/navigation";

import type { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";
import type { useWithdrawMutation } from "@/hooks/mutations/user/useWithdrawMutation";

type LogoutMutate = ReturnType<typeof useLogoutMutation>["mutate"];
type WithdrawMutate = ReturnType<typeof useWithdrawMutation>["mutate"];
type Router = ReturnType<typeof useRouter>;

export const handleLogoutClick = (mutate: LogoutMutate, router: Router) => {
  mutate(undefined, {
    onSuccess: () => router.replace("/"),
  });
};

export const handleWithdrawClick = (mutate: WithdrawMutate, router: Router) => {
  mutate(undefined, {
    onSuccess: () => router.replace("/"),
  });
};
