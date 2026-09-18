import { SUPPORTED_LANGUAGES } from "../../models/user.model.js";
import { isGeminiBusyError, sendGeminiBusyFallback } from "../../services/gemini-fallback.service.js";
import { buildTranslationPrompt } from "../../services/gemini.prompt-builders.js";
import { generateGeminiContent } from "../../services/gemini.service.js";

export function languageOptions(_req, res) {
  res.json({ ok: true, languages: SUPPORTED_LANGUAGES });
}

export async function translateDynamicContent(req, res, next) {
  try {
    const text = String(req.body?.text || "").trim();
    const language = req.body?.targetLanguage || req.user?.preferredLanguage || "en";
    if (!text) {
      return res.status(400).json({ ok: false, error: "text is required." });
    }
    if (text.length > 1200) {
      return res.status(400).json({ ok: false, error: "Text is too long to translate in one request." });
    }

    const result = await generateGeminiContent({
      prompt: buildTranslationPrompt({
        text,
        targetLanguage: language,
      }),
    });

    res.json({ ok: true, output: result.text });
  } catch (error) {
    if (isGeminiBusyError(error)) {
      return sendGeminiBusyFallback(res, {
        language: req.body?.targetLanguage || req.user?.preferredLanguage || "en",
        payload: {
          output: String(req.body?.text || "").trim(),
        },
      });
    }
    next(error);
  }
}
