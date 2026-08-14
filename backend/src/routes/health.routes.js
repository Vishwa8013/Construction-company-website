import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.json({
    ok: true,
    service: "bl-construction-backend",
    timestamp: new Date().toISOString(),
  });
});
