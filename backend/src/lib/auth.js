import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function createAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
