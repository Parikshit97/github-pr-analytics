import express from 'express';
import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

app.get('/repos/:owner/:repo/prs/open', async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const response = await octokit.pulls.list({
      owner,
      repo,
      state: 'open',
    });

    const result = response.data.map(pr => ({
      title: pr.title,
      author: pr.user?.login,
      created_at: pr.created_at,
      status: pr.draft ? 'draft' : 'open',
    }));

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching PRs:', error.message);
    res.status(500).json({ message: 'Failed to fetch open PRs' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
