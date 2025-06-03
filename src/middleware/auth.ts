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

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const octokit = new Octokit({ auth: token });

    try {
      await octokit.users.getAuthenticated();
      req.octokit = octokit;
      return next();
    } catch (error) {
      res.status(401).json({ error: "Invalid GitHub token" });
      return; // Exit after response, don't return the response object
    }
  }

  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ error: "Unauthorized" });
  return;
}
