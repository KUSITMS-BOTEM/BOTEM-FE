import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import RecordButton from "@/widgets/letter-paper/RecordButton";

const COLORS = ["pink", "orange", "lime", "blue"] as const;

const meta = {
  title: "Widgets/LetterPaper/RecordButton",
  component: RecordButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "편지지 작성 페이지의 녹음 버튼. 녹음 전(`isRecording=false`)에는 `color`와 무관하게 회색 배경·흰 아이콘이고, 녹음이 시작되면(`isRecording=true`) 편지지 색(`color`)으로 바뀐다. lime 배경에서만 아이콘이 검정이다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "inline-radio",
      options: COLORS,
      description: "녹음 중일 때의 배경색. 녹음 전에는 적용되지 않는다.",
    },
    isRecording: {
      control: "boolean",
      description: "녹음 중 여부. false면 회색 idle 상태, true면 `color` 배경.",
    },
    onClick: { action: "clicked", description: "버튼 클릭 핸들러" },
    className: { control: "text", description: "루트 `<button>`에 병합되는 클래스" },
  },
  args: {
    color: "pink",
    isRecording: false,
  },
} satisfies Meta<typeof RecordButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Recording: Story = {
  args: { isRecording: true },
};

export const Colors: Story = {
  parameters: {
    docs: { description: { story: "녹음 중 색 4종(pink·orange·lime·blue) 비교." } },
  },
  render: args => (
    <div className="flex gap-6">
      {COLORS.map(color => (
        <RecordButton key={color} {...args} color={color} isRecording />
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  parameters: {
    docs: { description: { story: "녹음 전(회색 1종) + 녹음 중 색 4종 전체 비교." } },
  },
  render: () => (
    <div className="flex gap-6">
      <RecordButton color="pink" />
      {COLORS.map(color => (
        <RecordButton key={color} color={color} isRecording />
      ))}
    </div>
  ),
};
