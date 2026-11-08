import type { useRouter } from "next/navigation";

import type { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";
import type { useWithdrawMutation } from "@/hooks/mutations/user/useWithdrawMutation";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";

type LogoutMutate = ReturnType<typeof useLogoutMutation>["mutate"];
type WithdrawMutate = ReturnType<typeof useWithdrawMutation>["mutate"];
type Router = ReturnType<typeof useRouter>;

export const handleLogoutClick = (mutate: LogoutMutate, router: Router) => {
  mutate(undefined, {
    onSuccess: () => {
      useAuthStore.getState().clearAccessToken();
      queryClient.removeQueries({ queryKey: ["users", "me"] });
      router.replace("/");
    },
  });
};

export const handleWithdrawClick = (mutate: WithdrawMutate, router: Router) => {
  mutate(undefined, {
    onSuccess: () => {
      useAuthStore.getState().clearAccessToken();
      queryClient.removeQueries({ queryKey: ["users", "me"] });
      router.replace("/");
    },
  });
};
