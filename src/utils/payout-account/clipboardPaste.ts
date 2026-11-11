import type { BankCode } from "@/constants/bank";
import type { ClipboardAccountParseResult } from "@/utils/payout-account/parseClipboardAccount";

type ClipboardPasteAction = {
  accountNumber?: string;
  bankCode?: BankCode;
  toastText?: string;
};

const FAILURE_TOAST_TEXT: Record<"invalidBank" | "invalidAccount" | "notFound", string> = {
  invalidBank: "등록되지 않은 은행이에요",
  invalidAccount: "계좌번호 형식을 확인해주세요",
  notFound: "복사된 계좌가 없어요",
};

export function resolveClipboardPasteAction(
  result: ClipboardAccountParseResult,
): ClipboardPasteAction {
  switch (result.status) {
    case "accountOnly":
      return { accountNumber: result.accountNumber };
    case "bankAndAccount":
      return { accountNumber: result.accountNumber, bankCode: result.bankCode };
    default:
      return { toastText: FAILURE_TOAST_TEXT[result.status] };
  }
}

export async function readClipboardText(): Promise<string> {
  try {
    return await navigator.clipboard.readText();
  } catch {
    return "";
  }
}
