import { normalizeDisabilityCategory } from "../../utils/normalizers.js";

export function requireDisability(category) {
  return (req, res, next) => {
    const expectedCategory = normalizeDisabilityCategory(category);
    const userCategory = normalizeDisabilityCategory(req.user?.disabilityCategory || req.user?.disability_category);

    if (!expectedCategory || userCategory !== expectedCategory) {
      return res.status(403).json({ ok: false, error: "This disability solution is not available for your profile." });
    }

    return next();
  };
}
