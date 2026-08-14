import { nanoid } from "nanoid";
import { config } from "../config.js";
import { readJsonArray, writeJsonArray } from "./fileDb.js";
import { hashPassword } from "./passwords.js";

function sanitizeUser(user) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export function sanitizeUserForResponse(user) {
  return sanitizeUser(user);
}

export async function listUsers() {
  const users = await readJsonArray(config.usersFile);
  return users.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listSafeUsers() {
  const users = await listUsers();
  return users.map(sanitizeUser);
}

export async function findUserByEmail(email) {
  const users = await listUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  const users = await listUsers();
  return users.find((user) => user.id === id) || null;
}

export async function ensureDefaultAdmin() {
  const users = await readJsonArray(config.usersFile);
  if (users.length > 0) return;

  const admin = {
    id: nanoid(),
    name: config.defaultAdminName,
    email: config.defaultAdminEmail.toLowerCase(),
    role: "admin",
    passwordHash: await hashPassword(config.defaultAdminPassword),
    createdAt: new Date().toISOString(),
  };

  await writeJsonArray(config.usersFile, [admin]);
}

export async function createUser({ name, email, role, password }) {
  const users = await readJsonArray(config.usersFile);

  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    const error = new Error("A member with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = {
    id: nanoid(),
    name,
    email: email.toLowerCase(),
    role,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeJsonArray(config.usersFile, users);
  return sanitizeUser(user);
}

export async function updateUser(id, updates) {
  const users = await readJsonArray(config.usersFile);
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return null;

  if (
    updates.email &&
    users.some((user) => user.id !== id && user.email.toLowerCase() === updates.email.toLowerCase())
  ) {
    const error = new Error("Another member already uses this email");
    error.statusCode = 409;
    throw error;
  }

  const current = users[index];
  const next = {
    ...current,
    name: updates.name ?? current.name,
    email: updates.email ? updates.email.toLowerCase() : current.email,
    role: updates.role ?? current.role,
  };

  if (updates.password) {
    next.passwordHash = await hashPassword(updates.password);
  }

  users[index] = next;
  await writeJsonArray(config.usersFile, users);
  return sanitizeUser(next);
}

export async function deleteUser(id) {
  const users = await readJsonArray(config.usersFile);
  const found = users.find((user) => user.id === id);
  if (!found) return null;

  const nextUsers = users.filter((user) => user.id !== id);
  await writeJsonArray(config.usersFile, nextUsers);
  return sanitizeUser(found);
}
