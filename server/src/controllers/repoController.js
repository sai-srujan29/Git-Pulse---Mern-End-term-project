import {
  getUserRepositories,
  getRepositoryPullRequests,
  getPullRequestDetails,
} from '../services/githubService.js';

export const getRepositories = async (req, res, next) => {
  try {
    const repos = await getUserRepositories(req.user._id);
    res.status(200).json({
      success: true,
      count: repos.length,
      repositories: repos,
    });
  } catch (error) {
    next(error);
  }
};

export const getPullRequests = async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const { state } = req.query;

    const pulls = await getRepositoryPullRequests(
      req.user._id,
      owner,
      repo,
      state || 'all'
    );

    res.status(200).json({
      success: true,
      count: pulls.length,
      pullRequests: pulls,
    });
  } catch (error) {
    next(error);
  }
};

export const getSinglePullRequest = async (req, res, next) => {
  try {
    const { owner, repo, pullNumber } = req.params;

    const pullRequest = await getPullRequestDetails(
      req.user._id,
      owner,
      repo,
      pullNumber
    );

    res.status(200).json({
      success: true,
      pullRequest,
    });
  } catch (error) {
    next(error);
  }
};
