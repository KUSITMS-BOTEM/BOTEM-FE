import type { MyProfile } from "@/types/user/profile";

// 사용자가 입력한 이름을 우선하고, 온보딩 전이라 이름이 없으면 카카오 닉네임을 쓴다
export const getDisplayName = ({ name, nickname }: Pick<MyProfile, "name" | "nickname">) =>
  name ?? nickname;
