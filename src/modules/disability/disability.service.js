import { USER_ROLES } from "../../models/user.model.js";
import { normalizeDisabilityCategory } from "../../utils/normalizers.js";

const dashboardPaths = {
  blind: "/dashboard/blind",
  deaf: "/dashboard/deaf",
  mute: "/dashboard/mute",
  mobility: "/dashboard/mobility",
};

const services = {
  blind: ["screen-reader-support", "smart-blind-stick"],
  deaf: ["voice-to-text"],
  mute: ["text-to-speech"],
  mobility: ["coming-soon"],
};

export function getDashboardAccessForUser(user) {
  if (user.role === USER_ROLES.ADMIN) {
    return {
      role: USER_ROLES.ADMIN,
      dashboardPath: "/admin/dashboard",
      allowedDisabilityCategory: null,
      services: ["admin"],
    };
  }

  const category = normalizeDisabilityCategory(user.disabilityCategory || user.disability_category);

  return {
    role: USER_ROLES.USER,
    dashboardPath: dashboardPaths[category] || "/dashboard",
    allowedDisabilityCategory: category,
    services: services[category] || [],
  };
}
