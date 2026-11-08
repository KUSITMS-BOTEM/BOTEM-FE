import type { ReactNode } from "react";
import Image from "next/image";

import TossBankLogo from "@/assets/images/banks/TOSS_BANK.png";
import KakaoBankLogo from "@/assets/images/banks/KAKAO_BANK.svg?react";
import KbBankLogo from "@/assets/images/banks/KB_KOOKMIN.svg?react";
import ShinhanBankLogo from "@/assets/images/banks/SHINHAN.svg?react";
import HanaBankLogo from "@/assets/images/banks/HANA.svg?react";
import WooriBankLogo from "@/assets/images/banks/WOORI.svg?react";
import NhBankLogo from "@/assets/images/banks/NH_NONGHYUP.svg?react";
import KBankLogo from "@/assets/images/banks/K_BANK.png";
import IbkBankLogo from "@/assets/images/banks/IBK.svg?react";
import ScBankLogo from "@/assets/images/banks/SC.svg?react";
import CitiBankLogo from "@/assets/images/banks/CITI.svg?react";
import KdbBankLogo from "@/assets/images/banks/KDB.png";

export type BankCode =
  | "TOSS_BANK"
  | "KAKAO_BANK"
  | "KB_KOOKMIN"
  | "SHINHAN"
  | "HANA"
  | "WOORI"
  | "NH_NONGHYUP"
  | "K_BANK"
  | "IBK"
  | "SC"
  | "CITI"
  | "KDB";

export type Bank = {
  code: BankCode;
  name: string;
  // 클립보드 붙여넣기로 들어오는 은행명 표기 변형 매칭용 (표시는 항상 name 사용)
  aliases: string[];
  logo: ReactNode;
};

export const BANKS: Bank[] = [
  {
    code: "TOSS_BANK",
    name: "토스뱅크",
    aliases: ["토스뱅크", "토스"],
    logo: <Image src={TossBankLogo} alt="" className="size-6 object-contain" />,
  },
  {
    code: "KAKAO_BANK",
    name: "카카오뱅크",
    aliases: ["카카오뱅크", "카카오"],
    logo: <KakaoBankLogo className="size-6" />,
  },
  {
    code: "KB_KOOKMIN",
    name: "KB국민",
    aliases: ["KB국민은행", "국민은행", "KB국민", "국민"],
    logo: <KbBankLogo className="size-6" />,
  },
  {
    code: "SHINHAN",
    name: "신한",
    aliases: ["신한은행", "신한뱅크", "신한"],
    logo: <ShinhanBankLogo className="size-6" />,
  },
  {
    code: "HANA",
    name: "하나",
    aliases: ["하나은행", "하나뱅크", "하나"],
    logo: <HanaBankLogo className="size-6" />,
  },
  {
    code: "WOORI",
    name: "우리",
    aliases: ["우리은행", "우리뱅크", "우리"],
    logo: <WooriBankLogo className="size-6" />,
  },
  {
    code: "NH_NONGHYUP",
    name: "NH농협",
    aliases: ["NH농협은행", "농협은행", "NH농협", "농협"],
    logo: <NhBankLogo className="size-6" />,
  },
  {
    code: "K_BANK",
    name: "케이뱅크",
    aliases: ["케이뱅크", "K뱅크", "KBank"],
    logo: <Image src={KBankLogo} alt="" className="size-6 object-contain" />,
  },
  {
    code: "IBK",
    name: "IBK기업",
    aliases: ["IBK기업은행", "IBK기업", "기업은행", "기업"],
    // IBK 심볼 에셋은 흰 원 없이 심볼만 포함돼 있어, 피그마의 logo / bank 흰 원 wrapper를 코드에서 재현
    logo: (
      <span className="bg-semantic-fill-default flex size-6 shrink-0 items-center justify-center overflow-clip rounded-full">
        <IbkBankLogo />
      </span>
    ),
  },
  {
    code: "SC",
    name: "SC제일",
    aliases: ["SC제일은행", "SC제일", "제일은행"],
    logo: (
      <span className="bg-semantic-fill-default flex size-6 shrink-0 items-center justify-center overflow-clip rounded-full">
        <ScBankLogo />
      </span>
    ),
  },
  {
    code: "CITI",
    name: "한국씨티",
    aliases: ["한국씨티은행", "한국씨티", "씨티은행", "씨티"],
    logo: (
      <span className="bg-semantic-fill-default flex size-6 shrink-0 items-center justify-center overflow-clip rounded-full">
        <CitiBankLogo />
      </span>
    ),
  },
  {
    code: "KDB",
    name: "KDB산업",
    aliases: ["KDB산업은행", "KDB산업", "산업은행", "산업"],
    logo: (
      <span className="bg-semantic-fill-default flex size-6 shrink-0 items-center justify-center overflow-clip rounded-full">
        <Image src={KdbBankLogo} alt="" className="h-3.5 w-auto object-contain" />
      </span>
    ),
  },
];
