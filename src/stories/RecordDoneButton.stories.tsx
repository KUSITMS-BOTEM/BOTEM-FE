import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import RecordDoneButton from "@/widgets/letter-paper/RecordDoneButton";

const COLORS = ["pink", "orange", "lime", "blue"] as const;

const meta = {
  title: "Widgets/LetterPaper/RecordDoneButton",
  component: RecordDoneButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "녹음을 마친 뒤 보여주는 알약 버튼. 문구(`text`)는 props로 받고 오른쪽에 체크 아이콘이 붙는다. 편지지 색(`color`)에 따라 배경이 바뀌며, lime만 밝은 면이라 글자가 검정이다. 너비는 텍스트에 맞춰 가변이다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text", description: "버튼에 표시할 문구" },
    color: {
      control: "inline-radio",
      options: COLORS,
      description: "편지지 색. 배경은 `--color-semantic-fill-*` 토큰(orange는 brand)에 반영된다.",
    },
    onClick: { action: "clicked", description: "버튼 클릭 핸들러" },
    className: { control: "text", description: "루트 `<button>`에 병합되는 클래스" },
  },
  args: {
    text: "녹음 완료",
    color: "pink",
  },
} satisfies Meta<typeof RecordDoneButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Colors: Story = {
  parameters: {
    docs: { description: { story: "편지지 색 4종(pink·orange·lime·blue)을 같은 문구로 비교." } },
  },
  render: args => (
    <div className="flex gap-4">
      {COLORS.map(color => (
        <RecordDoneButton key={color} {...args} color={color} />
      ))}
    </div>
  ),
};

export const LongText: Story = {
  parameters: {
    docs: { description: { story: "문구가 길어지면 너비가 함께 늘어난다(줄바꿈 없음)." } },
  },
  args: { text: "녹음이 완료되었어요" },
};
