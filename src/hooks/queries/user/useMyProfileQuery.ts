import { useQuery } from "@tanstack/react-query";

import { userService } from "@/apis/user/userService";

// enabled=false는 비회원 화면처럼 로그인 여부가 불확실한 곳에서 401 요청을 막을 때 쓴다
export const useMyProfileQuery = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ["users", "me", "profile"],
    queryFn: userService.getMyProfile,
    // 프로필은 온보딩 완료·탈퇴 등 명시적 액션으로만 바뀌므로 자동 재검증 대신 수동 invalidate로 갱신한다
    staleTime: Infinity,
    gcTime: Infinity,
  });
