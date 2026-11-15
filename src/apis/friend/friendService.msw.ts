import { delay, http, HttpResponse } from "msw";

export const friendHandlers = [
  http.get("*/api/friends", async () => {
    await delay(500);
    const upcoming = [
      {
        userId: 2,
        name: "민지",
        profileImageUrl: null,
        birthday: "11-16",
        birthdayDday: 3,
        wishCount: 3,
      },
      {
        userId: 3,
        name: "서준",
        profileImageUrl: null,
        birthday: "11-20",
        birthdayDday: 7,
        wishCount: 6,
      },
      {
        userId: 4,
        name: "정민",
        profileImageUrl: null,
        birthday: "12-03",
        birthdayDday: 20,
        wishCount: 0,
      },
      {
        userId: 5,
        name: "지우",
        profileImageUrl: null,
        birthday: "12-07",
        birthdayDday: 24,
        wishCount: 6,
      },
    ];
    const others = [
      {
        userId: 6,
        name: "하린",
        profileImageUrl: null,
        birthday: "03-28",
        birthdayDday: 135,
        wishCount: 4,
      },
      {
        userId: 7,
        name: "예준",
        profileImageUrl: null,
        birthday: null,
        birthdayDday: null,
        wishCount: 0,
      },
    ];
    return HttpResponse.json({
      success: true,
      data: {
        totalCount: upcoming.length + others.length,
        upcomingBirthdayFriends: upcoming,
        friends: [...others, ...upcoming].sort((a, b) => a.name.localeCompare(b.name, "ko")),
      },
      error: null,
    });
  }),
];
