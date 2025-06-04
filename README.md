# GitHub PR Analytics

GitHub PR Analytics is a backend service that provides analytics for GitHub pull requests, such as open durations, average merge time, and longest open PRs. It is built with Node.js, TypeScript, Express, and MongoDB, and can be run using Docker or deployed to platforms like Render.

---

## 🚀 Features

- GitHub OAuth-based authentication  
- Fetches PR data using GitHub API  
- Computes useful analytics:
  - Average PR merge time  
  - Longest open PR  
  - Open/Closed PR durations  
- MongoDB Atlas integration  
- Dockerized using Docker Compose

---

## 🏗️ Project Structure

```
.
├── src/
│   ├── config/              # Environment-specific configurations
│   ├── controllers/         # Route handler logic
│   ├── middleware/          # Middleware (auth, error handling)
│   ├── routes/              # Express routes
│   ├── services/            # Business logic
│   └── index.ts             # App entry point
├── dist/                    # Compiled output
├── docker-compose.yml       # Docker config for dev/prod
├── Dockerfile
└── README.md
```

---

## 🧑‍💻 Local Development

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/github-pr-analytics.git
cd github-pr-analytics
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run with local config
```bash
NODE_ENV=development NODE_CONFIG_DIR=./src/config npm run dev
```

> Ensure `src/config/development.json` is configured correctly.

### 4. Using Docker Compose
```bash
docker-compose up --build
```

> It uses `.env.development` by default.

---

## 🌐 Production Deployment (Render)

### 1. Connect GitHub repo to Render
- Select **Docker** for deployment method

### 2. Set up Render settings
- **Build Command**:
  ```bash
  npm install && npm run build
  ```
- **Start Command**:
  ```bash
  NODE_ENV=production NODE_CONFIG_DIR=./src/config node dist/index.js
  ```

### 3. Configure Environment Variables in Render Dashboard
Set all required values as secrets.

---

## 🔐 Authentication

- Uses GitHub OAuth App
- Required environment variables:
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `GITHUB_CALLBACK_URL`

---

## 📦 Environment Variables

| Key                    | Description                                     |
|------------------------|-------------------------------------------------|
| `PORT`                 | Port to run the app                             |
| `MONGODB_URI`          | MongoDB Atlas connection string                 |
| `SESSION_SECRET`       | Session key                                     |
| `GITHUB_CLIENT_ID`     | GitHub OAuth App Client ID                      |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret                  |
| `GITHUB_CALLBACK_URL`  | GitHub OAuth redirect URI                       |
| `BASE_URL`             | App's base URL                                  |
| `GITHUB_TOKEN`         | (Optional) GitHub Personal Access Token         |

---

## 📈 API Endpoints

> All endpoints require GitHub OAuth authentication

- `GET /repos/:owner/:repo/prs/timing`  
  → Returns timing metrics (average/longest open PR)

- `GET /repos/:owner/:repo/prs/developer/:developerId`  
  → Developer-specific analytics

---

## 🧪 Testing

```bash
npm test
```

---
