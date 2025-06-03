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

  // If Bearer token exists, use that
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const octokit = new Octokit({ auth: token });

    try {
      await octokit.users.getAuthenticated();
      req.octokit = octokit;
      return next();
    } catch (error) {
     
      ensureSessionAuthenticated(req, res, next);
      return;
    }
  }

  // If authenticated via session, use req.user.token from Passport
  res.status(401).json({ message: "Unauthorized" });
}


export function ensureSessionAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user as { accessToken?: string };

    if (user?.accessToken) {
      return next(); // Authenticated and token present, proceed
    } else {
      return res.redirect('/auth/github'); // Authenticated but token missing
    }
  }

  // Not authenticated at all, redirect to GitHub login
  return res.redirect('/auth/github');
}


