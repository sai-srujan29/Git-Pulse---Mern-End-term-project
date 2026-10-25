import axios from 'axios';
import User from '../models/User.js';

const getGithubClient = async (userId) => {
  const user = await User.findById(userId).select('+accessToken');
  if (!user || !user.accessToken) {
    const error = new Error('GitHub access token not found for user');
    error.statusCode = 401;
    throw error;
  }

  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
};

export const getUserRepositories = async (userId) => {
  const client = await getGithubClient(userId);
  const response = await client.get('/user/repos', {
    params: {
      sort: 'updated',
      direction: 'desc',
      per_page: 100,
      affiliation: 'owner,collaborator,organization_member',
    },
  });

  return response.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner.login,
    ownerAvatar: repo.owner.avatar_url,
    isPrivate: repo.private,
    description: repo.description,
    url: repo.html_url,
    defaultBranch: repo.default_branch,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    language: repo.language,
    updatedAt: repo.updated_at,
  }));
};

export const getRepositoryPullRequests = async (userId, owner, repo, state = 'all') => {
  const client = await getGithubClient(userId);
  const response = await client.get(`/repos/${owner}/${repo}/pulls`, {
    params: {
      state,
      per_page: 30,
      sort: 'updated',
      direction: 'desc',
    },
  });

  return response.data.map((pr) => ({
    id: pr.id,
    number: pr.number,
    title: pr.title,
    state: pr.state,
    draft: pr.draft,
    body: pr.body || '',
    user: {
      login: pr.user.login,
      avatarUrl: pr.user.avatar_url,
    },
    headBranch: pr.head.ref,
    baseBranch: pr.base.ref,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    closedAt: pr.closed_at,
    mergedAt: pr.merged_at,
    url: pr.html_url,
  }));
};

export const getPullRequestDetails = async (userId, owner, repo, pullNumber) => {
  const client = await getGithubClient(userId);

  const [prRes, filesRes, commitsRes] = await Promise.all([
    client.get(`/repos/${owner}/${repo}/pulls/${pullNumber}`),
    client.get(`/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=100`),
    client.get(`/repos/${owner}/${repo}/pulls/${pullNumber}/commits?per_page=50`),
  ]);

  const pr = prRes.data;
  const files = filesRes.data;
  const commits = commitsRes.data;

  return {
    id: pr.id,
    number: pr.number,
    title: pr.title,
    state: pr.state,
    body: pr.body || '',
    author: {
      login: pr.user.login,
      avatarUrl: pr.user.avatar_url,
    },
    head: {
      ref: pr.head.ref,
      sha: pr.head.sha,
    },
    base: {
      ref: pr.base.ref,
      sha: pr.base.sha,
    },
    stats: {
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
      commitsCount: pr.commits,
    },
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    url: pr.html_url,
    files: files.map((file) => ({
      sha: file.sha,
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch || '',
    })),
    commits: commits.map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author?.name,
      date: c.commit.author?.date,
    })),
  };
};
