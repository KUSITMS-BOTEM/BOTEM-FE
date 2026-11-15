import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import VoiceMessage from "@/widgets/letter-paper/VoiceMessage";

const COLORS = ["pink", "orange", "lime", "blue"] as const;

const meta = {
  title: "Widgets/LetterPaper/VoiceMessage",
  component: VoiceMessage,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "편지지에 붙는 음성 메시지 칩. 흰 pill 안에 검정 원형 녹음 아이콘과 파형 5개가 있으며, 편지지 색(`color`)에 따라 파형 색이 바뀐다. 표시 전용이라 클릭 동작은 없다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "inline-radio",
      options: COLORS,
      description: "편지지 색. 파형 색(`--color-base-{color}-500`)에 반영된다.",
    },
    className: { control: "text", description: "루트 `<div>`에 병합되는 클래스" },
  },
  args: {
    color: "pink",
  },
} satisfies Meta<typeof VoiceMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Colors: Story = {
  parameters: {
    docs: {
      description: { story: "편지지 색 4종(pink·orange·lime·blue) 비교 (Figma 4개 variant)." },
    },
  },
  render: () => (
    <div className="bg-semantic-fill-neutral-weak flex gap-6 p-6">
      {COLORS.map(color => (
        <VoiceMessage key={color} color={color} />
      ))}
    </div>
  ),
};
