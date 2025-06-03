import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubService } from '../../src/services/gitHubService';

describe('GitHubService', () => {
  let mockRes: any;
  let mockJson: any;
  let mockStatus: any;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn(() => ({ json: mockJson }));
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T12:00:00Z').getTime());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('getPRTimingMetrics', () => {
    it('should return timing metrics correctly', async () => {
      const now = Date.now();
      const prData = [
        { state: 'open', created_at: '2025-05-30T12:00:00Z' },
        { state: 'open', created_at: '2025-05-31T12:00:00Z' },
        { state: 'closed', created_at: '2025-05-20T12:00:00Z', closed_at: '2025-05-25T12:00:00Z' },
        { state: 'closed', created_at: '2025-05-21T12:00:00Z', closed_at: '2025-05-26T12:00:00Z' },
      ];

      const mockReq = {
        params: { owner: 'owner', repo: 'repo' },
        octokit: {
          pulls: {
            list: vi.fn().mockResolvedValue({ data: prData }),
          },
        },
      };

      await GitHubService.getPRTimingMetrics(mockReq as any, mockRes);

      // Expected open durations: now - created_at for each open pr
      const expectedOpenDurations = prData
        .filter(pr => pr.state === 'open')
        .map(pr => now - new Date(pr.created_at).getTime());

      // Average closed duration:
      const closedDurations = prData
        .filter(pr => pr.state !== 'open')
        .map(pr => new Date(pr.closed_at!).getTime() - new Date(pr.created_at).getTime());
      const avgClosed = closedDurations.reduce((a, b) => a + b, 0) / closedDurations.length;

      // Longest open PR is the one with max duration
      const longest = prData
        .filter(pr => pr.state === 'open')
        .reduce(
          (acc, pr) => {
            const duration = now - new Date(pr.created_at).getTime();
            return duration > acc.duration ? { pr, duration } : acc;
          },
          { pr: null as any, duration: 0 }
        );

      expect(mockRes.json).toHaveBeenCalledWith({
        open_durations_ms: expectedOpenDurations,
        average_closed_duration_ms: avgClosed,
        longest_open_pr: {
          title: longest.pr.title ?? '',
          author: longest.pr.user?.login ?? null,
          created_at: longest.pr.created_at,
          duration_open_ms: longest.duration,
        },
      });
    });

    it('should respond 401 if octokit missing', async () => {
      const mockReq = { params: { owner: 'o', repo: 'r' } };
      await GitHubService.getPRTimingMetrics(mockReq as any, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'GitHub client not available' });
    });

    it('should respond 500 on error', async () => {
      const mockReq = {
        params: { owner: 'o', repo: 'r' },
        octokit: { pulls: { list: vi.fn().mockRejectedValue(new Error('fail')) } },
      };
      await GitHubService.getPRTimingMetrics(mockReq as any, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Failed to fetch PR timing metrics' });
    });
  });

  describe('getOpenPRs', () => {
    it('should return open PRs list', async () => {
      const prData = [
        {
          title: 'PR 1',
          user: { login: 'user1' },
          created_at: '2025-05-30T12:00:00Z',
          draft: false,
        },
        {
          title: 'PR 2',
          user: { login: 'user2' },
          created_at: '2025-05-31T12:00:00Z',
          draft: true,
        },
      ];

      const mockReq = {
        params: { owner: 'o', repo: 'r' },
        octokit: { pulls: { list: vi.fn().mockResolvedValue({ data: prData }) } },
      };

      await GitHubService.getOpenPRs(mockReq as any, mockRes);

      expect(mockJson).toHaveBeenCalledWith([
        { title: 'PR 1', author: 'user1', created_at: '2025-05-30T12:00:00Z', status: 'open' },
        { title: 'PR 2', author: 'user2', created_at: '2025-05-31T12:00:00Z', status: 'draft' },
      ]);
    });

    it('should respond 401 if octokit missing', async () => {
      const mockReq = { params: { owner: 'o', repo: 'r' } };
      await GitHubService.getOpenPRs(mockReq as any, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'GitHub client not available' });
    });

    it('should respond 500 on error', async () => {
      const mockReq = {
        params: { owner: 'o', repo: 'r' },
        octokit: { pulls: { list: vi.fn().mockRejectedValue(new Error('fail')) } },
      };
      await GitHubService.getOpenPRs(mockReq as any, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Failed to fetch open PRs' });
    });
  });

  describe('getDeveloperAnalytics', () => {
    it('should return developer analytics', async () => {
      const prData = [
        { user: { login: 'dev1' }, created_at: '2025-05-01T00:00:00Z', merged_at: '2025-05-02T00:00:00Z' },
        { user: { login: 'dev1' }, created_at: '2025-05-03T00:00:00Z', merged_at: null },
        { user: { login: 'dev2' }, created_at: '2025-05-04T00:00:00Z', merged_at: '2025-05-05T00:00:00Z' },
      ];

      const mockReq = {
        params: { owner: 'o', repo: 'r', username: 'dev1' },
        octokit: { pulls: { list: vi.fn().mockResolvedValue({ data: prData }) } },
      };

      await GitHubService.getDeveloperAnalytics(mockReq as any, mockRes);

      // dev1 PRs: 2 total, 1 merged, avg merge time = 1 day in ms
      expect(mockJson).toHaveBeenCalledWith({
        total_prs: 2,
        success_rate: '0.50',
        avg_merge_time_ms: 24 * 60 * 60 * 1000,
      });
    });

    it('should return 404 if no PRs found for developer', async () => {
      const prData = [
        { user: { login: 'dev2' }, created_at: '2025-05-01T00:00:00Z', merged_at: '2025-05-02T00:00:00Z' },
      ];

      const mockReq = {
        params: { owner: 'o', repo: 'r', username: 'dev1' },
        octokit: { pulls: { list: vi.fn().mockResolvedValue({ data: prData }) } },
      };

      await GitHubService.getDeveloperAnalytics(mockReq as any, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'No PRs found for developer dev1' });
    });

    it('should respond 401 if octokit missing', async () => {
      const mockReq = { params: { owner: 'o', repo: 'r', username: 'dev' } };
      await GitHubService.getDeveloperAnalytics(mockReq as any, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'GitHub client not available' });
    });

    it('should respond 500 on error', async () => {
      const mockReq = {
        params: { owner: 'o', repo: 'r', username: 'dev' },
        octokit: { pulls: { list: vi.fn().mockRejectedValue(new Error('fail')) } },
      };
      await GitHubService.getDeveloperAnalytics(mockReq as any, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Failed to fetch developer analytics' });
    });
  });
});
