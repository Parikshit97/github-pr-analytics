import { Request, Response, NextFunction } from "express";
import { Octokit } from "@octokit/rest";

interface AuthenticatedRequest extends Request {
  octokit?: Octokit;
}

interface SessionUser {
  accessToken: string;
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user as SessionUser;
    if (user?.accessToken) {
      return next();
    } else {
      res.status(401).json({ message: 'Access token not found in session user' });
      return;
    }
  }

  res.status(401).json({ message: 'Unauthorized' });
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

