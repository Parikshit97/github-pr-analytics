# GitHub PR Analytics

A TypeScript backend for inspecting pull-request activity through the GitHub API. It supports GitHub OAuth sessions and bearer-token authentication, computes timing and developer metrics, and records successful requests in MongoDB.

## Request flow

`HTTP request → authentication → controller → paginated GitHub API → metrics → MongoDB request log → JSON response`

All pull-request list endpoints follow GitHub pagination rather than stopping at 100 results. The throttling client retries the first primary-rate-limit response once; secondary-limit responses are not automatically retried.

## Local setup

Requirements: Node.js 22 or later, npm, and MongoDB. OAuth login also requires a GitHub OAuth application with callback URL `http://localhost:3000/auth/github/callback`.

```sh
npm ci
cp .env.example .env
# Set OAuth credentials and a session secret in .env.
npm run check
npm start
```

`npm run dev` builds and starts the development configuration. `npm run build` only compiles TypeScript; `npm test` runs the mocked regression suite. A live GitHub account and MongoDB are not needed for the tests.

For local containers, populate `.env` first:

```sh
docker compose -f docker-compose.dev.yml up --build
```

The development Compose file uses its MongoDB service. Production must supply `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `SESSION_SECRET`, and `MONGODB_URI`; the session secret is separate from the OAuth secret. The environment template contains placeholders only. Previously committed credentials must be rotated at the provider; changing the current files does not remove Git history.

## API

| Route | Authentication | Result |
|---|---|---|
| `GET /health` | None | Process liveness; does not verify MongoDB or GitHub |
| `GET /auth/github` | Browser OAuth | Starts sign-in |
| `GET /docs` | OAuth session | OpenAPI interface |
| `GET /repos/:owner/:repo/prs/open` | OAuth session or bearer token | Open and draft PRs |
| `GET /repos/:owner/:repo/prs/timing` | OAuth session or bearer token | Open durations, average closed duration, longest open PR |
| `GET /repos/:owner/:repo/dev/:username/analytics` | OAuth session or bearer token | PR count, merged fraction, average merge duration |

```sh
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  http://localhost:3000/repos/OWNER/REPOSITORY/prs/timing
```

Durations are milliseconds. `average_closed_duration_ms` includes closed-but-unmerged PRs. `success_rate` is the fraction of the developer’s PRs that were merged, expressed as a decimal string; it is not a measure of developer quality. Successful endpoint responses currently depend on MongoDB request logging succeeding.

## Verification and limits

The regression suite covers controllers, timing calculations, an empty repository, missing authentication, and a real Octokit two-page traversal whose longest-open result appears after the first 100 PRs. CI builds and runs tests on Node.js 22.

OAuth sign-in and live MongoDB integration require configured services and were not exercised by the mocked suite. Express’s in-memory session store is intended for development; a persistent shared store is needed for multiple production instances. Paginating a very large repository can take multiple GitHub requests and consume its API rate allowance.
