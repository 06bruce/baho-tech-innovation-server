import { generateGeminiContent } from "../../services/gemini.service.js";
import { isGeminiBusyError, sendGeminiBusyFallback } from "../../services/gemini-fallback.service.js";
import {
  buildAiCommandPrompt,
  buildConversationPrompt,
  buildNavigationPrompt,
  buildScreenReaderPrompt,
} from "../../services/gemini.prompt-builders.js";

function parseJsonResponse(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (_error) {
    return null;
  }
}

export async function navigationHelp(req, res, next) {
  try {
    const language = req.body?.language || req.user?.preferredLanguage || "en";
    const result = await generateGeminiContent({
      prompt: buildNavigationPrompt({
        message: req.body?.message || "Help me use this page.",
        pageContext: req.body?.pageContext,
        user: req.user,
        language,
      }),
    });
    res.json({ ok: true, response: result.text });
  } catch (error) {
    if (isGeminiBusyError(error)) {
      return sendGeminiBusyFallback(res, {
        language: req.body?.language || req.user?.preferredLanguage || "en",
        payload: {
          response: "AI navigation help is temporarily limited. You can still use the page menu, tab through controls, or try again shortly.",
        },
      });
    }
    next(error);
  }
}

export async function screenReaderSummary(req, res, next) {
  try {
    const language = req.body?.language || req.user?.preferredLanguage || "en";
    const result = await generateGeminiContent({
      prompt: buildScreenReaderPrompt({
        pageContext: req.body?.pageContext,
        user: req.user,
        language,
      }),
    });
    res.json({ ok: true, response: result.text });
  } catch (error) {
    if (isGeminiBusyError(error)) {
      return sendGeminiBusyFallback(res, {
        language: req.body?.language || req.user?.preferredLanguage || "en",
        payload: {
          response: "The AI page summary is temporarily unavailable. You can continue with headings, landmarks, and keyboard navigation while the service recovers.",
        },
      });
    }
    next(error);
  }
}

export async function conversation(req, res, next) {
  try {
    const language = req.body?.language || req.user?.preferredLanguage || "en";
    const result = await generateGeminiContent({
      prompt: buildConversationPrompt({
        messages: req.body?.messages || [],
        pageContext: req.body?.pageContext,
        user: req.user,
        language,
      }),
    });
    res.json({ ok: true, response: result.text });
  } catch (error) {
    if (isGeminiBusyError(error)) {
      return sendGeminiBusyFallback(res, {
        language: req.body?.language || req.user?.preferredLanguage || "en",
        payload: {
          response: "I am temporarily overloaded, but the rest of the dashboard is still available. Please try your question again in a moment.",
        },
      });
    }
    next(error);
  }
}

export async function command(req, res, next) {
  try {
    const language = req.body?.language || req.user?.preferredLanguage || "en";
    const result = await generateGeminiContent({
      prompt: buildAiCommandPrompt({
        command: req.body?.command || "",
        pageContext: req.body?.pageContext,
        user: req.user,
        language,
      }),
      temperature: 0.2,
    });
    const parsed = parseJsonResponse(result.text);
    res.json({
      ok: true,
      response: parsed?.response || result.text || "I heard you, but I need a clearer command.",
      actions: Array.isArray(parsed?.actions) ? parsed.actions.slice(0, 3) : [{ type: "none" }],
    });
  } catch (error) {
    if (isGeminiBusyError(error)) {
      return sendGeminiBusyFallback(res, {
        language: req.body?.language || req.user?.preferredLanguage || "en",
        payload: {
          response: "I heard your command, but AI command processing is temporarily busy. Please try again in a moment.",
          actions: [{ type: "none" }],
        },
      });
    }
    next(error);
  }
}
