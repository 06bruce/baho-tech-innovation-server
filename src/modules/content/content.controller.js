import {
  createContentItem,
  deleteContentItem,
  getContentItem,
  listContentItems,
  updateContentItem,
} from "./content.service.js";

export async function getPublicContent(req, res, next) {
  try {
    const type = String(req.params.type || "").trim();
    const items = await listContentItems({ type, publishedOnly: true });
    return res.json({ ok: true, items });
  } catch (error) {
    return next(error);
  }
}

export async function listAdminContent(_req, res, next) {
  try {
    const items = await listContentItems();
    return res.json({ ok: true, items });
  } catch (error) {
    return next(error);
  }
}

export async function createAdminContent(req, res, next) {
  try {
    const item = await createContentItem(req.body);
    return res.status(201).json({ ok: true, item });
  } catch (error) {
    return next(error);
  }
}

export async function updateAdminContent(req, res, next) {
  try {
    const item = await updateContentItem(req.params.id, req.body);
    return res.json({ ok: true, item });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAdminContent(req, res, next) {
  try {
    await deleteContentItem(req.params.id);
    return res.json({ ok: true, message: "Content deleted successfully." });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminContentById(req, res, next) {
  try {
    const item = await getContentItem(req.params.id);
    if (!item) {
      const error = new Error("Content item not found.");
      error.status = 404;
      throw error;
    }
    return res.json({ ok: true, item });
  } catch (error) {
    return next(error);
  }
}
