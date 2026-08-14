import fs from "node:fs/promises";
import path from "node:path";
import { readJsonArray, writeJsonArray } from "./fileDb.js";
import { config } from "../config.js";

export async function listProjects() {
  const projects = await readJsonArray(config.dataFile);
  return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addProject(project) {
  const projects = await readJsonArray(config.dataFile);
  projects.push(project);
  await writeJsonArray(config.dataFile, projects);
  return project;
}

export async function findProjectById(id) {
  const projects = await readJsonArray(config.dataFile);
  return projects.find((project) => project.id === id) || null;
}

export async function removeProject(id) {
  const projects = await readJsonArray(config.dataFile);
  const project = projects.find((entry) => entry.id === id);
  if (!project) return null;

  const nextProjects = projects.filter((entry) => entry.id !== id);
  await writeJsonArray(config.dataFile, nextProjects);

  if (project.storagePath) {
    const absoluteFilePath = path.resolve(config.rootDir, project.storagePath);
    try {
      await fs.unlink(absoluteFilePath);
    } catch {
      // If the file is already gone we still remove the JSON entry.
    }
  }

  return project;
}

export async function updateProject(id, updates) {
  const projects = await readJsonArray(config.dataFile);
  const index = projects.findIndex((project) => project.id === id);
  if (index === -1) return null;

  const current = projects[index];
  const next = {
    ...current,
    title: updates.title ?? current.title,
    description: updates.description ?? current.description,
    category: updates.category ?? current.category,
  };

  projects[index] = next;
  await writeJsonArray(config.dataFile, projects);
  return next;
}
