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
  logo: ReactNode;
};

export const BANKS: Bank[] = [
  {
    code: "toss",
    name: "토스뱅크",
    logo: <Image src={TossBankLogo} alt="토스뱅크" className="size-6 object-contain" />,
  },
  { code: "kakao", name: "카카오뱅크", logo: <KakaoBankLogo className="size-6" /> },
  { code: "kb", name: "KB국민", logo: <KbBankLogo className="size-6" /> },
  { code: "shinhan", name: "신한", logo: <ShinhanBankLogo className="size-6" /> },
  { code: "hana", name: "하나", logo: <HanaBankLogo className="size-6" /> },
  { code: "woori", name: "우리", logo: <WooriBankLogo className="size-6" /> },
  { code: "nh", name: "NH농협", logo: <NhBankLogo className="size-6" /> },
  {
    code: "kbank",
    name: "K뱅크",
    logo: <Image src={KBankLogo} alt="K뱅크" className="size-6 object-contain" />,
  },
];
