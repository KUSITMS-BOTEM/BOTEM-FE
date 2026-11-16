import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import LetterToolSheet from "@/widgets/letter-paper/LetterToolSheet";

const meta = {
  title: "Widgets/LetterPaper/LetterToolSheet",
  component: LetterToolSheet,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "편지지 작성 시트에서 팔레트의 플러스 버튼을 누르면 하단에 겹쳐 뜨는 툴 선택 영역. 녹음·스티커·사진 추가·편지지 4종이 기울어진 채 놓이고, X 버튼으로 닫는다. 부모 기준 `absolute inset-x-0 bottom-0`이라 `relative`인 컨테이너 안에서 써야 한다.",
      },
    },
  },
  decorators: [
    Story => (
      <div className="bg-semantic-background-default relative h-[240px] w-[360px]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    onClose: { action: "closed", description: "X 버튼 클릭 핸들러" },
  },
} satisfies Meta<typeof LetterToolSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { onClose: () => {} } };
