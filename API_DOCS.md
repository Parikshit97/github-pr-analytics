# GitHub PR Analytics API Documentation

## Introduction

This API provides detailed analytics on GitHub Pull Requests (PRs) for repositories and individual developers.

It helps track:
- Open PRs
- Developer-specific PR metrics (total PRs, merge success rate, average merge time)
- Timing metrics for PRs (average open time, longest open PR)

---

## Base URL

http://localhost:3000/


*(Adjust accordingly if deployed elsewhere)*

---

## Endpoints

### 1. Get Open Pull Requests

GET /repos/:owner/:repo/pulls/open


- **Description:** Returns a list of open PRs for the specified repository.

- **Path Parameters:**

| Parameter | Type   | Description                |
| --------- | ------ | --------------------------|
| owner     | string | GitHub repo owner username |
| repo      | string | GitHub repo name           |

- **Response:**

```json
[
  {
    "title": "Fix issue #123",
    "author": "devUser",
    "created_at": "2024-05-01T10:00:00Z",
    "status": "open"
  },
]

```

- **Error Response:**

```json
[
{
  "message": "Failed to fetch open PRs"
}
]

```
