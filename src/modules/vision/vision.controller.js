import { isGeminiBusyError, sendGeminiBusyFallback } from "../../services/gemini-fallback.service.js";
import { buildVisionPrompt } from "../../services/gemini.prompt-builders.js";
import { generateGeminiContent } from "../../services/gemini.service.js";

export async function analyzeVision(req, res, next) {
  try {
    const { imageBase64, mimeType, task, language } = req.body || {};
    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ ok: false, error: "imageBase64 and mimeType are required." });
    }

    const result = await generateGeminiContent({
      prompt: buildVisionPrompt({ task, language: language || req.user?.preferredLanguage || "en" }),
      inlineData: { mimeType, data: imageBase64 },
    });
    res.json({ ok: true, description: result.text });
  } catch (error) {
    if (isGeminiBusyError(error)) {
      return sendGeminiBusyFallback(res, {
        language: req.body?.language || req.user?.preferredLanguage || "en",
        payload: {
          description: "Vision analysis is temporarily unavailable because the AI service is busy. Please try capturing the image again in a moment.",
        },
      });
    }
    next(error);
  }
}
