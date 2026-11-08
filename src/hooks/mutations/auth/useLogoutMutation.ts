import { useMutation } from "@tanstack/react-query";

import { authService } from "@/apis/auth/authService";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { clearWishPromptPending } from "@/utils/wishPromptStorage";

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: authService.postLogout,
    onSuccess: () => {
      useAuthStore.getState().clearAccessToken();
      queryClient.removeQueries({ queryKey: ["users", "me"] });
      clearWishPromptPending();
    },
  });
