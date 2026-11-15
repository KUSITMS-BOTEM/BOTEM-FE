import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import LetterTool from "@/widgets/letter-paper/LetterTool";

const COLORS = ["pink", "orange", "lime", "blue"] as const;
const TYPES = ["record", "sticker", "photo", "letter"] as const;

const meta = {
  title: "Widgets/LetterPaper/LetterTool",
  component: LetterTool,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "편지지 작성 페이지의 도구 버튼. 녹음·스티커·사진 추가·편지지 4종이며, 편지지 색(`color`)에 따라 아이콘 테두리 색이 바뀐다. 라벨은 항상 검정이고, 타입마다 Figma 디자인의 기울기가 적용돼 있다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "inline-radio",
      options: TYPES,
      description: "도구 종류. 아이콘·라벨·기울기가 타입별로 정해진다.",
    },
    color: {
      control: "inline-radio",
      options: COLORS,
      description: "편지지 색. 아이콘 테두리 색(`--color-base-{color}-500`)에 반영된다.",
    },
    onClick: { action: "clicked", description: "버튼 클릭 핸들러" },
    className: { control: "text", description: "루트 `<button>`에 병합되는 클래스" },
  },
  args: {
    type: "record",
    color: "pink",
  },
} satisfies Meta<typeof LetterTool>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Types: Story = {
  parameters: {
    docs: { description: { story: "도구 4종(녹음·스티커·사진 추가·편지지)을 같은 색으로 비교." } },
  },
  render: args => (
    <div className="flex gap-6">
      {TYPES.map(type => (
        <LetterTool key={type} {...args} type={type} />
      ))}
    </div>
  ),
};

export const Colors: Story = {
  parameters: {
    docs: { description: { story: "편지지 색 4종(pink·orange·lime·blue)을 같은 도구로 비교." } },
  },
  render: args => (
    <div className="flex gap-6">
      {COLORS.map(color => (
        <LetterTool key={color} {...args} color={color} />
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  parameters: {
    docs: { description: { story: "색 4종 × 도구 4종 전체 조합(Figma 16개 variant)." } },
  },
  render: () => (
    <div className="grid grid-cols-4 gap-6">
      {COLORS.flatMap(color =>
        TYPES.map(type => <LetterTool key={`${color}-${type}`} type={type} color={color} />),
      )}
    </div>
  ),
};
