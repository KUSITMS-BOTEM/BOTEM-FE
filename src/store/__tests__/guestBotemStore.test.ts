import { useGuestBotemStore } from "@/store/guestBotemStore";

describe("guestBotemStore", () => {
  afterEach(() => useGuestBotemStore.getState().reset());

  it("처음에는 아무 값도 담겨 있지 않다", () => {
    expect(useGuestBotemStore.getState()).toMatchObject({
      shareKey: null,
      name: null,
      password: null,
    });
  });

  it("setIdentity는 공유 키와 이름·비밀번호를 함께 저장한다", () => {
    useGuestBotemStore.getState().setIdentity("7", "민지", "1234");

    expect(useGuestBotemStore.getState()).toMatchObject({
      shareKey: "7",
      name: "민지",
      password: "1234",
    });
  });

  it("reset은 저장된 값을 모두 비운다", () => {
    useGuestBotemStore.getState().setIdentity("7", "민지", "1234");

    useGuestBotemStore.getState().reset();

    expect(useGuestBotemStore.getState()).toMatchObject({
      shareKey: null,
      name: null,
      password: null,
    });
  });
});
