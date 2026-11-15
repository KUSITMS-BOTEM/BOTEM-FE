import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import NameChip from "@/widgets/letter-paper/NameChip";

const COLORS = ["orange", "lime", "pink", "blue"] as const;

const meta = {
  title: "Widgets/LetterPaper/NameChip",
  component: NameChip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "편지지에서 이름을 보여주는 알약 칩. 클릭 동작이 없는 정적 표시용이다. 편지지 색(`color`)에 따라 약한 배경 + 진한 글자색이 바뀌며, lime만 진한 면 + 검정 글자다. 너비는 텍스트에 맞춰 가변이다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    name: { control: "text", description: "칩에 표시할 이름" },
    color: {
      control: "inline-radio",
      options: COLORS,
      description: "편지지 색. 기본값은 `orange`.",
    },
    className: { control: "text", description: "루트 `<span>`에 병합되는 클래스" },
  },
  args: {
    name: "이름",
    color: "orange",
  },
} satisfies Meta<typeof NameChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Colors: Story = {
  parameters: {
    docs: { description: { story: "편지지 색 4종(orange·lime·pink·blue)을 같은 이름으로 비교." } },
  },
  render: args => (
    <div className="flex gap-4">
      {COLORS.map(color => (
        <NameChip key={color} {...args} color={color} />
      ))}
    </div>
  ),
};

export const LongName: Story = {
  parameters: {
    docs: { description: { story: "이름이 길어지면 너비가 함께 늘어난다(줄바꿈 없음)." } },
  },
  args: { name: "김보탬보탬보탬" },
};
