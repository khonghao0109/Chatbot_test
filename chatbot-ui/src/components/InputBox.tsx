import { useState } from "react";
import type { FormEvent } from "react";

type InputBoxProps = {
  disabled?: boolean;
  onSend: (text: string) => Promise<void>;
};

export default function InputBox({ disabled = false, onSend }: InputBoxProps) {
  const [text, setText] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) {
      return;
    }

    await onSend(trimmed);
    setText("");
  };

  return (
    <form className="input-box" onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Nhap cau hoi..."
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || text.trim().length === 0}>
        Send
      </button>
    </form>
  );
}
