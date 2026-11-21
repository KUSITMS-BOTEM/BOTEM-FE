import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import FundingLockedView from "@/widgets/funding/FundingLockedView";

const meta = {
  title: "Widgets/Funding/FundingLockedView",
  component: FundingLockedView,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    revealDateLabel: "10월 13일 0시",
  },
  // useRouter가 App Router 컨텍스트를 요구해 스토리에서는 빈 라우터로 대신한다
  decorators: [
    Story => (
      <AppRouterContext.Provider
        value={{
          bfcacheId: "story",
          back: () => {},
          forward: () => {},
          prefetch: () => {},
          push: () => {},
          refresh: () => {},
          replace: () => {},
        }}>
        <Story />
      </AppRouterContext.Provider>
    ),
  ],
} satisfies Meta<typeof FundingLockedView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// 아직 로그인하지 않은 방문자
export const LoginRequired: Story = {
  args: { onKakaoLogin: () => {} },
};
