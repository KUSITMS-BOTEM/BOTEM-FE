import { useMutation } from "@tanstack/react-query";

import { authService } from "@/apis/auth/authService";

export const useKakaoLoginMutation = () =>
  useMutation({
    mutationFn: authService.postKakaoLogin,
  });
