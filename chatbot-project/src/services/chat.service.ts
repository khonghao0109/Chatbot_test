import { Chat } from "../models/chat.model";
import { Knowledge } from "../models/knowledge.model";

const FALLBACK_REPLY = "Toi chua co thong tin";
const MAX_HISTORY_MESSAGES = 50;

const normalizeVietnamese = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D");
};

const tokenize = (value: string, removeDiacritics = false): string[] => {
  const normalized = removeDiacritics ? normalizeVietnamese(value) : value;
  return normalized
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
};

const scoreKnowledgeMatch = (
  knowledgeKeywords: unknown,
  normalizedTokenSet: Set<string>
): number => {
  if (!Array.isArray(knowledgeKeywords)) {
    return 0;
  }

  return knowledgeKeywords.reduce((score, keyword) => {
    if (typeof keyword !== "string") {
      return score;
    }

    const normalizedKeyword = normalizeVietnamese(keyword).toLowerCase();
    return normalizedTokenSet.has(normalizedKeyword) ? score + 1 : score;
  }, 0);
};

type AnswerCandidate = {
  answer: string;
  score: number;
};

const findBestKeywordMatch = async (
  queryTokens: string[],
  normalizedTokenSet: Set<string>
): Promise<AnswerCandidate | null> => {
  const candidates = await Knowledge.find(
    { keywords: { $in: queryTokens } },
    { answer: 1, keywords: 1 }
  ).lean();

  let best: AnswerCandidate | null = null;

  for (const candidate of candidates) {
    if (typeof candidate.answer !== "string") {
      continue;
    }

    const score = scoreKnowledgeMatch(candidate.keywords, normalizedTokenSet);
    if (!best || score > best.score) {
      best = { answer: candidate.answer, score };
    }
  }

  return best;
};

type TextSearchCandidate = {
  answer?: unknown;
  score?: number;
};

const findBestTextMatch = async (message: string): Promise<AnswerCandidate | null> => {
  try {
    const textCandidates = (await Knowledge.find(
      { $text: { $search: message } },
      {
        answer: 1,
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5)
      .lean()) as TextSearchCandidate[];

    if (textCandidates.length === 0) {
      return null;
    }

    const top = textCandidates[0];
    if (!top || typeof top.answer !== "string") {
      return null;
    }

    return { answer: top.answer, score: top.score ?? 0 };
  } catch (error) {
    // If text index is not available yet, fallback to keyword path.
    console.warn("Text search unavailable:", error);
    return null;
  }
};

const saveConversation = async (
  userId: string,
  userMessage: string,
  botReply: string
): Promise<void> => {
  await Chat.findOneAndUpdate(
    { userId },
    {
      $push: {
        messages: {
          $each: [
            { role: "user", text: userMessage },
            { role: "bot", text: botReply },
          ],
          $slice: -MAX_HISTORY_MESSAGES,
        },
      },
    },
    {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};

export const handleChat = async (
  userId: string,
  message: string
): Promise<string> => {
  const rawTokens = tokenize(message);
  const normalizedTokens = tokenize(message, true);
  const queryTokens = [...new Set([...rawTokens, ...normalizedTokens])];

  if (queryTokens.length === 0) {
    await saveConversation(userId, message, FALLBACK_REPLY);
    return FALLBACK_REPLY;
  }

  const normalizedTokenSet = new Set(normalizedTokens);
  const [keywordMatch, textMatch] = await Promise.all([
    findBestKeywordMatch(queryTokens, normalizedTokenSet),
    findBestTextMatch(message),
  ]);

  const keywordScoreNormalized = keywordMatch
    ? keywordMatch.score / Math.max(normalizedTokenSet.size, 1)
    : 0;
  const textScoreNormalized = textMatch
    ? Math.min(textMatch.score / 10, 1)
    : 0;

  let bestAnswer = FALLBACK_REPLY;
  if (keywordScoreNormalized === 0 && textMatch) {
    bestAnswer = textMatch.answer;
  } else if (textScoreNormalized > keywordScoreNormalized && textMatch) {
    bestAnswer = textMatch.answer;
  } else if (keywordMatch) {
    bestAnswer = keywordMatch.answer;
  }

  await saveConversation(userId, message, bestAnswer);
  return bestAnswer;
};
