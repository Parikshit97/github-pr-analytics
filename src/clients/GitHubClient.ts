import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';

const MyOctokit = Octokit.plugin(throttling);

export class GitHubClient {
  private octokit: InstanceType<typeof MyOctokit>;

  constructor(accessToken: string) {
    this.octokit = new MyOctokit({
      auth: accessToken,
      throttle: {
        enabled: true,
        onRateLimit: (retryAfter: number, options: any) => {
          console.warn(`Rate limit hit: ${options.method} ${options.url}`);
          if (options.request.retryCount === 0) {
            console.log(`Retrying after ${retryAfter} seconds`);
            return true;
          }
          return false;
        },
        onSecondaryRateLimit: (retryAfter: number, options: any) => {
          console.warn(`Secondary rate limit hit: ${options.method} ${options.url}`);
          return false;
        },
      },
    });
  }

  getClient(): InstanceType<typeof MyOctokit> {
    return this.octokit;
  }
}
