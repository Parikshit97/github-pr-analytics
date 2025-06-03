// tests/PRController.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse } from 'mock-req-res';
import { PRController } from '../../src/controllers/PRController';
import { GitHubService } from '../../src/services/githubService';

vi.mock('../../src/services/githubService', () => ({
  GitHubService: {
    getOpenPRs: vi.fn(),
    getPRTimingMetrics: vi.fn(),
    getDeveloperAnalytics: vi.fn(),
  },
}));

describe('PRController', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    vi.clearAllMocks();
  });

  it('should call GitHubService.getOpenPRs with req and res', async () => {
    await PRController.getOpenPRs(req, res);
    expect(GitHubService.getOpenPRs).toHaveBeenCalledWith(req, res);
  });

  it('should call GitHubService.getPRTimingMetrics with req and res', async () => {
    await PRController.getPRTimingMetrics(req, res);
    expect(GitHubService.getPRTimingMetrics).toHaveBeenCalledWith(req, res);
  });

  it('should call GitHubService.getDeveloperAnalytics with req and res', async () => {
    await PRController.getDeveloperAnalytics(req, res);
    expect(GitHubService.getDeveloperAnalytics).toHaveBeenCalledWith(req, res);
  });
});
