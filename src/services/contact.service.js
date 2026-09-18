import { env } from "../config/env.js";
import { Message } from "../models/message.model.js";
import { createTransporter } from "./mail.service.js";

export async function submitContactMessage({ name, email, subject, message }) {
  if (!name || !email || !subject || !message) {
    const error = new Error("Missing required fields.");
    error.status = 400;
    throw error;
  }

  const doc = await Message.create({ name, email, subject, message });
  const messageId = String(doc._id);

  const transporter = createTransporter();

  if (!transporter) {
    return {
      ok: false,
      status: 500,
      payload: {
        ok: false,
        error: "Email transport is not configured. Message stored in database.",
        messageId,
      },
    };
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to: env.smtp.to,
    subject: `[Contact] ${subject}`,
    replyTo: email,
    text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
  });

  return { ok: true, status: 200, payload: { ok: true, messageId } };
}