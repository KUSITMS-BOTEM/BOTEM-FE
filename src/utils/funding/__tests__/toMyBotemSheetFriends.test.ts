import { toMyBotemSheetFriends } from "@/utils/funding/toMyBotemSheetFriends";

const participants = [
  { order: 1, name: "하린이", profileImageUrl: null, participatedAt: "2026-11-10T09:00:00" },
  {
    order: 2,
    name: "도윤이",
    profileImageUrl: "https://img/a.png",
    participatedAt: "2026-11-12T18:30:00",
  },
  { order: 3, name: "서준이", profileImageUrl: null, participatedAt: "2026-11-15T21:10:00" },
];

describe("toMyBotemSheetFriends", () => {
  it("내 이름과 같은 참여자를 맨 위로 올리고 내 보탬으로 표시한다", () => {
    const friends = toMyBotemSheetFriends({
      participants,
      myName: "서준이",
      hasUnconfirmed: false,
    });

    expect(friends.map(friend => friend.name)).toEqual(["서준이", "하린이", "도윤이"]);
    expect(friends[0]).toMatchObject({
      isMine: true,
      isConfirmed: true,
      contributedAt: "2026-11-15T21:10:00",
    });
  });

  it("미확인 보탬이 있으면 내 보탬을 확인 전으로 표시한다", () => {
    const [mine] = toMyBotemSheetFriends({ participants, myName: "하린이", hasUnconfirmed: true });

    expect(mine.isConfirmed).toBe(false);
  });

  it("못 받았다고 한 보탬이면 내 보탬에 거절 표시를 한다", () => {
    const [mine] = toMyBotemSheetFriends({
      participants,
      myName: "하린이",
      hasUnconfirmed: true,
      isRejected: true,
    });

    expect(mine).toMatchObject({ isConfirmed: false, isRejected: true });
  });

  it("프로필 사진이 없으면 비워 기본 프로필이 나오게 한다", () => {
    const friends = toMyBotemSheetFriends({ participants, myName: null, hasUnconfirmed: false });

    expect(friends[0].profileImageUrl).toBeUndefined();
    expect(friends[1].profileImageUrl).toBe("https://img/a.png");
  });

  it("내 이름이 없거나 목록에 없으면 원래 순서를 지키고 내 보탬 표시를 하지 않는다", () => {
    const friends = toMyBotemSheetFriends({
      participants,
      myName: "없는이름",
      hasUnconfirmed: true,
    });

    expect(friends.map(friend => friend.name)).toEqual(["하린이", "도윤이", "서준이"]);
    expect(friends.some(friend => friend.isMine)).toBe(false);
  });
});
