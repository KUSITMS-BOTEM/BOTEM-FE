import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import LetterPaper from "@/widgets/letter-paper/LetterPaper";
import SenderNameInput from "@/widgets/letter-paper/SenderNameInput";

const meta = {
  title: "Widgets/LetterPaper/SenderNameInput",
  component: SenderNameInput,
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "편지지 우하단 From 자리에서 보낸 사람 이름을 바로 입력하는 칸. `LetterPaper`의 senderSlot으로 넣는다. 입력 전에는 안내 문구, 입력 중에는 검은 글자가 보이고 8글자까지 쓸 수 있다. Enter나 포커스 해제 시 `onBlur`가 호출된다.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SenderNameInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

function Demo({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);

  return (
    <LetterPaper
      text=""
      senderName={name}
      senderSlot={<SenderNameInput name={name} onNameChange={setName} onBlur={noop} color="lime" />}
    />
  );
}

const args = { name: "", onNameChange: noop, onBlur: noop, color: "lime" as const };

export const Empty: Story = { args, render: () => <Demo initialName="" /> };

export const Typing: Story = { args, render: () => <Demo initialName="김민지" /> };
