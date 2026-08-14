import { verifyAuthToken } from "../lib/auth.js";
import { findUserById, sanitizeUserForResponse } from "../lib/usersStore.js";

export async function requireAuth(request, _response, next) {
  try {
    const authorization = request.headers.authorization || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

    if (!token) {
      const error = new Error("Authorization token is required");
      error.statusCode = 401;
      throw error;
    }

    const payload = verifyAuthToken(token);
    const user = await findUserById(payload.sub);

    if (!user) {
      const error = new Error("User account was not found");
      error.statusCode = 401;
      throw error;
    }

    request.auth = sanitizeUserForResponse(user);
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
}

export function requireRole(...roles) {
  return function roleMiddleware(request, _response, next) {
    if (!request.auth || !roles.includes(request.auth.role)) {
      const error = new Error("You do not have permission for this action");
      error.statusCode = 403;
      next(error);
      return;
    }

    next();
  };
}
