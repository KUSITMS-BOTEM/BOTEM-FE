import { useMutation } from "@tanstack/react-query";

import { authService } from "@/apis/auth/authService";

export const useKakaoLoginUriMutation = () =>
  useMutation({
    mutationFn: authService.getKakaoLoginUri,
  });
