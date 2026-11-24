import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import LetterPaper from "@/widgets/letter-paper/LetterPaper";
import LetterWriteBody from "@/widgets/letter-paper/LetterWriteBody";

const meta = {
  title: "Widgets/LetterPaper/LetterWriteBody",
  component: LetterWriteBody,
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "편지지 작성 화면에서 `LetterPaper`의 textSlot으로 들어가는 입력 영역. 편지가 비어 있으면 흐린 안내문이 보이고 입력을 시작하면 사라진다. 110자를 넘으면 글자 크기가 작아진다.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LetterWriteBody>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

function Demo() {
  const [text, setText] = useState("");

  return (
    <LetterPaper
      text={text}
      senderName="민지"
      textSlot={
        <LetterWriteBody text={text} onTextChange={setText} placeholder="지유야 생일 축하해!" />
      }
    />
  );
}

const args = { text: "", onTextChange: noop, placeholder: "지유야 생일 축하해!" };

export const Default: Story = { args, render: () => <Demo /> };
