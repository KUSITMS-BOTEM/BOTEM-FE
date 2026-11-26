import ListText from "@/components/ListText";

type AmountOptionRadioProps = {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
};

export default function AmountOptionRadio({
  name,
  checked,
  onChange,
  title,
  description,
}: AmountOptionRadioProps) {
  return (
    <label className="border-semantic-border-weak has-checked:border-semantic-border-strong has-checked:bg-semantic-fill-neutral-weak has-focus-visible:ring-semantic-border-strong flex min-h-[82px] w-full cursor-pointer items-center rounded-2xl border px-3 py-4 has-checked:border-2 has-checked:px-[11px] has-checked:py-[15px] has-focus-visible:ring-2 has-focus-visible:ring-offset-2">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <ListText title={title} description={description} className="w-full" />
    </label>
  );
}
