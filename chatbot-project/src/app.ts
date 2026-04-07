import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db";
import chatRouter from "./routes/chat.routes";
import knowledgeRouter from "./routes/knowledge.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(chatRouter);
app.use(knowledgeRouter);

app.get("/", (_req, res) => {
  res.send("Server is running");
});

const startServer = async (): Promise<void> => {
  await connectDB();
  const port = Number(process.env.PORT) || 3000;

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

void startServer();
