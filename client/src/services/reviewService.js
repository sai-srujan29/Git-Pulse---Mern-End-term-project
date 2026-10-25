import api from './api.js';

export const analyzePullRequest = async (owner, repo, pullNumber, prData = null) => {
  const response = await api.post('/reviews/analyze', {
    owner,
    repo,
    pullNumber,
    prData,
  });
  return response.data;
};

export const getReviewHistory = async () => {
  const response = await api.get('/reviews/history');
  return response.data;
};

export const getReviewById = async (id) => {
  const response = await api.get(`/reviews/${id}`);
  return response.data;
};
