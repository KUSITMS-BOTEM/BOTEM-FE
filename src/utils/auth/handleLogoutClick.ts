import type { useRouter } from "next/navigation";

import type { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";

type LogoutMutate = ReturnType<typeof useLogoutMutation>["mutate"];
type Router = ReturnType<typeof useRouter>;

export const handleLogoutClick = (mutate: LogoutMutate, router: Router) => {
  mutate(undefined, {
    onSuccess: () => router.replace("/"),
  });
};
