import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Header from "@/components/Header";

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="size-full">
    <path
      d="M15 6l-6 6 6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-full">
    <circle cx="6" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="18" cy="12" r="1.5" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="size-full">
    <path
      d="M12 16V4M12 4L8 8M12 4l4 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const backItem = { icon: <BackIcon />, ariaLabel: "뒤로가기", onClick: () => {} };
const moreItem = { icon: <MoreIcon />, ariaLabel: "더보기", onClick: () => {} };
const shareItem = { icon: <ShareIcon />, ariaLabel: "공유", onClick: () => {} };

const FRAME_360 = "border-semantic-border-weak mx-auto w-90 border border-dashed";
const FRAME_240 = "border-semantic-border-weak mx-auto w-60 border border-dashed";

const meta = {
  title: "Components/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    leftItem: { control: false },
    rightItems: { control: false },
  },
  args: {
    title: "페이지 타이틀",
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    leftItem: backItem,
    rightItems: [moreItem, shareItem],
    className: FRAME_360,
  },
};

export const IconCombinations: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Header
        title="페이지 타이틀"
        leftItem={backItem}
        rightItems={[shareItem]}
        className={FRAME_360}
      />
      <Header title="페이지 타이틀" rightItems={[shareItem]} className={FRAME_360} />
      <Header title="페이지 타이틀" rightItems={[moreItem, shareItem]} className={FRAME_360} />
      <Header title="페이지 타이틀" className={FRAME_360} />
    </div>
  ),
};

export const LongTitle: Story = {
  args: {
    title: "아주 길어서 줄바꿈 없이 말줄임표로 잘려야 하는 페이지 타이틀입니다",
    leftItem: backItem,
    rightItems: [moreItem, shareItem],
    className: FRAME_240,
  },
};
