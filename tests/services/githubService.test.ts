// tests/services/GitHubService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubService } from '../../src/services/githubService';


import { Response } from 'express';
import { Octokit } from '@octokit/rest';
import { AuthenticatedRequest } from '../../src/types/dto';

vi.mock('../../src/mongoCRUD', () => ({
  logUserRequest: vi.fn(),
}));

const createMockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  return res;
};

const createMockOctokit = (pullsData: any[]) => ({
  pulls: {
    list: vi.fn().mockResolvedValue({ data: pullsData }),
  },
});

describe('GitHubService', () => {
  let req: Partial<AuthenticatedRequest<any>>;
  let res: Response;

  beforeEach(() => {
    res = createMockResponse();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getOpenPRs', () => {
    it('should return list of open PRs', async () => {
      const mockPRs = [
        { title: 'Test PR', user: { login: 'user1' }, created_at: '2024-06-01T00:00:00Z', draft: false, state: 'open' },
      ];
      req = {
        params: { owner: 'test', repo: 'repo' },
        octokit: createMockOctokit(mockPRs) as unknown as Octokit,
      };

      await GitHubService.getOpenPRs(req as any, res);

      expect(res.json).toHaveBeenCalledWith([
        {
          title: 'Test PR',
          author: 'user1',
          created_at: '2024-06-01T00:00:00Z',
          status: 'open',
        },
      ]);
    });
  });

  describe('getPRTimingMetrics', () => {
    it('should return timing metrics', async () => {
      const now = new Date();
      const openPRs = [{ state: 'open', created_at: now.toISOString(), title: 'Open PR', user: { login: 'user1' } }];
      const closedPRs = [{
        state: 'closed',
        created_at: new Date(now.getTime() - 10000).toISOString(),
        closed_at: now.toISOString(),
        title: 'Closed PR',
        user: { login: 'user2' }
      }];
      req = {
        params: { owner: 'test', repo: 'repo' },
        octokit: createMockOctokit([...openPRs, ...closedPRs]) as unknown as Octokit,
      };

      await GitHubService.getPRTimingMetrics(req as any, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        open_durations_ms: expect.any(Array),
        average_closed_duration_ms: expect.any(Number),
        longest_open_pr: expect.objectContaining({ title: 'Open PR', author: 'user1' }),
      }));
    });
  });

  describe('getDeveloperAnalytics', () => {
    it('should return developer analytics', async () => {
      const createdAt = new Date(Date.now() - 10000).toISOString();
      const mergedAt = new Date().toISOString();

      const prs = [
        { user: { login: 'dev1' }, created_at: createdAt, merged_at: mergedAt },
        { user: { login: 'dev1' }, created_at: createdAt, merged_at: null },
      ];

      req = {
        params: { owner: 'test', repo: 'repo', username: 'dev1' },
        octokit: createMockOctokit(prs) as unknown as Octokit,
      };

      await GitHubService.getDeveloperAnalytics(req as any, res);

      expect(res.json).toHaveBeenCalledWith({
        total_prs: 2,
        success_rate: '0.50',
        avg_merge_time_ms: expect.any(Number),
      });
    });
  });
});
