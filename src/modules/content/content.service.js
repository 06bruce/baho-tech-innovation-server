import { CONTENT_TYPES, Content, toPublicContent } from "../../models/content.model.js";

const VALID_TYPES = Object.values(CONTENT_TYPES);

function normalizeSlug(value, fallback) {
  const raw = String(value || fallback || "content")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return raw || `item-${Date.now()}`;
}

function sanitizePayload(payload = {}) {
  const type = payload.type && VALID_TYPES.includes(payload.type) ? payload.type : CONTENT_TYPES.TEAM;
  const title = String(payload.title ?? payload.name ?? "").trim();
  const name = String(payload.name ?? "").trim();
  const slug = normalizeSlug(payload.slug || title || name || payload.name || payload.title, `${type}-item`);

  return {
    type,
    slug,
    title: title || name,
    name: name || title,
    role: String(payload.role ?? "").trim(),
    bio: String(payload.bio ?? "").trim(),
    description: String(payload.description ?? payload.bio ?? "").trim(),
    content: String(payload.content ?? "").trim(),
    image: String(payload.image ?? "").trim(),
    imageAlt: String(payload.imageAlt ?? "").trim(),
    tags: Array.isArray(payload.tags) ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
    link: String(payload.link ?? "").trim(),
    location: String(payload.location ?? "").trim(),
    isPublished: payload.isPublished !== false,
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 0,
    story: Array.isArray(payload.story) ? payload.story.map((item) => String(item).trim()).filter(Boolean) : [],
    metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {},
  };
}

export async function listContentItems({ type, publishedOnly = false } = {}) {
  const query = {};
  if (type) {
    query.type = type;
  }
  if (publishedOnly) {
    query.isPublished = true;
  }

  const rows = await Content.find(query).sort({ type: 1, sortOrder: -1, createdAt: -1 });
  return rows.map(toPublicContent);
}

export async function getContentItem(id) {
  const item = await Content.findById(id);
  return item ? toPublicContent(item) : null;
}

export async function createContentItem(payload) {
  const data = sanitizePayload(payload);
  const item = await Content.create(data);
  return toPublicContent(item);
}

export async function updateContentItem(id, payload) {
  const existing = await Content.findById(id);
  if (!existing) {
    const error = new Error("Content item not found.");
    error.status = 404;
    throw error;
  }

  const next = sanitizePayload({ ...existing.toObject(), ...payload });
  if (!next.slug) {
    next.slug = normalizeSlug(next.title || next.name || existing.slug, `${existing.type}-item`);
  }

  const updated = await Content.findByIdAndUpdate(id, next, { new: true, runValidators: true });
  return toPublicContent(updated);
}

export async function deleteContentItem(id) {
  const item = await Content.findByIdAndDelete(id);
  if (!item) {
    const error = new Error("Content item not found.");
    error.status = 404;
    throw error;
  }
  return toPublicContent(item);
}

export { CONTENT_TYPES };
