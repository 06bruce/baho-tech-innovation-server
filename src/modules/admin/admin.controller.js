import { createAdmin, getAdminStats, getUserDetails, listAdmins, listUsers } from "./admin.service.js";

export async function stats(_req, res, next) {
  try {
    res.json({ ok: true, stats: await getAdminStats() });
  } catch (error) {
    next(error);
  }
}

export async function users(req, res, next) {
  try {
    res.json({
      ok: true,
      users: await listUsers({
        search: req.query.search,
        disability: req.query.disability,
      }),
    });
  } catch (error) {
    next(error);
  }
}

export async function userDetails(req, res, next) {
  try {
    res.json({ ok: true, ...(await getUserDetails(req.params.id)) });
  } catch (error) {
    next(error);
  }
}

export async function admins(req, res, next) {
  try {
    res.json({
      ok: true,
      admins: await listAdmins({ search: req.query.search }),
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminAccount(req, res, next) {
  try {
    const admin = await createAdmin({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
      status: req.body.status,
    });

    res.status(201).json({ ok: true, admin });
  } catch (error) {
    next(error);
  }
}