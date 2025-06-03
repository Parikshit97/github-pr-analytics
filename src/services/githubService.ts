// src/services/GitHubService.ts
import { Request, Response } from 'express';
import { Octokit } from '@octokit/rest';
import { Endpoints } from '@octokit/types';
import { OpenPR, PRRequestParams, PRTimingMetrics } from '../types/dto.js';
import { GitHubClient } from '../clients/GitHubClient.js';


type PullRequest = Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][0];

export class GitHubService {
  private static octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  static async getPRTimingMetrics(
    req: Request<PRRequestParams>,
    res: Response<PRTimingMetrics | { message: string }>
  ) {
    const { owner, repo } = req.params;
  
    const accessToken = (req.user as any)?.accessToken;
    if (!accessToken) {
      return res.status(401).json({ message: 'Access token not found' });
    }

    const octokit = new GitHubClient(accessToken).getClient();
    
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
              (acc, pr) => acc + (new Date(pr.closed_at!).getTime() - new Date(pr.created_at!).getTime()),
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
  
      res.json(response);
    } catch (error: any) {
      console.error('Error fetching PR timing metrics:', error.message ?? error);
      res.status(500).json({ message: 'Failed to fetch PR timing metrics' });
    }
  }


  static async getOpenPRs(
    req: Request<PRRequestParams>,
    res: Response<OpenPR[] | { message: string }>
  ) {
    const { owner, repo } = req.params;
  
    const accessToken = (req.user as any)?.accessToken;
    if (!accessToken) {
      return res.status(401).json({ message: 'Access token not found' });
    }
  
    const octokit = new GitHubClient(accessToken).getClient();
  
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
  
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching open PRs:', error.message ?? error);
      res.status(500).json({ message: 'Failed to fetch open PRs' });
    }
} 
  
  static async getDeveloperAnalytics(
    req: Request<{ owner: string; repo: string; username: string }>,
    res: Response<{ total_prs: number; success_rate: string; avg_merge_time_ms: number } | { message: string }>
  ) {
    const { owner, repo, username } = req.params;

    const accessToken = (req.user as any)?.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Access token not found" });
    }

    const octokit = new GitHubClient(accessToken).getClient();

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
        ? mergedPRs.reduce((acc, pr) => acc + (new Date(pr.merged_at!).getTime() - new Date(pr.created_at).getTime()), 0) / mergedPRs.length
        : 0;

      return res.json({
        total_prs: devPRs.length,
        success_rate: (mergedPRs.length / devPRs.length).toFixed(2),
        avg_merge_time_ms: Math.round(avgMergeTimeMs),
      });
    } catch (error: any) {
      console.error('Error fetching developer analytics:', error.message);
      return res.status(500).json({ message: 'Failed to fetch developer analytics' });
    }
  }
}
