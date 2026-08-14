import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

export const config = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").replace(/\/$/, ""),
  dataFile: path.resolve(rootDir, process.env.DATA_FILE || "./data/projects.json"),
  usersFile: path.resolve(rootDir, process.env.USERS_FILE || "./data/users.json"),
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || "./uploads"),
  jwtSecret: process.env.JWT_SECRET || "change-me-before-production",
  defaultAdminName: process.env.DEFAULT_ADMIN_NAME || "BL Admin",
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || "BLConstruction1admin@gmail.com",
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || "bladminc@123",
  rootDir,
};
