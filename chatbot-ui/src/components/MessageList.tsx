import type { ChatMessage } from "../services/api";

type MessageListProps = {
  messages: ChatMessage[];
  loading: boolean;
};

export default function MessageList({ messages, loading }: MessageListProps) {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={`message-row ${message.role === "user" ? "right" : "left"}`}
        >
          <div className={`message-bubble ${message.role}`}>{message.text}</div>
        </div>
      ))}
      {loading && (
        <div className="message-row left">
          <div className="message-bubble bot">Dang tra loi...</div>
        </div>
      )}
    </div>
  );
}
