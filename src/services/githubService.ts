import { Request, Response } from 'express';
import { Octokit } from '@octokit/rest';
import { Endpoints } from '@octokit/types';

type PullRequest = Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][0];

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * @openapi
 * /repos/{owner}/{repo}/prs/open:
 *   get:
 *     summary: Get open pull requests for a repository
 *     parameters:
 *       - in: path
 *         name: owner
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub repository owner
 *       - in: path
 *         name: repo
 *         required: true
 *         schema:
 *           type: string
 *         description: Repository name
 *     responses:
 *       200:
 *         description: List of open pull requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   author:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *       500:
 *         description: Failed to fetch open pull requests
 */
export const getOpenPRs = async (req: Request, res: Response) => {
  const { owner, repo } = req.params;

  try {
    const { data } = await octokit.pulls.list({ owner, repo, state: 'open', per_page: 100 });
    const result = data.map(pr => ({
      title: pr.title,
      author: pr.user?.login,
      created_at: pr.created_at,
      status: pr.draft ? 'draft' : 'open',
    }));
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching open PRs:', error.message);
    res.status(500).json({ message: 'Failed to fetch open PRs' });
  }
};

export const getDeveloperAnalytics = async (req: Request, res: Response) => {
  const { owner, repo, username } = req.params;
  try {
    const { data } = await octokit.pulls.list({ owner, repo, state: 'all', per_page: 100 });
    const devPRs = data.filter(pr => pr.user?.login === username);
    const merged = devPRs.filter(pr => pr.merged_at);

    const avgTime = merged.length
      ? merged.reduce((acc, pr) => acc + (new Date(pr.merged_at!).getTime() - new Date(pr.created_at).getTime()), 0) / merged.length
      : 0;

    res.json({
      total_prs: devPRs.length,
      success_rate: devPRs.length ? (merged.length / devPRs.length).toFixed(2) : '0',
      avg_merge_time_ms: avgTime,
    });
  } catch (error: any) {
    console.error('Error fetching developer analytics:', error.message);
    res.status(500).json({ message: 'Failed to fetch developer analytics' });
  }
};

export const getPRTimingMetrics = async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  try {
    const { data } = await octokit.pulls.list({ owner, repo, state: 'all', per_page: 100 });

    const now = Date.now();
    const open = data.filter(pr => pr.state === 'open');
    const closed = data.filter(pr => pr.state !== 'open');

    const openDurations = open.map(pr => now - new Date(pr.created_at).getTime());
    const avgOpenDuration = closed.length
      ? closed.reduce((acc, pr) => acc + (new Date(pr.closed_at!).getTime() - new Date(pr.created_at).getTime()), 0) / closed.length
      : 0;

    const longestOpen = open.reduce<{ pr: PullRequest | null; duration: number }>(
      (acc, pr) => {
        const duration = now - new Date(pr.created_at).getTime();
        return duration > acc.duration ? { pr, duration } : acc;
      },
      { pr: null, duration: 0 }
    );

    res.json({
      open_durations_ms: openDurations,
      average_closed_duration_ms: avgOpenDuration,
      longest_open_pr: longestOpen.pr ? {
        title: longestOpen.pr.title,
        author: longestOpen.pr.user?.login,
        created_at: longestOpen.pr.created_at,
        duration_open_ms: longestOpen.duration,
      } : null
    });
  } catch (error: any) {
    console.error('Error fetching PR timing metrics:', error.message);
    res.status(500).json({ message: 'Failed to fetch PR timing metrics' });
  }
};
