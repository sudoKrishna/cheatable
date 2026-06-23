import { Router } from "express";
import { z } from "zod";
import { createUser, findUserByEmail } from "../db/queries/users.js";
import { hashPassword, verifyPassword, signToken } from "../utils/auth.js";
import { logger } from "../utils/logger.js";

export const authRouter = Router();

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

authRouter.post("/signup", async (req, res) => {
  const parsed = CredentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash);
    const token = signToken({ userId: user.id });

    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    logger.error("Signup failed", { error: String(err) });
    res.status(500).json({ error: "Failed to create account" });
  }
});

authRouter.post("/login", async (req, res) => {
  const parsed = CredentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken({ userId: user.id });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    logger.error("Login failed", { error: String(err) });
    res.status(500).json({ error: "Failed to log in" });
  }
});