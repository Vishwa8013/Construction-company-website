import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import { config } from "../config.js";
import { writeJsonArray } from "../lib/fileDb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");

const frontendFolders = [
  {
    category: "House Design",
    folder: path.join(repoRoot, "src", "assets", "photos", "house-design"),
  },
  {
    category: "Construction",
    folder: path.join(repoRoot, "src", "assets", "photos", "builders"),
  },
  {
    category: "Interior Design",
    folder: path.join(repoRoot, "src", "assets", "photos", "interior-design"),
  },
  {
    category: "Videos",
    folder: path.join(repoRoot, "src", "assets", "photos", "videos"),
  },
];

const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const videoExtensions = new Set([".mp4", ".mov", ".webm"]);
const documentExtensions = new Set([".pdf"]);

function determineMediaType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (imageExtensions.has(extension)) return "image";
  if (videoExtensions.has(extension)) return "video";
  if (documentExtensions.has(extension)) return "document";
  return null;
}

const seededProjects = [];

for (const source of frontendFolders) {
  let entries = [];

  try {
    entries = await fs.readdir(source.folder, { withFileTypes: true });
  } catch {
    continue;
  }

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const absolutePath = path.join(source.folder, entry.name);
    const mediaType = determineMediaType(absolutePath);
    if (!mediaType) continue;

    const stats = await fs.stat(absolutePath);
    const relativeSource = path.relative(repoRoot, absolutePath).replaceAll("\\", "/");

    seededProjects.push({
      id: nanoid(),
      title: path.basename(entry.name, path.extname(entry.name)),
      description: "",
      category: source.category,
      type: mediaType,
      mimeType: "seeded/frontend-asset",
      originalName: entry.name,
      fileName: entry.name,
      url: `/${relativeSource}`,
      storagePath: relativeSource,
      size: stats.size,
      createdAt: new Date(stats.birthtimeMs || stats.mtimeMs).toISOString(),
      seededFromFrontend: true,
    });
  }
}

await writeJsonArray(config.dataFile, seededProjects);

console.log(`Seeded ${seededProjects.length} project entries into ${config.dataFile}`);
