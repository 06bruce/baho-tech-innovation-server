import { isGeminiBusyError, sendGeminiBusyFallback } from "../../services/gemini-fallback.service.js";
import { buildTranslationPrompt, buildWritingPrompt } from "../../services/gemini.prompt-builders.js";
import { generateGeminiContent } from "../../services/gemini.service.js";

export async function assistWriting(req, res, next) {
  try {
    const input = String(req.body?.input || "");
    const result = await generateGeminiContent({
      prompt: buildWritingPrompt({
        input,
        mode: req.body?.mode || "expand",
        language: req.body?.language || req.user?.preferredLanguage || "en",
      }),
    });
    res.json({ ok: true, output: result.text });
  } catch (error) {
    if (isGeminiBusyError(error)) {
      return sendGeminiBusyFallback(res, {
        language: req.body?.language || req.user?.preferredLanguage || "en",
        payload: {
          output: String(req.body?.input || ""),
        },
      });
    }
    next(error);
  }
}

export async function translateWriting(req, res, next) {
  try {
    const text = String(req.body?.text || "");
    const result = await generateGeminiContent({
      prompt: buildTranslationPrompt({
        text,
        targetLanguage: req.body?.targetLanguage || req.user?.preferredLanguage || "en",
      }),
    });
    res.json({ ok: true, output: result.text });
  } catch (error) {
    if (isGeminiBusyError(error)) {
      return sendGeminiBusyFallback(res, {
        language: req.body?.targetLanguage || req.user?.preferredLanguage || "en",
        payload: {
          output: String(req.body?.text || ""),
        },
      });
    }
    next(error);
  }
}
