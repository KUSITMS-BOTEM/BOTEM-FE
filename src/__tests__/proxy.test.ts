import { NextRequest } from "next/server";

import { proxy } from "../proxy";

describe("proxy", () => {
  it("로그인 상태로 랜딩 페이지에 접근하면 /main으로 리다이렉트한다", () => {
    const request = new NextRequest("http://localhost/", {
      headers: { cookie: "isLoggedIn=true" },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBe("http://localhost/main");
  });

  it("비로그인 상태로 /main에 접근하면 랜딩 페이지로 리다이렉트한다", () => {
    const request = new NextRequest("http://localhost/main");

    const response = proxy(request);

    expect(response.headers.get("location")).toBe("http://localhost/");
  });

  it("isLoggedIn 쿠키 값이 true가 아니면 로그인 상태로 보지 않는다", () => {
    const request = new NextRequest("http://localhost/main", {
      headers: { cookie: "isLoggedIn=false" },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBe("http://localhost/");
  });

  it("로그인 상태로 /main에 접근하면 리다이렉트하지 않는다", () => {
    const request = new NextRequest("http://localhost/main", {
      headers: { cookie: "isLoggedIn=true" },
    });

    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
  });
});
