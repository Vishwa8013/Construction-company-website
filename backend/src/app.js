import fs from "node:fs/promises";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.routes.js";
import { projectsRouter } from "./routes/projects.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { ensureDefaultAdmin } from "./lib/usersStore.js";

await fs.mkdir(config.uploadDir, { recursive: true });
await ensureDefaultAdmin();

export const app = express();

app.use(
  cors({
    origin: config.clientOrigin,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(config.uploadDir));

app.get("/", (_request, response) => {
  response.json({
    ok: true,
    message: "BL Construction backend is running",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/users", usersRouter);

app.use(notFoundHandler);
app.use(errorHandler);
