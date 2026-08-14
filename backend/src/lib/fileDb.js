import fs from "node:fs/promises";
import path from "node:path";

async function ensureFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]", "utf8");
  }
}

export async function readJsonArray(filePath) {
  await ensureFile(filePath);
  const raw = await fs.readFile(filePath, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeJsonArray(filePath, value) {
  await ensureFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}
