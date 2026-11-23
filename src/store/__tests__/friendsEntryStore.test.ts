import { useFriendsEntryStore } from "../friendsEntryStore";

describe("useFriendsEntryStore", () => {
  beforeEach(() => {
    useFriendsEntryStore.setState({ slideIn: false });
  });

  it("기본값은 slideIn=false다", () => {
    expect(useFriendsEntryStore.getState().slideIn).toBe(false);
  });

  it("setSlideIn으로 slideIn을 켜고 끈다", () => {
    useFriendsEntryStore.getState().setSlideIn(true);
    expect(useFriendsEntryStore.getState().slideIn).toBe(true);

    useFriendsEntryStore.getState().setSlideIn(false);
    expect(useFriendsEntryStore.getState().slideIn).toBe(false);
  });
});
