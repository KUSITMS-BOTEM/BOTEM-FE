import Link from "next/link";

// 카카오 비즈니스 정보 심사용. 문구는 사업자등록증과 동일해야 하므로 띄어쓰기까지 바꾸지 말 것
export default function BusinessFooter() {
  return (
    <footer className="text-semantic-text-tertiary text-left text-[10px] leading-normal">
      <p>상호 보탬 | 대표자 정지율</p>
      <p>사업자등록번호 834-53-01261</p>
      <p>주소 서울특별시 강남구 남부순환로381길 46(도곡동)</p>
      <p>이메일 botem33333@gmail.com</p>
      <p>
        이용약관 |{" "}
        <Link href="/privacy" className="underline">
          개인정보처리방침
        </Link>
      </p>
      <p>© 2026 보탬. All rights reserved.</p>
    </footer>
  );
}
