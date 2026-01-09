import { readFileSync, writeFileSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";

const commitMsgFile = process.argv[2];

if (!commitMsgFile) {
  console.error("Error: Commit message file not provided");
  process.exit(1);
}

console.log(commitMsgFile);

try {
  const commitMessage = readFileSync(commitMsgFile, "utf-8").trim();

  if (!commitMessage) {
    console.log("Empty commit message, skipping translation");
    process.exit(0);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is not configured");
    console.error("Set it in your .env file");
    console.error("Get your API key at: https://aistudio.google.com/apikey");
    process.exit(1);
  }
  const ai = new GoogleGenAI({ apiKey });
  const translationPrompt = `
Translate the following commit message into English and ensure it follows the Conventional Commits standard: "${commitMessage}"

Strict Rules:
1. Return ONLY the final translated and formatted message.
2. Ensure the format is: <type>(<scope>): <description> (scope is optional).
3. Use standard types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
4. If the original message lacks a semantic tag, analyze the content and prepend the correct one.
5. Do not include any feedback, explanations, or quotes in the response.
6. The <description> MUST be entirely in lowercase.
7. The <description> MUST be less than 50 characters.

Final Message:`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: translationPrompt,
  });

  const translatedMessage = response.text?.trim();

  if (!translatedMessage) {
    console.log("No translation received, keeping original message");
    process.exit(0);
  }

  writeFileSync(commitMsgFile, `${translatedMessage}\n`);
  process.exit(0);
} catch (error) {
  console.error("Error during translation:", error);
  console.log("Proceeding with original message");
  process.exit(0);
}
