import { useAuthStore } from "../authStore";

describe("useAuthStore", () => {
  afterEach(() => {
    useAuthStore.getState().clearAccessToken();
  });

  it("초기 accessToken은 null이다", () => {
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("setAccessToken으로 accessToken을 저장한다", () => {
    useAuthStore.getState().setAccessToken("access-token");

    expect(useAuthStore.getState().accessToken).toBe("access-token");
  });

  it("clearAccessToken으로 accessToken을 비운다", () => {
    useAuthStore.getState().setAccessToken("access-token");
    useAuthStore.getState().clearAccessToken();

    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
