import IconAccount from "@/assets/icons/multicolor/icon-account.svg?react";
import IconFaqGuide from "@/assets/icons/multicolor/icon-faq-guide.svg?react";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";
import IconNotification from "@/assets/icons/multicolor/icon-notification.svg?react";
import IconTerms from "@/assets/icons/multicolor/icon-terms.svg?react";
import IconWishAdd from "@/assets/icons/multicolor/icon-wish-add.svg?react";
import cat from "@/assets/images/samples/cat.jpg";
import type { LetterPaperProps } from "@/widgets/letter-paper/LetterPaper";

const icon = (Icon: typeof IconAccount) => <Icon aria-hidden className="size-full" />;

// TODO(API): 더미 데이터입니다. 실제 편지지 조회 API를 연결하면 이 파일을 지우고 응답 데이터로 교체하세요
export const DUMMY_LETTERS: LetterPaperProps[] = [
  {
    style: "whiteDot",
    color: "orange",
    text: "지유야 생일 축하해! 올해도 같이 많이 웃자",
    senderName: "민지",
    hasVoiceMessage: true,
    photoSrc: cat,
    largeIcon: icon(IconWishAdd),
    smallIcon: icon(IconFaqGuide),
  },
  {
    style: "whiteDot",
    color: "lime",
    text: "항상 곁에서 힘이 돼줘서 고마워. 앞으로도 오래오래 함께하자. 사랑해!",
    senderName: "서준",
    photoSrc: cat,
    largeIcon: icon(IconFundingOpen),
    smallIcon: icon(IconAccount),
  },
  {
    style: "whiteDot",
    color: "pink",
    text: "생일 축하해! 맛있는 거 많이 먹고 행복한 하루 보내~",
    senderName: "하은",
    hasVoiceMessage: true,
    photoSrc: cat,
    largeIcon: icon(IconFaqGuide),
    smallIcon: icon(IconNotification),
  },
  {
    style: "whiteDot",
    color: "blue",
    text: "지유야 생일 축하해! 올해도 같이 많이 웃고 맛있는 것도 많이 먹자. 항상 곁에서 힘이 돼줘서 고마워. 앞으로도 오래오래 함께하자. 사랑해 우리 지유 생일 정말 정말 축하해!",
    senderName: "예준",
    photoSrc: cat,
    largeIcon: icon(IconTerms),
    smallIcon: icon(IconWishAdd),
  },
  {
    style: "colorDot",
    color: "pink",
    text: "오늘은 네가 주인공이야. 선물 마음에 들었으면 좋겠다!",
    senderName: "수아",
    photoSrc: cat,
    largeIcon: icon(IconAccount),
    smallIcon: icon(IconFundingOpen),
  },
];
