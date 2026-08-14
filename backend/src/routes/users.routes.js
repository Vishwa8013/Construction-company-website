import { Router } from "express";
import { createUser, deleteUser, listSafeUsers, updateUser } from "../lib/usersStore.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.use(requireRole("admin"));

usersRouter.get("/", async (_request, response, next) => {
  try {
    response.json({
      ok: true,
      items: await listSafeUsers(),
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/", async (request, response, next) => {
  try {
    const name = String(request.body.name || "").trim();
    const email = String(request.body.email || "").trim().toLowerCase();
    const role = String(request.body.role || "member").trim();
    const password = String(request.body.password || "");

    if (!name || !email || !password) {
      const error = new Error("Name, email, and password are required");
      error.statusCode = 400;
      throw error;
    }

    if (!["admin", "member"].includes(role)) {
      const error = new Error("Role must be admin or member");
      error.statusCode = 400;
      throw error;
    }

    const user = await createUser({ name, email, role, password });
    response.status(201).json({ ok: true, item: user });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch("/:id", async (request, response, next) => {
  try {
    const updates = {
      name: request.body.name ? String(request.body.name).trim() : undefined,
      email: request.body.email ? String(request.body.email).trim() : undefined,
      role: request.body.role ? String(request.body.role).trim() : undefined,
      password: request.body.password ? String(request.body.password) : undefined,
    };

    if (updates.role && !["admin", "member"].includes(updates.role)) {
      const error = new Error("Role must be admin or member");
      error.statusCode = 400;
      throw error;
    }

    const user = await updateUser(request.params.id, updates);
    if (!user) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      throw error;
    }

    response.json({ ok: true, item: user });
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:id", async (request, response, next) => {
  try {
    if (request.auth?.id === request.params.id) {
      const error = new Error("You cannot delete the account you are currently using");
      error.statusCode = 400;
      throw error;
    }

    const user = await deleteUser(request.params.id);
    if (!user) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      throw error;
    }

    response.json({ ok: true, item: user });
  } catch (error) {
    next(error);
  }
});
