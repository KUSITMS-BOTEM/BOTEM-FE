import { useQuery } from "@tanstack/react-query";

import { userService } from "@/apis/user/userService";

export const useMyProfileQuery = () =>
  useQuery({
    queryKey: ["users", "me", "profile"],
    queryFn: userService.getMyProfile,
  });
