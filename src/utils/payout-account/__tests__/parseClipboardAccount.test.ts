import { parseClipboardAccount } from "../parseClipboardAccount";

describe("parseClipboardAccount", () => {
  describe("계좌번호만 있는 경우", () => {
    it("10자리 숫자면 accountOnly를 반환한다", () => {
      expect(parseClipboardAccount("1234567890")).toEqual({
        status: "accountOnly",
        accountNumber: "1234567890",
      });
    });

    it("14자리 숫자면 accountOnly를 반환한다", () => {
      expect(parseClipboardAccount("12345678901234")).toEqual({
        status: "accountOnly",
        accountNumber: "12345678901234",
      });
    });

    it("9자리(형식 미달)면 notFound를 반환한다", () => {
      expect(parseClipboardAccount("123456789")).toEqual({ status: "notFound" });
    });

    it("15자리(형식 초과)면 notFound를 반환한다", () => {
      expect(parseClipboardAccount("123456789012345")).toEqual({ status: "notFound" });
    });
  });

  describe("공백 1개로 은행명과 계좌번호가 구분된 경우", () => {
    it("등록된 은행 별칭과 정상 계좌번호면 bankAndAccount를 반환한다", () => {
      expect(parseClipboardAccount("토스 1234567890")).toEqual({
        status: "bankAndAccount",
        bankCode: "TOSS_BANK",
        accountNumber: "1234567890",
      });
    });

    it("다른 은행 별칭도 bankAndAccount를 반환한다", () => {
      expect(parseClipboardAccount("국민 1234567890")).toEqual({
        status: "bankAndAccount",
        bankCode: "KB_KOOKMIN",
        accountNumber: "1234567890",
      });
    });

    it("등록되지 않은 은행명이면 invalidBank를 반환한다", () => {
      expect(parseClipboardAccount("없는은행 1234567890")).toEqual({ status: "invalidBank" });
    });

    it("은행명은 정상이지만 계좌번호가 형식 미달이면 invalidAccount를 반환한다", () => {
      expect(parseClipboardAccount("토스 12345")).toEqual({ status: "invalidAccount" });
    });

    it("은행명은 정상이지만 계좌번호가 형식 초과면 invalidAccount를 반환한다", () => {
      expect(parseClipboardAccount("토스 123456789012345")).toEqual({ status: "invalidAccount" });
    });

    it("전체 은행명 별칭으로도 bankAndAccount를 반환한다", () => {
      expect(parseClipboardAccount("토스뱅크 1234567890")).toEqual({
        status: "bankAndAccount",
        bankCode: "TOSS_BANK",
        accountNumber: "1234567890",
      });
    });

    it("별칭과 부분 일치만 하는 은행명이면 invalidBank를 반환한다", () => {
      expect(parseClipboardAccount("토스뱅 1234567890")).toEqual({ status: "invalidBank" });
    });
  });

  describe("공백이 2개 이상인 경우", () => {
    it("연속 공백은 구분자 하나로 처리해 bankAndAccount를 반환한다", () => {
      expect(parseClipboardAccount("토스  1234567890")).toEqual({
        status: "bankAndAccount",
        bankCode: "TOSS_BANK",
        accountNumber: "1234567890",
      });
    });

    it("토큰이 3개 이상이면 notFound를 반환한다", () => {
      expect(parseClipboardAccount("토스 1234567890 추가토큰")).toEqual({ status: "notFound" });
    });
  });

  describe("공백 없이 은행명과 계좌번호가 붙어있는 경우", () => {
    it("은행 별칭 접두사를 분리해 bankAndAccount를 반환한다", () => {
      expect(parseClipboardAccount("토스1234567890")).toEqual({
        status: "bankAndAccount",
        bankCode: "TOSS_BANK",
        accountNumber: "1234567890",
      });
    });

    it("접두 후보가 여러 개면 가장 긴 별칭으로 분리한다", () => {
      expect(parseClipboardAccount("토스뱅크1234567890")).toEqual({
        status: "bankAndAccount",
        bankCode: "TOSS_BANK",
        accountNumber: "1234567890",
      });
    });

    it("은행 별칭만 있고 남은 계좌번호가 없으면 invalidAccount를 반환한다", () => {
      expect(parseClipboardAccount("토스")).toEqual({ status: "invalidAccount" });
    });

    it("알 수 없는 접두사면 notFound를 반환한다", () => {
      expect(parseClipboardAccount("가나다1234567890")).toEqual({ status: "notFound" });
    });
  });

  describe("빈 입력", () => {
    it("빈 문자열이면 notFound를 반환한다", () => {
      expect(parseClipboardAccount("")).toEqual({ status: "notFound" });
    });

    it("공백만 있으면 notFound를 반환한다", () => {
      expect(parseClipboardAccount("   ")).toEqual({ status: "notFound" });
    });
  });

  describe("앞뒤 공백 처리", () => {
    it("앞뒤 공백은 trim 후 정상 매칭된다", () => {
      expect(parseClipboardAccount("  토스 1234567890  ")).toEqual({
        status: "bankAndAccount",
        bankCode: "TOSS_BANK",
        accountNumber: "1234567890",
      });
    });
  });

  describe("은행 앱 복사 형식(하이픈·줄바꿈)", () => {
    it("계좌번호에 하이픈이 섞여 있으면 제거한 뒤 매칭한다", () => {
      expect(parseClipboardAccount("카카오뱅크 3333-01-1234567")).toEqual({
        status: "bankAndAccount",
        bankCode: "KAKAO_BANK",
        accountNumber: "3333011234567",
      });
    });

    it("계좌번호만 하이픈과 함께 있어도 accountOnly로 인식한다", () => {
      expect(parseClipboardAccount("3333-01-1234567")).toEqual({
        status: "accountOnly",
        accountNumber: "3333011234567",
      });
    });

    it("은행명과 계좌번호 사이에 줄바꿈이 있으면 공백처럼 처리한다", () => {
      expect(parseClipboardAccount("토스뱅크\n1234567890")).toEqual({
        status: "bankAndAccount",
        bankCode: "TOSS_BANK",
        accountNumber: "1234567890",
      });
    });

    it("은행명과 계좌번호 사이에 CRLF가 있어도 공백처럼 처리한다", () => {
      expect(parseClipboardAccount("토스뱅크\r\n1234567890")).toEqual({
        status: "bankAndAccount",
        bankCode: "TOSS_BANK",
        accountNumber: "1234567890",
      });
    });
  });
});
