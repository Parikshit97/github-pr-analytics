# GitHub PR Analytics API — Usage Guide

## Overview

This API provides analytics for GitHub Pull Requests in a repository, including developer-specific stats such as total PRs, success rate, and average merge time.

The API is built with Node.js and exposes endpoints documented using Swagger UI.

---

## Base URL

http://localhost:3000/


*Adjust the host and port depending on your deployment or Docker setup.*

---

## Authentication

- The API requires a **GitHub Personal Access Token** for accessing the GitHub API.
- Set the token as an environment variable named `GITHUB_TOKEN` before running the service.

Example (Linux/macOS):

```bash
export GITHUB_TOKEN=your_github_pat_here

Or in Docker Compose:

environment:
  - GITHUB_TOKEN=your_github_pat_here
