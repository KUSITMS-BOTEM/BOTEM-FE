import { useMutation } from "@tanstack/react-query";

import { userService } from "@/apis/user/userService";

export const useCompleteOnboardingMutation = () =>
  useMutation({
    mutationFn: userService.completeOnboarding,
  });
