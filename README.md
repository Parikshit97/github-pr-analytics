# GitHub PR Analytics

GitHub PR Analytics is a backend service that provides analytics for GitHub pull requests, such as open durations, average merge time, and longest open PRs. It is built with Node.js, TypeScript, Express, and MongoDB, and can be run using Docker or deployed to platforms like Render.

## 🌐 Deployment Info

This application is deployed on [Render](https://render.com) using their free tier infrastructure. It uses MongoDB Atlas as the managed database service, where all authenticated user requests and analytics data are securely logged and stored. You can access the live service here:  

🌐 **Live URL:** [https://github-pr-analytics.onrender.com/docs](https://github-pr-analytics.onrender.com)  
> Requires GitHub login for access.

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
│   ├── clients/             # External service clients (e.g., GitHub Octokit)
│   ├── config/              # Environment-specific configurations (development/production)
│   ├── controllers/         # Route handler logic for each API endpoint
│   ├── middleware/          # Express middleware (authentication, error handling, sessions)
│   ├── routes/              # Express route definitions
│   ├── services/            # Core business logic and data processing
│   ├── types/               # TypeScript interfaces and type definitions
│   ├── index.ts             # App entry point (server setup)
│   ├── mongoCRUD.ts         # MongoDB utility functions for logging/storing analytics
│   └── swagger.ts           # Swagger documentation setup
├── tests/                   # Unit and integration tests
├── AI_USAGE.md              # Documentation on AI integration (if applicable)
├── API_DOCS.md              # Detailed API documentation
├── dist/                    # Compiled output after TypeScript build
├── docker-compose.dev.yml   # Docker Compose configuration for development
├── docker-compose.prod.yml  # Docker Compose configuration for production
├── Dockerfile               # Base Docker image setup
├── README.md
└── tsconfig.json            # TypeScript configuration

```

---

## 🧑‍💻 Local Development

### 1. Clone the repo
```bash
git clone git@github.com:Parikshit97/github-pr-analytics.git
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

> Ensure `src/config/development.json` is configured correctly and MongoDB running locally.
> Currently, development.json is configured to connect to a MongoDB instance running in a Docker container.

### 4. Using Docker Compose
```bash
docker-compose up --build
```
---

## 🔐 Authentication

- Uses GitHub OAuth App
- Required environment variables:
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `GITHUB_CALLBACK_URL`

---

## ✅ Test Strategy

This project uses **[Vitest](https://vitest.dev/)** for unit testing and mocking.

- All service methods are covered with unit tests using mock responses for the GitHub API via the Octokit client.
- MongoDB operations are mocked to prevent side effects or the need for a live database during test runs.
- Tests validate both successful API flows and error-handling branches.

To run tests locally:

```bash
npm test
```

> 📂 Test files are located under the `tests/` directory and follow the `*.test.ts` naming convention.


---
