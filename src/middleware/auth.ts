import { Request, Response, NextFunction } from "express";
import { Octokit } from "@octokit/rest";

interface AuthenticatedRequest extends Request {
  octokit?: Octokit;
}

export async function ensureAuthenticated(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  // 1. If Bearer token present, validate GitHub OAuth token
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const octokit = new Octokit({ auth: token });

    try {
      await octokit.users.getAuthenticated();
      req.octokit = octokit;
      return next();
    } catch (error) {
      // Invalid token, respond with 401 and don't proceed
      res.status(401).json({ error: "Invalid GitHub token" });
      return;
    }
  }

  // 2. If session auth exists and is authenticated, allow access
  if (typeof req.isAuthenticated === "function" && req.isAuthenticated()) {
    return next();
  }

  // 3. Otherwise, unauthorized
  res.status(401).json({ error: "Unauthorized" });
}

export function ensureSessionAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/github');
}

