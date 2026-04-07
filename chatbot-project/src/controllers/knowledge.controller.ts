import { Request, Response } from "express";
import { createTestKnowledge } from "../services/knowledge.service";

export const testDbController = async (_req: Request, res: Response) => {
  try {
    const data = await createTestKnowledge();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: "Insert failed", error });
  }
};
