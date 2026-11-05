import type { useRouter } from "next/navigation";

import type { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";
import { useAuthStore } from "@/store/authStore";

type LogoutMutate = ReturnType<typeof useLogoutMutation>["mutate"];
type Router = ReturnType<typeof useRouter>;

export const handleLogoutClick = (mutate: LogoutMutate, router: Router) => {
  mutate(undefined, {
    onSuccess: () => {
      useAuthStore.getState().clearAccessToken();
      router.replace("/");
    },
  });
};
