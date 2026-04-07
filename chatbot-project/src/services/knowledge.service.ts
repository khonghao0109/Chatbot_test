import { Knowledge } from "../models/knowledge.model";

export const createTestKnowledge = async () => {
  return Knowledge.create({
    question: "gio mo cua",
    answer: "Shop mo cua tu 8h den 22h",
    keywords: ["gio", "mo", "cua"],
  });
};
