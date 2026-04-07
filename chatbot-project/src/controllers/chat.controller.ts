import { Request, Response } from "express";
import { handleChat } from "../services/chat.service";

type ChatBody = {
  userId?: string;
  message?: string;
};

export const chatController = async (
  req: Request<unknown, unknown, ChatBody>,
  res: Response
) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({
      message: "userId and message are required",
    });
  }

  try {
    const reply = await handleChat(userId, message);
    return res.json({ reply });
  } catch (error) {
    console.error("Chat processing failed:", error);
    return res.status(500).json({
      message: "Chat processing failed",
    });
  }
};
