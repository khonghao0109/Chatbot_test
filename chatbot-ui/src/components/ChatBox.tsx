import { useEffect, useRef, useState } from "react";
import InputBox from "./InputBox";
import MessageList from "./MessageList";
import { sendMessage, type ChatMessage } from "../services/api";

const USER_ID = "web-user-1";

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    setError("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", text }]);

    try {
      const reply = await sendMessage(USER_ID, text);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setError("Khong the ket noi chatbot. Thu lai sau.");
      setMessages((prev) => [...prev, { role: "bot", text: "Toi dang gap loi ket noi." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chat-box">
      <header>
        <h1>EMS Chatbot</h1>
      </header>

      <div className="chat-body">
        <MessageList messages={messages} loading={loading} />
        <div ref={bottomRef} />
      </div>

      {error && <p className="error-text">{error}</p>}
      <InputBox onSend={handleSend} disabled={loading} />
    </section>
  );
}
