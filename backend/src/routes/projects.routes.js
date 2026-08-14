import fs from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import mime from "mime-types";
import multer from "multer";
import { nanoid } from "nanoid";
import { config } from "../config.js";
import { addProject, listProjects, removeProject, updateProject } from "../lib/projectsStore.js";
import { requireAuth } from "../middleware/auth.js";

const allowedCategories = ["House Design", "Construction", "Interior Design", "Videos"];
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const videoExtensions = new Set([".mp4", ".mov", ".webm"]);
const documentExtensions = new Set([".pdf"]);

const storage = multer.diskStorage({
  destination: async (_request, _file, callback) => {
    try {
      await fs.mkdir(config.uploadDir, { recursive: true });
      callback(null, config.uploadDir);
    } catch (error) {
      callback(error, config.uploadDir);
    }
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();

    callback(null, `${Date.now()}-${safeBase || "project-file"}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

function determineMediaType(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  if (imageExtensions.has(extension)) return "image";
  if (videoExtensions.has(extension)) return "video";
  if (documentExtensions.has(extension)) return "document";
  return null;
}

function toPublicUrl(request, fileName) {
  return `${request.protocol}://${request.get("host")}/uploads/${encodeURIComponent(fileName)}`;
}

export const projectsRouter = Router();

projectsRouter.get("/", async (_request, response, next) => {
  try {
    const projects = await listProjects();
    response.json({
      ok: true,
      items: projects,
    });
  } catch (error) {
    next(error);
  }
});

projectsRouter.use(requireAuth);

projectsRouter.post("/", upload.single("file"), async (request, response, next) => {
  try {
    const { category, title = "", description = "" } = request.body;

    if (!request.file) {
      const error = new Error("Please upload a file");
      error.statusCode = 400;
      throw error;
    }

    if (!allowedCategories.includes(category)) {
      const error = new Error("Please choose a valid category");
      error.statusCode = 400;
      throw error;
    }

    const mediaType = determineMediaType(request.file.filename);
    if (!mediaType) {
      await fs.unlink(request.file.path).catch(() => {});
      const error = new Error("Only image, video, and PDF files are supported");
      error.statusCode = 400;
      throw error;
    }

    const project = {
      id: nanoid(),
      title: title.trim() || path.basename(request.file.originalname, path.extname(request.file.originalname)),
      description: description.trim(),
      category,
      type: mediaType,
      mimeType: request.file.mimetype || mime.lookup(request.file.filename) || "application/octet-stream",
      originalName: request.file.originalname,
      fileName: request.file.filename,
      url: toPublicUrl(request, request.file.filename),
      storagePath: path.relative(config.rootDir, request.file.path).replaceAll("\\", "/"),
      size: request.file.size,
      createdAt: new Date().toISOString(),
    };

    await addProject(project);

    response.status(201).json({
      ok: true,
      item: project,
    });
  } catch (error) {
    next(error);
  }
});

projectsRouter.patch("/:id", async (request, response, next) => {
  try {
    const category = request.body.category ? String(request.body.category).trim() : undefined;
    if (category && !allowedCategories.includes(category)) {
      const error = new Error("Please choose a valid category");
      error.statusCode = 400;
      throw error;
    }

    const item = await updateProject(request.params.id, {
      title: request.body.title ? String(request.body.title).trim() : undefined,
      description: request.body.description !== undefined ? String(request.body.description).trim() : undefined,
      category,
    });

    if (!item) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      throw error;
    }

    response.json({
      ok: true,
      item,
    });
  } catch (error) {
    next(error);
  }
});

projectsRouter.delete("/:id", async (request, response, next) => {
  try {
    const removed = await removeProject(request.params.id);
    if (!removed) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      throw error;
    }

    response.json({
      ok: true,
      item: removed,
    });
  } catch (error) {
    next(error);
  }
});
