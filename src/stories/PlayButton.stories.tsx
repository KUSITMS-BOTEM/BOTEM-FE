import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import PlayButton from "@/widgets/letter-paper/PlayButton";

const COLORS = ["pink", "orange", "lime", "blue"] as const;

const meta = {
  title: "Widgets/LetterPaper/PlayButton",
  component: PlayButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "편지지의 음성 메시지 재생 버튼. 재생 전(`isPlaying=false`)에는 편지지 색(`color`) 원 위에 검정 재생 아이콘, 재생 중(`isPlaying=true`)에는 검정 원 위에 `color` 색 일시정지 아이콘이다. 크기는 30×30px 고정이다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "inline-radio",
      options: COLORS,
      description: "편지지 색. 재생 상태에서는 원, 일시정지 상태에서는 막대에 적용된다.",
    },
    isPlaying: {
      control: "boolean",
      description: "재생 중 여부. false면 재생 아이콘, true면 일시정지 아이콘.",
    },
    onClick: { action: "clicked", description: "버튼 클릭 핸들러" },
    className: { control: "text", description: "루트 `<button>`에 병합되는 클래스" },
  },
  args: {
    color: "pink",
    isPlaying: false,
  },
} satisfies Meta<typeof PlayButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playing: Story = {
  args: { isPlaying: true },
};

export const Colors: Story = {
  parameters: {
    docs: { description: { story: "재생 전 색 4종(pink·orange·lime·blue) 비교." } },
  },
  render: args => (
    <div className="flex gap-6">
      {COLORS.map(color => (
        <PlayButton key={color} {...args} color={color} isPlaying={false} />
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  parameters: {
    docs: { description: { story: "색 4종 × 재생·일시정지 상태 전체 비교." } },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      {[false, true].map(isPlaying => (
        <div key={String(isPlaying)} className="flex gap-6">
          {COLORS.map(color => (
            <PlayButton key={color} color={color} isPlaying={isPlaying} />
          ))}
        </div>
      ))}
    </div>
  ),
};
