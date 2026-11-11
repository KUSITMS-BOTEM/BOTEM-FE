export const formatBirthdayDisplay = (birthday: string) => {
  const [month, day] = birthday.split("-").map(Number);
  return `${month}월 ${day}일`;
};
