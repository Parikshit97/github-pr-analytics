import { describe, it, expect, vi } from 'vitest';
import { Octokit } from '@octokit/rest';
import { GitHubService } from '../../src/services/githubService';
import { logUserRequest } from '../../src/mongoCRUD';

vi.mock('../../src/mongoCRUD', () => ({ logUserRequest: vi.fn() }));

function response() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('analytics pagination', () => {
  it('includes a pull request beyond the first page using the real Octokit paginator', async () => {
    const closed = Array.from({ length: 100 }, (_, index) => ({
      number: index + 1, state: 'closed', title: 'Closed',
      created_at: '2024-01-01T00:00:00Z', closed_at: '2024-01-02T00:00:00Z',
      user: { login: 'developer' },
    }));
    const fetch = vi.fn(async (url: any) => {
      const secondPage = String(url).includes('page=2');
      return new Response(JSON.stringify(secondPage ? [{
        number: 101, state: 'open', title: 'Oldest open PR on page two',
        created_at: '2020-01-01T00:00:00Z', user: { login: 'developer' },
      }] : closed), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          ...(secondPage ? {} : {
            link: '<https://api.github.com/repos/test/repo/pulls?state=all&per_page=100&page=2>; rel="next"',
          }),
        },
      });
    });
    const res = response();
    await GitHubService.getPRTimingMetrics({
      params: { owner: 'test', repo: 'repo' }, user: { id: 'test-user' },
      octokit: new Octokit({ request: { fetch } }),
    } as any, res);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      average_closed_duration_ms: 86400000,
      longest_open_pr: expect.objectContaining({ title: 'Oldest open PR on page two' }),
    }));
    expect(logUserRequest).toHaveBeenLastCalledWith(expect.objectContaining({
      userId: 'test-user', responseTimeMs: expect.any(Number),
    }));
    expect(vi.mocked(logUserRequest).mock.calls.at(-1)![0].responseTimeMs).toBeLessThan(10000);
  });

  it('returns no longest open PR and zero closed duration for an empty repository', async () => {
    const res = response();
    await GitHubService.getPRTimingMetrics({
      params: { owner: 'test', repo: 'repo' }, octokit: { paginate: vi.fn().mockResolvedValue([]), pulls: { list: vi.fn() } },
    } as any, res);
    expect(res.json).toHaveBeenCalledWith({
      open_durations_ms: [], average_closed_duration_ms: 0, longest_open_pr: null,
    });
  });

  it('rejects requests without an authenticated GitHub client', async () => {
    const res = response();
    await GitHubService.getOpenPRs({ params: { owner: 'test', repo: 'repo' } } as any, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
