import mongoose from "mongoose";

const knowledgeSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  keywords: [
    {
      type: String,
      trim: true,
    },
  ],
}, { timestamps: true });

knowledgeSchema.index({ keywords: 1 }, { name: "knowledge_keywords_idx" });

knowledgeSchema.index(
  { question: "text", answer: "text" },
  { weights: { question: 5, answer: 2 }, name: "knowledge_text_search_idx" }
);

export const Knowledge = mongoose.model("Knowledge", knowledgeSchema);
