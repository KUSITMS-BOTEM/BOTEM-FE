import { render, screen } from "@testing-library/react";

import BusinessFooter from "@/components/BusinessFooter";

describe("BusinessFooter", () => {
  it("사업자등록증과 같은 문구를 노출한다", () => {
    const { container } = render(<BusinessFooter />);

    expect(container.querySelector("footer")?.textContent).toBe(
      [
        "상호 보탬 | 대표자 정지율",
        "사업자등록번호 834-53-01261",
        "주소 서울특별시 강남구 남부순환로381길 46(도곡동)",
        "이메일 botem33333@gmail.com",
        "이용약관 | 개인정보처리방침",
        "© 2026 보탬. All rights reserved.",
      ].join(""),
    );
  });

  it("개인정보처리방침만 /privacy로 연결하고 이용약관은 링크가 아니다", () => {
    render(<BusinessFooter />);

    expect(screen.getByRole("link", { name: "개인정보처리방침" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
