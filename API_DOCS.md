# GitHub PR Analytics API Documentation

## 📘 Introduction

This API provides analytics on GitHub Pull Requests (PRs) for repositories and individual developers.

It helps track:
- Open PRs
- Developer-specific PR metrics (total PRs, merge success rate, average merge time)
- Timing metrics for PRs (average open duration, longest open PR)

Authentication is handled via **GitHub OAuth** or **Personal Access Token** (for tools like Postman).
---

## 🌐 Base URL

```
https://github-pr-analytics.onrender.com/
```

> For local development, use `http://localhost:3000/` (using Postman)

---

## 📁 Endpoints

---

### 📌 Get Open Pull Requests

**GET** `/repos/:owner/:repo/pulls/open`

Returns a list of open PRs for the specified GitHub repository.

#### 🔸 Path Parameters

| Parameter | Type   | Description                |
| --------- | ------ | -------------------------- |
| `owner`   | string | GitHub repository owner     |
| `repo`    | string | GitHub repository name      |

### Curl for Postman Request

```
curl -X 'GET' \
  'https://github-pr-analytics.onrender.com/repos/Parikshit97/alertmonitor/prs/open' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <your-github-token>'

  ```


#### ✅ Example Response

```json
[
  {
    "title": "Fix issue #123",
    "author": "devUser",
    "created_at": "2024-05-01T10:00:00Z",
    "status": "open"
  }
]
```

#### ❌ Error Response

```json
{
  "message": "Failed to fetch open PRs"
}
```

---

### 📌 Get PR Timing Metrics

**GET** `/repos/:owner/:repo/prs/timing`

Returns analytics on:
- Average duration for closed PRs
- Durations of open PRs
- Longest open PR

#### 🔸 Path Parameters

| Parameter | Type   | Description                |
| --------- | ------ | -------------------------- |
| `owner`   | string | GitHub repository owner     |
| `repo`    | string | GitHub repository name      |

### Curl for Postman Request

```
curl -X 'GET' \
  'https://github-pr-analytics.onrender.com/repos/Parikshit97/alertmonitor/prs/timing' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <your-github-token>'

  ```

#### ✅ Example Response

```json
{
  "open_durations_ms": [123456, 654321],
  "average_closed_duration_ms": 245000,
  "longest_open_pr": {
    "title": "Add new caching layer",
    "author": "user123",
    "created_at": "2024-04-28T12:00:00Z",
    "duration_open_ms": 9876543
  }
}
```

#### ❌ Error Response

```json
{
  "message": "Failed to fetch PR timing metrics"
}
```

---

### 📌 Get Developer PR Stats

**GET** `/repos/:owner/:repo/prs/developer/:developerId`

Returns PR analytics for a specific developer in a repo:
- Total number of PRs
- Success (merged) rate
- Average time to merge

### Curl request for Postman

```
curl --location 'https://github-pr-analytics.onrender.com/repos/Parikshit97/alertmonitor/dev/Parikshit97/analytics' \
-H 'accept: application/json' \
 -H 'Authorization: Bearer <your-github-token>'
```

#### 🔸 Path Parameters

| Parameter     | Type   | Description                     |
| ------------- | ------ | ------------------------------- |
| `owner`       | string | GitHub repository owner         |
| `repo`        | string | GitHub repository name          |
| `developerId` | string | GitHub username of the developer|

#### ✅ Example Response

```json
{
  "developer": "devUser",
  "total_prs": 10,
  "merged_prs": 8,
  "success_rate": 0.8,
  "average_merge_time_ms": 432000
}
```

#### ❌ Error Response

```json
{
  "message": "Failed to fetch developer PR analytics"
}
```

---

## 📦 Notes

- All endpoints require authentication via GitHub OAuth.
- MongoDB Atlas is used to log and persist requests and analytics data.
- The project is deployed as a Docker container on [Render](https://render.com).

---

For more information, visit the [project repository](https://github.com/<your-username>/github-pr-analytics).

