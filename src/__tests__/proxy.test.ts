import { NextRequest } from "next/server";

import { config, proxy } from "../proxy";

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

  it("펀딩 공유 링크는 proxy가 다루지 않아 참여 회원이 share에 머문다 (개설자 분기는 page에서 한다)", () => {
    expect(config.matcher).not.toContain("/share/:fundingId");
  });

  it("위시 프로필 링크는 proxy가 다루지 않는다 (로그인 방문자의 친구 맺기는 화면에서 한다)", () => {
    expect(config.matcher.some(path => path.startsWith("/share/profile"))).toBe(false);
  });
});
