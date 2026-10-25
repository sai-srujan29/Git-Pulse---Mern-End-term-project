import api from './api.js';

export const getRepositories = async () => {
  const response = await api.get('/repos');
  return response.data;
};

export const getPullRequests = async (owner, repo, state = 'all') => {
  const response = await api.get(`/repos/${owner}/${repo}/pulls`, {
    params: { state },
  });
  return response.data;
};

export const getPullRequestDetails = async (owner, repo, pullNumber) => {
  const response = await api.get(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
  return response.data;
};
