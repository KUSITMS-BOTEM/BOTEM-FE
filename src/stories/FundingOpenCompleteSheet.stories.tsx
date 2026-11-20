import { useState, type ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import FundingOpenCompleteSheet from "@/widgets/funding/FundingOpenCompleteSheet";
import SampleProduct from "@/assets/images/samples/sample-product.png";
import { addDays } from "@/utils/funding/addDays";
import { getTodayDate } from "@/utils/funding/formatDeadline";
import type { MyProfile } from "@/types/user/profile";

const meta: Meta<typeof FundingOpenCompleteSheet> = {
  title: "Widgets/Funding/FundingOpenCompleteSheet",
  component: FundingOpenCompleteSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "720px" } },
  },
};

export default meta;
type Story = StoryObj<typeof FundingOpenCompleteSheet>;

// 시트가 내 프로필 쿼리로 이름을 읽으므로 캐시를 미리 채워 서버 없이 보여준다
const createQueryClient = (profile: MyProfile) => {
  const client = new QueryClient();
  client.setQueryData(["users", "me", "profile"], profile);
  return client;
};

const MY_PROFILE: MyProfile = {
  nickname: "민지",
  name: "민지",
  profileImageUrl: null,
  birthday: "03-14",
  wishProfileUrl: "https://example.com/wish/minji",
  kakaoConnected: true,
  email: null,
  joinedAt: "2026-01-01",
};

function FundingOpenCompleteSheetDemo({
  variant,
  progress,
}: {
  variant: ComponentProps<typeof FundingOpenCompleteSheet>["variant"];
  progress?: number;
}) {
  const [open, setOpen] = useState(true);
  const [queryClient] = useState(() => createQueryClient(MY_PROFILE));

  return (
    <QueryClientProvider client={queryClient}>
      <Button onClick={() => setOpen(true)}>개설 완료 열기</Button>
      <FundingOpenCompleteSheet
        open={open}
        {...(variant === "surprise"
          ? { variant, recipientName: "지유" }
          : { variant, cardTitle: "지유의 생일 펀딩", progress })}
        wish={{
          id: 1,
          productName: "소니 WH-1000XM5",
          productImageUrl: SampleProduct.src,
          price: 468000,
        }}
        info={{
          targetAmount: "429000",
          deadline: addDays(getTodayDate(), 7),
        }}
        shareKey="share-key-1"
        onClose={() => setOpen(false)}
      />
    </QueryClientProvider>
  );
}

export const Surprise: Story = {
  render: () => <FundingOpenCompleteSheetDemo variant="surprise" />,
};

export const Funding: Story = {
  render: () => <FundingOpenCompleteSheetDemo variant="funding" progress={80} />,
};
