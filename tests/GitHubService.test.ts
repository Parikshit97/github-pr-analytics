// tests/GitHubService.test.ts
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import type { Request, Response } from 'express';
import { GitHubService } from '../src/services/githubService';
import { GitHubClient } from '../src/clients/GitHubClient';

// Mock GitHubClient class and its getClient method
vi.mock('../src/clients/GitHubClient', () => {
  return {
    GitHubClient: vi.fn().mockImplementation(() => ({
      getClient: vi.fn(),
    })),
  };
});

beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    (console.error as any).mockRestore();
  });
  

describe('GitHubService', () => {
  let mockRes: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn(() => ({ json: mockJson }));
    mockRes = {
      json: mockJson,
      status: mockStatus,
    };
    vi.clearAllMocks();
  });

  describe('getPRTimingMetrics', () => {
    it('returns 401 if access token is missing', async () => {
      const mockReq = {
        params: { owner: 'owner', repo: 'repo' },
        user: {},
      } as unknown as Request<{ owner: string; repo: string }, any, any>;

      await GitHubService.getPRTimingMetrics(mockReq, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Access token not found' });
    });

    it('returns PR timing metrics on success', async () => {
      const mockReq = {
        params: { owner: 'owner', repo: 'repo' },
        user: { accessToken: 'token' },
      } as unknown as Request<{ owner: string; repo: string }, any, any>;

      const mockPullsList = vi.fn().mockResolvedValue({
        data: [
          {
            state: 'open',
            created_at: new Date(Date.now() - 10000).toISOString(),
            closed_at: null,
            title: 'Open PR',
            user: { login: 'user1' },
            draft: false,
          },
          {
            state: 'closed',
            created_at: new Date(Date.now() - 20000).toISOString(),
            closed_at: new Date(Date.now() - 10000).toISOString(),
            title: 'Closed PR',
            user: { login: 'user2' },
            draft: false,
          },
        ],
      });

      // @ts-ignore - we assert GitHubClient mock instance's getClient returns this object
      (GitHubClient as unknown as vi.Mock).mockImplementation(() => ({
        getClient: () => ({
          pulls: { list: mockPullsList },
        }),
      }));

      await GitHubService.getPRTimingMetrics(mockReq, mockRes as Response);

      expect(mockJson).toHaveBeenCalled();
      const responseArg = mockJson.mock.calls[0][0];
      expect(responseArg.open_durations_ms).toHaveLength(1);
      expect(typeof responseArg.average_closed_duration_ms).toBe('number');
      expect(responseArg.longest_open_pr).not.toBeNull();
    });

    it('returns 500 on error', async () => {
      const mockReq = {
        params: { owner: 'owner', repo: 'repo' },
        user: { accessToken: 'token' },
      } as unknown as Request<{ owner: string; repo: string }, any, any>;

      const mockPullsList = vi.fn().mockRejectedValue(new Error('Failed'));

      // @ts-ignore
      (GitHubClient as unknown as vi.Mock).mockImplementation(() => ({
        getClient: () => ({
          pulls: { list: mockPullsList },
        }),
      }));

      await GitHubService.getPRTimingMetrics(mockReq, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Failed to fetch PR timing metrics' });
    });
  });

  describe('getOpenPRs', () => {
    it('returns 401 if access token missing', async () => {
      const mockReq = {
        params: { owner: 'owner', repo: 'repo' },
        user: {},
      } as unknown as Request<{ owner: string; repo: string }, any, any>;

      await GitHubService.getOpenPRs(mockReq, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Access token not found' });
    });

    it('returns open PRs on success', async () => {
      const mockReq = {
        params: { owner: 'owner', repo: 'repo' },
        user: { accessToken: 'token' },
      } as unknown as Request<{ owner: string; repo: string }, any, any>;

      const mockPullsList = vi.fn().mockResolvedValue({
        data: [
          {
            title: 'PR1',
            user: { login: 'user1' },
            created_at: new Date().toISOString(),
            draft: false,
          },
          {
            title: 'PR2',
            user: { login: 'user2' },
            created_at: new Date().toISOString(),
            draft: true,
          },
        ],
      });

      // @ts-ignore
      (GitHubClient as unknown as vi.Mock).mockImplementation(() => ({
        getClient: () => ({
          pulls: { list: mockPullsList },
        }),
      }));

      await GitHubService.getOpenPRs(mockReq, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith([
        { title: 'PR1', author: 'user1', created_at: expect.any(String), status: 'open' },
        { title: 'PR2', author: 'user2', created_at: expect.any(String), status: 'draft' },
      ]);
    });

    it('returns 500 on error', async () => {
      const mockReq = {
        params: { owner: 'owner', repo: 'repo' },
        user: { accessToken: 'token' },
      } as unknown as Request<{ owner: string; repo: string }, any, any>;

      const mockPullsList = vi.fn().mockRejectedValue(new Error('Error fetching'));

      // @ts-ignore
      (GitHubClient as unknown as vi.Mock).mockImplementation(() => ({
        getClient: () => ({
          pulls: { list: mockPullsList },
        }),
      }));

      await GitHubService.getOpenPRs(mockReq, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Failed to fetch open PRs' });
    });
  });

  describe('getDeveloperAnalytics', () => {
    it('returns 401 if access token missing', async () => {
      const mockReq = {
        params: { owner: 'owner', repo: 'repo', username: 'user' },
        user: {},
      } as unknown as Request<{ owner: string; repo: string; username: string }, any, any>;

      await GitHubService.getDeveloperAnalytics(mockReq, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Access token not found' });
    });

    it('returns 404 if no PRs found for user', async () => {
      const mockReq = {
        params: { owner: 'owner', repo: 'repo', username: 'user' },
        user: { accessToken: 'token' },
      } as unknown as Request<{ owner: string; repo: string; username: string }, any, any>;

      const mockPullsList = vi.fn().mockResolvedValue({
        data: [],
      });

      // @ts-ignore
      (GitHubClient as unknown as vi.Mock).mockImplementation(() => ({
        getClient: () => ({
          pulls: { list: mockPullsList },
        }),
      }));

      await GitHubService.getDeveloperAnalytics(mockReq, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'No PRs found for developer user' });
    });

    it('returns analytics data on success', async () => {
      const now = Date.now();
      const createdAt1 = new Date(now - 30000).toISOString();
      const mergedAt1 = new Date(now - 10000).toISOString();
      const createdAt2 = new Date(now - 60000).toISOString();

      const mockReq = {
        params: { owner: 'owner', repo: 'repo', username: 'user' },
        user: { accessToken: 'token' },
      } as unknown as Request<{ owner: string; repo: string; username: string }, any, any>;

      const mockPullsList = vi.fn().mockResolvedValue({
        data: [
          {
            user: { login: 'user' },
            created_at: createdAt1,
            merged_at: mergedAt1,
          },
          {
            user: { login: 'user' },
            created_at: createdAt2,
            merged_at: null,
          },
          {
            user: { login: 'other' },
            created_at: createdAt1,
            merged_at: mergedAt1,
          },
        ],
      });

      // @ts-ignore
      (GitHubClient as unknown as vi.Mock).mockImplementation(() => ({
        getClient: () => ({
          pulls: { list: mockPullsList },
        }),
      }));

      await GitHubService.getDeveloperAnalytics(mockReq, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({
        total_prs: 2,
        success_rate: '0.50',
        avg_merge_time_ms: Math.round(new Date(mergedAt1).getTime() - new Date(createdAt1).getTime()),
      });
    });

    it('returns 500 on error', async () => {
      const mockReq = {
        params: { owner: 'owner', repo: 'repo', username: 'user' },
        user: { accessToken: 'token' },
      } as unknown as Request<{ owner: string; repo: string; username: string }, any, any>;

      const mockPullsList = vi.fn().mockRejectedValue(new Error('Failed'));

      // @ts-ignore
      (GitHubClient as unknown as vi.Mock).mockImplementation(() => ({
        getClient: () => ({
          pulls: { list: mockPullsList },
        }),
      }));

      await GitHubService.getDeveloperAnalytics(mockReq, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Failed to fetch developer analytics' });
    });
  });
});
