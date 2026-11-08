import { BANKS, type BankCode } from "@/constants/bank";

export const ACCOUNT_NUMBER_REGEX = /^\d{10,14}$/;

export type ClipboardAccountParseResult =
  | { status: "accountOnly"; accountNumber: string }
  | { status: "bankAndAccount"; bankCode: BankCode; accountNumber: string }
  | { status: "invalidBank" }
  | { status: "invalidAccount" }
  | { status: "notFound" };

function findBankByAlias(name: string) {
  return BANKS.find(bank => bank.aliases.includes(name));
}

// 공백 없이 붙어있는 경우(예: "토스1234567890") 등록된 별칭 중 가장 긴 접두 일치를 찾는다.
function findBankByAliasPrefix(text: string) {
  let longest: { bankCode: BankCode; alias: string } | null = null;
  for (const bank of BANKS) {
    for (const alias of bank.aliases) {
      if (text.startsWith(alias) && (!longest || alias.length > longest.alias.length)) {
        longest = { bankCode: bank.code, alias };
      }
    }
  }
  return longest;
}

export function parseClipboardAccount(text: string): ClipboardAccountParseResult {
  // 은행 앱 복사 형식 대응: 계좌번호의 하이픈은 제거하고, 줄바꿈은 공백으로 취급한다
  const trimmed = text
    .replace(/[\r\n\t]/g, " ")
    .replace(/-/g, "")
    .trim();
  if (!trimmed) return { status: "notFound" };
  if (ACCOUNT_NUMBER_REGEX.test(trimmed)) return { status: "accountOnly", accountNumber: trimmed };

  const tokens = trimmed.split(" ");
  if (tokens.length === 2) {
    const [bankName, accountNumber] = tokens;
    const bank = findBankByAlias(bankName);
    if (!bank) return { status: "invalidBank" };
    if (!ACCOUNT_NUMBER_REGEX.test(accountNumber)) return { status: "invalidAccount" };
    return { status: "bankAndAccount", bankCode: bank.code, accountNumber };
  }
  if (tokens.length > 2) return { status: "notFound" };

  const prefixMatch = findBankByAliasPrefix(trimmed);
  if (!prefixMatch) return { status: "notFound" };
  const accountNumber = trimmed.slice(prefixMatch.alias.length);
  if (!ACCOUNT_NUMBER_REGEX.test(accountNumber)) return { status: "invalidAccount" };
  return { status: "bankAndAccount", bankCode: prefixMatch.bankCode, accountNumber };
}
