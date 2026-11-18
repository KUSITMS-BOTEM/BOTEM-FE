import { NextRequest } from "next/server";

import { proxy } from "../proxy";

describe("proxy", () => {
  it("로그인 상태로 랜딩 페이지에 접근하면 /home으로 리다이렉트한다", () => {
    const request = new NextRequest("http://localhost/", {
      headers: { cookie: "isLoggedIn=true" },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBe("http://localhost/home");
  });

  it("비로그인 상태로 /home에 접근하면 랜딩 페이지로 리다이렉트한다", () => {
    const request = new NextRequest("http://localhost/home");

    const response = proxy(request);

    expect(response.headers.get("location")).toBe("http://localhost/");
  });

  it("isLoggedIn 쿠키 값이 true가 아니면 로그인 상태로 보지 않는다", () => {
    const request = new NextRequest("http://localhost/home", {
      headers: { cookie: "isLoggedIn=false" },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBe("http://localhost/");
  });

  it("로그인 상태로 /home에 접근하면 리다이렉트하지 않는다", () => {
    const request = new NextRequest("http://localhost/home", {
      headers: { cookie: "isLoggedIn=true" },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
  });

  it("비로그인 상태로 공유받은 친구 프로필에 접근하면 리다이렉트하지 않는다", () => {
    const request = new NextRequest("http://localhost/share/profile/5");

    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
  });

  it("로그인 상태로 공유받은 친구 프로필에 접근하면 친구 프로필 화면으로 리다이렉트한다", () => {
    const request = new NextRequest("http://localhost/share/profile/5", {
      headers: { cookie: "isLoggedIn=true" },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBe("http://localhost/friends/5");
  });

  it("비로그인 상태로 펀딩 공유 링크에 접근하면 리다이렉트하지 않는다", () => {
    const request = new NextRequest("http://localhost/share/7");

    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
  });

  it("로그인 상태로 펀딩 공유 링크에 접근하면 회원용 펀딩 상세로 리다이렉트한다", () => {
    const request = new NextRequest("http://localhost/share/7", {
      headers: { cookie: "isLoggedIn=true" },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBe("http://localhost/funding/7");
  });
});
