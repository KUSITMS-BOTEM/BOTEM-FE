import { createContext, type ReactNode, useContext } from "react";

// jsdom에서는 휠 스크롤·드래그를 흉내 낼 수 없어, 아이템을 누르면 그 값이 선택되는 버튼으로 대체한다
type Values = Record<string, string>;

const PickerContext = createContext<{ value: Values; onChange: (value: Values) => void }>({
  value: {},
  onChange: () => {},
});
const ColumnContext = createContext("");

export default function Picker({
  value,
  onChange,
  children,
}: {
  value: Values;
  onChange: (value: Values) => void;
  children: ReactNode;
}) {
  return (
    <PickerContext.Provider value={{ value, onChange }}>
      <div>{children}</div>
    </PickerContext.Provider>
  );
}

Picker.Column = function Column({ name, children }: { name: string; children: ReactNode }) {
  return (
    <ColumnContext.Provider value={name}>
      <div>{children}</div>
    </ColumnContext.Provider>
  );
};

Picker.Item = function Item({
  value,
  children,
}: {
  value: string;
  children: ReactNode | ((state: { selected: boolean }) => ReactNode);
}) {
  const { value: current, onChange } = useContext(PickerContext);
  const name = useContext(ColumnContext);
  const selected = current[name] === value;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onChange({ ...current, [name]: value })}>
      {typeof children === "function" ? children({ selected }) : children}
    </button>
  );
};
