// 생일까지 남은 일수 → 안내 문구. 생일 정보가 없으면 undefined
export const getBirthdayDdayText = (birthdayDday: number | null) => {
  if (birthdayDday === null) return undefined;
  return birthdayDday === 0 ? "오늘이 생일이에요" : `생일까지 ${birthdayDday}일 남았어요`;
};
