import { useMutation } from "@tanstack/react-query";

import { authService } from "@/apis/auth/authService";

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: authService.postLogout,
  });
