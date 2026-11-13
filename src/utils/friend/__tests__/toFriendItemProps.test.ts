import { toFriendItemProps } from "@/utils/friend/toFriendItemProps";

const base = {
  userId: 1,
  name: "민지",
  profileImageUrl: null,
  birthday: "10-24",
  birthdayDday: 3,
  wishCount: 3,
};

describe("toFriendItemProps", () => {
  it("생일을 'M월 D일' 문구로 바꾼다", () => {
    expect(toFriendItemProps(base).birthdayText).toBe("생일 10월 24일");
  });

  it("생일이 없으면 birthdayText가 없다", () => {
    expect(toFriendItemProps({ ...base, birthday: null }).birthdayText).toBeUndefined();
  });

  it("withDday면 D-day 문구를 만들고, 0일이면 오늘 문구를 쓴다", () => {
    expect(toFriendItemProps(base, true).dDayText).toBe("생일까지 3일 남았어요");
    expect(toFriendItemProps({ ...base, birthdayDday: 0 }, true).dDayText).toBe(
      "오늘이 생일이에요",
    );
  });

  it("withDday가 아니면 D-day 문구가 없다", () => {
    expect(toFriendItemProps(base).dDayText).toBeUndefined();
  });
});
