import mongoose from "mongoose";

export const CONTENT_TYPES = Object.freeze({
  team: "team",
  project: "project",
  news: "news",
  TEAM: "team",
  PROJECT: "project",
  NEWS: "news",
});

const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(CONTENT_TYPES),
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    content: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    imageAlt: {
      type: String,
      default: "",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    story: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "content",
  }
);

contentSchema.index({ type: 1, sortOrder: -1, createdAt: -1 });
contentSchema.index({ type: 1, slug: 1 }, { unique: true });

export const Content = mongoose.models.Content || mongoose.model("Content", contentSchema);

export function toPublicContent(item) {
  if (!item) return null;

  return {
    id: item._id ? String(item._id) : item.id,
    type: item.type,
    slug: item.slug,
    title: item.title || "",
    name: item.name || "",
    role: item.role || "",
    bio: item.bio || "",
    description: item.description || "",
    content: item.content || "",
    image: item.image || "",
    imageAlt: item.imageAlt || "",
    tags: item.tags || [],
    link: item.link || "",
    location: item.location || "",
    isPublished: item.isPublished ?? true,
    sortOrder: item.sortOrder ?? 0,
    story: item.story || [],
    metadata: item.metadata || {},
    createdAt: item.createdAt ?? null,
    updatedAt: item.updatedAt ?? null,
  };
}
