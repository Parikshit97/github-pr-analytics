# 📊 GitHub PR Analytics API

A RESTful API built with **TypeScript**, **Node.js**, and **Express.js** to provide insights into pull request (PR) activity in GitHub repositories. It offers developer-wise analytics, PR timing metrics, and is powered by GitHub’s public API.

---

## 🚀 Features

- 🔍 Get open PRs for any public GitHub repo
- 📈 Analytics per developer:
  - Total PRs
  - Success rate (merged vs. opened)
  - Average merge time
- ⏱️ PR timing metrics:
  - Average time open
  - Longest open PRs
- 🧾 Swagger-based API documentation
- ✅ Deployed on [Render](https://render.com)

---

## 📌 Live API

> Base URL: `https://github-pr-analytics.onrender.com`

Example endpoint:
```
GET /repos/{owner}/{repo}/dev/{developer}/analytics
```

Try out the [Swagger UI](https://github-pr-analytics.onrender.com) for interactive documentation.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **GitHub Integration**: Octokit
- **Docs**: Swagger (OpenAPI)
- **Deployment**: Render

---

## 🧪 Local Development

### Prerequisites
- Node.js (>= 18)
- MongoDB running locally or Atlas URI
- GitHub Personal Access Token (add to `.env`)

### Setup

```bash
git clone https://github.com/your-username/github-pr-analytics.git
cd github-pr-analytics
npm install
```

Create a `.env` file:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
GITHUB_TOKEN=your_github_token
BASE_URL=http://localhost:3000
```

### Run the server

```bash
npm run dev
```

---

## 📦 API Endpoints

### Get Open PRs
```
GET /repos/:owner/:repo/prs
```

### Get Developer Analytics
```
GET /repos/:owner/:repo/dev/:developer/analytics
```

### Get PR Timing Metrics
```
GET /repos/:owner/:repo/prs/metrics
```

All endpoints are documented in [Swagger UI](https://github-pr-analytics.onrender.com).

---

## 🧼 Project Structure

```
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── utils/
│   ├── swagger.ts
│   └── app.ts
├── .env
├── tsconfig.json
└── README.md
```
---

## 🙋‍♂️ Author

**Parikshit Narang**

- GitHub: [@Parikshit97](https://github.com/Parikshit97)
