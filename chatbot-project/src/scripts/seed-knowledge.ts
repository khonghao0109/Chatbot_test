import dotenv from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Knowledge } from "../models/knowledge.model";

type KnowledgeSeedItem = {
  question: string;
  answer: string;
  keywords: string[];
};

const loadSeedData = async (): Promise<KnowledgeSeedItem[]> => {
  const filePath = path.resolve(__dirname, "../../data/knowledge.json");
  const fileContent = await readFile(filePath, "utf8");
  const parsed = JSON.parse(fileContent) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("data/knowledge.json must be an array");
  }

  return parsed.filter(
    (item): item is KnowledgeSeedItem =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as KnowledgeSeedItem).question === "string" &&
      typeof (item as KnowledgeSeedItem).answer === "string" &&
      Array.isArray((item as KnowledgeSeedItem).keywords)
  );
};

const seedKnowledge = async (): Promise<void> => {
  dotenv.config();
  await connectDB();

  const items = await loadSeedData();
  if (items.length === 0) {
    console.log("No valid knowledge items found. Nothing to seed.");
    return;
  }

  const operations = items.map((item) => ({
    updateOne: {
      filter: { question: item.question },
      update: {
        $set: {
          answer: item.answer,
          keywords: item.keywords,
        },
      },
      upsert: true,
    },
  }));

  const result = await Knowledge.bulkWrite(operations);
  console.log(
    `Seed completed. upserted=${result.upsertedCount}, modified=${result.modifiedCount}, matched=${result.matchedCount}`
  );
};

void seedKnowledge()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
