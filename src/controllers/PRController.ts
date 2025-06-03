import { Request, Response } from 'express';
import { GitHubService } from '../services/GithubService.js';
import type { PRRequestParams, OpenPRResponse, PRTimingMetricsResponse, DeveloperAnalyticsParams } from '../types/dto.js';

export class PRController {
  static async getOpenPRs(req: Request<PRRequestParams>, res: Response<OpenPRResponse>) {
    return GitHubService.getOpenPRs(req, res);
  }

  static async getPRTimingMetrics(req: Request<PRRequestParams>, res: Response<PRTimingMetricsResponse>) {
    return GitHubService.getPRTimingMetrics(req, res);
  }

  static async getDeveloperAnalytics(
    req: Request<DeveloperAnalyticsParams>,
    res: Response
  ) {
    return GitHubService.getDeveloperAnalytics(req, res);
  }
  
}
