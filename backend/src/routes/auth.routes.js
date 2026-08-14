import { Router } from "express";
import { createAuthToken } from "../lib/auth.js";
import { verifyPassword } from "../lib/passwords.js";
import { findUserByEmail, sanitizeUserForResponse } from "../lib/usersStore.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", async (request, response, next) => {
  try {
    const email = String(request.body.email || "").trim().toLowerCase();
    const password = String(request.body.password || "");

    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    response.json({
      ok: true,
      token: createAuthToken(user),
      user: sanitizeUserForResponse(user),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (request, response) => {
  response.json({
    ok: true,
    user: request.auth,
  });
});
