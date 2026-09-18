import { buildAudioTranscriptionPrompt, buildTtsOptimizationPrompt } from "../../services/gemini.prompt-builders.js";
import { isGeminiBusyError, sendGeminiBusyFallback } from "../../services/gemini-fallback.service.js";
import { generateGeminiContent } from "../../services/gemini.service.js";

export function capabilities(_req, res) {
  res.json({
    ok: true,
    provider: "baho-gemini-audio-transcription",
    textToSpeech: {
      mode: "client",
      languages: ["en", "rw", "fr", "sw"],
      notes: "Uses SpeechSynthesis in supported browsers. Voice availability depends on the user's device.",
    },
    speechToText: {
      mode: "server",
      languages: ["en", "rw", "fr", "sw"],
      notes: "Records microphone audio in the app and transcribes it through the Baho Tech backend.",
    },
  });
}

export async function transcribeAudio(req, res, next) {
  try {
    const { audioBase64, mimeType, language } = req.body || {};
    if (!audioBase64 || !mimeType) {
      return res.status(400).json({ ok: false, error: "audioBase64 and mimeType are required." });
    }

    const result = await generateGeminiContent({
      prompt: buildAudioTranscriptionPrompt({ language: language || req.user?.preferredLanguage || "en" }),
      inlineData: { mimeType, data: audioBase64 },
    });

    res.json({ ok: true, transcript: result.text });
  } catch (error) {
    if (isGeminiBusyError(error)) {
      return sendGeminiBusyFallback(res, {
        language: req.body?.language || req.user?.preferredLanguage || "en",
        payload: {
          transcript: "Audio transcription is temporarily unavailable because the AI service is busy. Please try recording again shortly.",
        },
      });
    }
    next(error);
  }
}

export async function optimizeTextForSpeech(req, res, next) {
  try {
    const text = String(req.body?.text || "");
    const result = await generateGeminiContent({
      prompt: buildTtsOptimizationPrompt({
        text,
        language: req.body?.language || req.user?.preferredLanguage || "en",
      }),
    });

    res.json({ ok: true, text: result.text });
  } catch (error) {
    if (isGeminiBusyError(error)) {
      return sendGeminiBusyFallback(res, {
        language: req.body?.language || req.user?.preferredLanguage || "en",
        payload: {
          text: String(req.body?.text || ""),
        },
      });
    }
    next(error);
  }
}
