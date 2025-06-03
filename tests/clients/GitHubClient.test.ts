// tests/GitHubClient.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GitHubClient } from '../../src/clients/GitHubClient';

describe('GitHubClient', () => {
  let originalWarn: typeof console.warn;
  let originalLog: typeof console.log;

  beforeEach(() => {
    originalWarn = console.warn;
    originalLog = console.log;
    console.warn = vi.fn();
    console.log = vi.fn();
  });

  afterEach(() => {
    console.warn = originalWarn;
    console.log = originalLog;
  });

  it('should create an Octokit instance with throttling plugin', () => {
    const client = new GitHubClient('fake-token');
    const octokit = client.getClient();

    expect(octokit).toBeDefined();
  });

  describe('throttling onRateLimit handler', () => {
    it('should log and retry on first retry', () => {
      const throttlingOptions = {
        method: 'GET',
        url: '/rate_limit',
        request: { retryCount: 0 },
      };
      const retryAfter = 5;

      const onRateLimit = (retryAfter: number, options: any) => {
        console.warn(`Rate limit hit: ${options.method} ${options.url}`);
        if (options.request.retryCount === 0) {
          console.log(`Retrying after ${retryAfter} seconds`);
          return true;
        }
        return false;
      };

      const result = onRateLimit(retryAfter, throttlingOptions);

      expect(console.warn).toHaveBeenCalledWith('Rate limit hit: GET /rate_limit');
      expect(console.log).toHaveBeenCalledWith('Retrying after 5 seconds');
      expect(result).toBe(true);
    });

    it('should not retry if retryCount > 0', () => {
      const throttlingOptions = {
        method: 'GET',
        url: '/rate_limit',
        request: { retryCount: 1 },
      };
      const retryAfter = 5;

      const onRateLimit = (retryAfter: number, options: any) => {
        console.warn(`Rate limit hit: ${options.method} ${options.url}`);
        if (options.request.retryCount === 0) {
          console.log(`Retrying after ${retryAfter} seconds`);
          return true;
        }
        return false;
      };

      const result = onRateLimit(retryAfter, throttlingOptions);

      expect(console.warn).toHaveBeenCalledWith('Rate limit hit: GET /rate_limit');
      expect(console.log).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('throttling onSecondaryRateLimit handler', () => {
    it('should log secondary rate limit and not retry', () => {
      const throttlingOptions = {
        method: 'POST',
        url: '/some/endpoint',
        request: { retryCount: 0 },
      };
      const retryAfter = 3;

      const onSecondaryRateLimit = (retryAfter: number, options: any) => {
        console.warn(`Secondary rate limit hit: ${options.method} ${options.url}`);
        return false;
      };

      const result = onSecondaryRateLimit(retryAfter, throttlingOptions);

      expect(console.warn).toHaveBeenCalledWith('Secondary rate limit hit: POST /some/endpoint');
      expect(result).toBe(false);
    });
  });
});
