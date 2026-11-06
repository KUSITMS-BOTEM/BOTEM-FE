import type { ReactNode } from "react";
import Image from "next/image";

import TossBankLogo from "@/assets/images/banks/toss-bank.png";
import KakaoBankLogo from "@/assets/images/banks/kakao-bank.svg?react";
import KbBankLogo from "@/assets/images/banks/kb-bank.svg?react";
import ShinhanBankLogo from "@/assets/images/banks/shinhan-bank.svg?react";
import HanaBankLogo from "@/assets/images/banks/hana-bank.svg?react";
import WooriBankLogo from "@/assets/images/banks/woori-bank.svg?react";
import NhBankLogo from "@/assets/images/banks/nh-bank.svg?react";
import KBankLogo from "@/assets/images/banks/k-bank.png";

export type BankCode = "toss" | "kakao" | "kb" | "shinhan" | "hana" | "woori" | "nh" | "kbank";

export type Bank = {
  code: BankCode;
  name: string;
  // 클립보드 붙여넣기로 들어오는 은행명 표기 변형 매칭용 (표시는 항상 name 사용)
  aliases: string[];
  logo: ReactNode;
};

export const BANKS: Bank[] = [
  {
    code: "toss",
    name: "토스뱅크",
    aliases: ["토스뱅크", "토스"],
    logo: <Image src={TossBankLogo} alt="토스뱅크" className="size-6 object-contain" />,
  },
  {
    code: "kakao",
    name: "카카오뱅크",
    aliases: ["카카오뱅크", "카카오"],
    logo: <KakaoBankLogo className="size-6" />,
  },
  {
    code: "kb",
    name: "KB국민",
    aliases: ["KB국민은행", "국민은행", "KB국민", "국민"],
    logo: <KbBankLogo className="size-6" />,
  },
  {
    code: "shinhan",
    name: "신한",
    aliases: ["신한은행", "신한뱅크", "신한"],
    logo: <ShinhanBankLogo className="size-6" />,
  },
  {
    code: "hana",
    name: "하나",
    aliases: ["하나은행", "하나뱅크", "하나"],
    logo: <HanaBankLogo className="size-6" />,
  },
  {
    code: "woori",
    name: "우리",
    aliases: ["우리은행", "우리뱅크", "우리"],
    logo: <WooriBankLogo className="size-6" />,
  },
  {
    code: "nh",
    name: "NH농협",
    aliases: ["NH농협은행", "농협은행", "NH농협", "농협"],
    logo: <NhBankLogo className="size-6" />,
  },
  {
    code: "kbank",
    name: "K뱅크",
    aliases: ["케이뱅크", "K뱅크", "KBank"],
    logo: <Image src={KBankLogo} alt="K뱅크" className="size-6 object-contain" />,
  },
];
