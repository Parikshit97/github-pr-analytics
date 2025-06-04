// src/services/GitHubService.ts
import { Request, Response } from 'express';
import { Octokit } from '@octokit/rest';
import { Endpoints } from '@octokit/types';
import { AuthenticatedRequest, DeveloperAnalyticsResponse, OpenPR, PRRequestParams, PRTimingMetrics } from '../types/dto.js';
import { GitHubClient } from '../clients/GitHubClient.js';
import { logUserRequest } from '../mongoCRUD.js';

export class GitHubService {

  static async getPRTimingMetrics(
    req: AuthenticatedRequest<PRRequestParams>,
    res: Response<PRTimingMetrics | { message: string }>
  ) {
    const { owner, repo } = req.params;
    const octokit = req.octokit;
    if (!octokit) {
      return res.status(401).json({ message: 'GitHub client not available' });
    }

    try {
      const { data } = await octokit.pulls.list({
        owner,
        repo,
        state: 'all',
        per_page: 100,
      });

      const now = Date.now();
      const openPRs = data.filter(pr => pr.state === 'open' && pr.created_at);
      const closedPRs = data.filter(pr => pr.state !== 'open' && pr.created_at && pr.closed_at);

      const openDurations = openPRs.map(pr => now - new Date(pr.created_at!).getTime());

      const avgClosedDuration =
        closedPRs.length > 0
          ? closedPRs.reduce(
              (acc, pr) =>
                acc + (new Date(pr.closed_at!).getTime() - new Date(pr.created_at!).getTime()),
              0
            ) / closedPRs.length
          : 0;

      const longestOpen = openPRs.reduce<{ pr: typeof data[0] | null; duration: number }>(
        (acc, pr) => {
          const duration = now - new Date(pr.created_at!).getTime();
          return duration > acc.duration ? { pr, duration } : acc;
        },
        { pr: null, duration: 0 }
      );

      const response: PRTimingMetrics = {
        open_durations_ms: openDurations,
        average_closed_duration_ms: avgClosedDuration,
        longest_open_pr: longestOpen.pr
          ? {
              title: longestOpen.pr.title ?? '',
              author: longestOpen.pr.user?.login ?? null,
              created_at: longestOpen.pr.created_at!,
              duration_open_ms: longestOpen.duration,
            }
          : null,
      };

      // Save metrics to MongoDB using CRUD helper
      await logUserRequest({
        userId: 'someUserIdString',
        owner,
        repo,
        endpoint: 'getPRTimingMetrics',
        requestedAt: new Date(),
        status: 'success',
        responseTimeMs: Date.now()
      });

      res.json(response);
    } catch (error: any) {
      console.error('Error fetching PR timing metrics:', error.message ?? error);
      res.status(500).json({ message: 'Failed to fetch PR timing metrics' });
    }
  }
  


  static async getOpenPRs(
    req: AuthenticatedRequest<PRRequestParams>,
    res: Response<OpenPR[] | { message: string }>
  ) {
    const { owner, repo } = req.params;
  
    const octokit = req.octokit;
    if (!octokit) {
      return res.status(401).json({ message: 'GitHub client not available' });
    }
  
    try {
      const { data } = await octokit.pulls.list({
        owner,
        repo,
        state: 'open',
        per_page: 100,
      });
  
      const result: OpenPR[] = data.map(pr => ({
        title: pr.title ?? '',
        author: pr.user?.login ?? null,
        created_at: pr.created_at ?? '',
        status: pr.draft ? 'draft' : 'open',
      }));

      await logUserRequest({
        userId: 'someUserIdString',
        owner,
        repo,
        endpoint: 'getOpenPRs',
        requestedAt: new Date(),
        status: 'success',
        responseTimeMs: Date.now()
      });
  
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching open PRs:', error.message ?? error);
      res.status(500).json({ message: 'Failed to fetch open PRs' });
    }
  }

static async getDeveloperAnalytics(
  req: AuthenticatedRequest<{ owner: string; repo: string; username: string }>,
  res: Response<DeveloperAnalyticsResponse | { message: string }>
) {
  const { owner, repo, username } = req.params;

  const octokit = req.octokit;
  if (!octokit) {
    return res.status(401).json({ message: 'GitHub client not available' });
  }

  try {
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 100,
    });

    const devPRs = data.filter(pr => pr.user?.login === username);

    if (devPRs.length === 0) {
      return res.status(404).json({ message: `No PRs found for developer ${username}` });
    }

    const mergedPRs = devPRs.filter(pr => pr.merged_at !== null);

    const avgMergeTimeMs = mergedPRs.length
      ? mergedPRs.reduce(
          (acc, pr) =>
            acc + (new Date(pr.merged_at!).getTime() - new Date(pr.created_at).getTime()),
          0
        ) / mergedPRs.length
      : 0;

      await logUserRequest({
        userId: 'someUserIdString',
        owner,
        repo,
        endpoint: 'getDeveloperAnalytics',
        requestedAt: new Date(),
        status: 'success',
        responseTimeMs: Date.now()
      });

    return res.json({
      total_prs: devPRs.length,
      success_rate: (mergedPRs.length / devPRs.length).toFixed(2),
      avg_merge_time_ms: Math.round(avgMergeTimeMs),
    });
  } catch (error: any) {
    console.error('Error fetching developer analytics:', error.message ?? error);
    return res.status(500).json({ message: 'Failed to fetch developer analytics' });
  }
}

}
