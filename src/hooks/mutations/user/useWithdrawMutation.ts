import { useMutation } from "@tanstack/react-query";

import { userService } from "@/apis/user/userService";

export const useWithdrawMutation = () =>
  useMutation({
    mutationFn: userService.withdraw,
  });
