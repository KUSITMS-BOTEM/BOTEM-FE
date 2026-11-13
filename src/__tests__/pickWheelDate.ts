import { screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

// 열려 있는 날짜 휠 시트에서 값을 고르고 확인을 누른다. 월에 따라 일 목록이 바뀌므로 년 → 월 → 일 순서로 고른다
export async function pickWheelDate(
  user: UserEvent,
  { year, month, day }: { year?: number; month: number; day: number },
) {
  if (year) await user.click(screen.getByRole("button", { name: `${year}년` }));
  await user.click(screen.getByRole("button", { name: `${month}월` }));
  await user.click(screen.getByRole("button", { name: `${day}일` }));
  await user.click(screen.getByRole("button", { name: "확인" }));
}
