export type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

const API_URL = "https://chatbot-test-wjat.onrender.com/chat";

export const sendMessage = async (
  userId: string,
  message: string
): Promise<string> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, message }),
  });

  if (!response.ok) {
    throw new Error(`Chat API failed with status ${response.status}`);
  }

  const data = (await response.json()) as { reply?: string };
  return data.reply ?? "Toi chua co thong tin";
};
