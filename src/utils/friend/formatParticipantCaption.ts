// "민지" · 7명 → "민지님 외 6명 참여중". 참여자가 없거나 대표 이름이 없으면 빈 문자열
export const formatParticipantCaption = (name: string | null, participantCount: number) => {
  if (!name || participantCount <= 0) return "";
  return participantCount === 1
    ? `${name}님 참여중`
    : `${name}님 외 ${participantCount - 1}명 참여중`;
};
