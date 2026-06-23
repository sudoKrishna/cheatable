import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { projectsRouter } from "./routes/projects.js";
import { messagesRouter } from "./routes/messages.js";
import { sandboxRouter } from "./routes/sandbox.js";
import { logger } from "./utils/logger.js";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/sandbox", sandboxRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("Unhandled error", { error: String(err) });
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  logger.info(`Backend listening on port ${port}`);
});