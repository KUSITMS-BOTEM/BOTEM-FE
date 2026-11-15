import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { cn } from "@/utils/cn";
import PaletteArea from "@/widgets/letter-paper/PaletteArea";
import type { Color } from "@/constants/color";

const COLORS = ["orange", "lime", "pink", "blue"] as const;

const meta = {
  title: "Widgets/LetterPaper/PaletteArea",
  component: PaletteArea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "편지지 작성 페이지 하단의 색상 선택 영역. 왼쪽에 색 스와치 4종(orange·lime·pink·blue)이 있고, 선택된 색에는 링이 붙는다. 오른쪽에는 나만의 편지를 만드는 플러스 버튼이 있으며, 그 위에 안내 툴팁을 띄울 수 있다. 루트가 `w-full`이라 부모 너비를 꽉 채운다(Figma 기준 360px은 모바일 화면 폭일 뿐 고정값이 아니다). 툴팁은 영역 위로 튀어나오므로 부모에서 잘리지 않아야 한다.",
      },
    },
  },
  decorators: [
    (Story, { parameters }) => (
      <div className={cn("pt-12", parameters.wide ? "w-[600px]" : "w-[360px]")}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "inline-radio",
      options: COLORS,
      description: "선택된 색. 해당 스와치에 링(`--color-base-{color}-900`)이 붙는다.",
    },
    onColorChange: {
      action: "colorChanged",
      description: "스와치 클릭 핸들러(선택한 색을 인자로 받음)",
    },
    onAddClick: { action: "addClicked", description: "플러스 버튼 클릭 핸들러" },
    tooltip: { control: "boolean", description: "플러스 버튼 위 안내 툴팁 노출 여부(기본 true)" },
    className: { control: "text", description: "루트 `<div>`에 병합되는 클래스" },
  },
  args: {
    color: "lime",
    tooltip: true,
  },
} satisfies Meta<typeof PaletteArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function InteractiveDemo() {
  const [color, setColor] = useState<Color>("orange");
  return <PaletteArea color={color} onColorChange={setColor} />;
}

export const Interactive: Story = {
  parameters: {
    docs: { description: { story: "스와치를 눌러 선택 색(링)이 바뀌는 동작 확인용." } },
  },
  render: () => <InteractiveDemo />,
};

export const Colors: Story = {
  parameters: {
    docs: { description: { story: "선택 색 4종(orange·lime·pink·blue)을 비교. 툴팁은 숨긴다." } },
  },
  render: args => (
    <div className="flex flex-col">
      {COLORS.map(color => (
        <PaletteArea key={color} {...args} color={color} tooltip={false} />
      ))}
    </div>
  ),
};

export const WithoutTooltip: Story = {
  parameters: {
    docs: { description: { story: "`tooltip={false}`. 툴팁 없이 스와치와 플러스 버튼만 보인다." } },
  },
  args: { tooltip: false },
};

export const FullWidth: Story = {
  parameters: {
    wide: true,
    docs: {
      description: {
        story:
          "부모 너비가 360px보다 넓어도 꽉 채운다. 스와치는 왼쪽, 플러스 버튼과 툴팁은 오른쪽 끝에 붙는다.",
      },
    },
  },
};
