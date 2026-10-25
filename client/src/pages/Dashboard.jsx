import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FolderGit2,
  Users,
  ExternalLink,
  CheckCircle2,
  GitPullRequest,
  Sparkles,
} from 'lucide-react';
import RepoSelector from '../components/RepoSelector';
import PRList from '../components/PRList';
import PRDetailView from '../components/PRDetailView';
import {
  getRepositories,
  getPullRequests,
  getPullRequestDetails,
} from '../services/repoService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState(null);

  const [pullRequests, setPullRequests] = useState([]);
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);

  const [prDetails, setPrDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoadingRepos(true);
        const data = await getRepositories();
        if (data && data.repositories) {
          setRepositories(data.repositories);
          if (data.repositories.length > 0) {
            handleSelectRepo(data.repositories[0]);
          }
        }
      } catch (err) {
        toast.error('Failed to load GitHub repositories.');
      } finally {
        setLoadingRepos(false);
      }
    };

    fetchRepos();
  }, []);

  const handleSelectRepo = async (repo) => {
    setSelectedRepo(repo);
    setSelectedPR(null);
    setPrDetails(null);
    setLoadingPRs(true);

    try {
      const data = await getPullRequests(repo.owner, repo.name);
      setPullRequests(data.pullRequests || []);
      if (data.pullRequests && data.pullRequests.length > 0) {
        handleSelectPR(data.pullRequests[0], repo);
      }
    } catch (err) {
      toast.error(`Failed to load pull requests for ${repo.name}`);
    } finally {
      setLoadingPRs(false);
    }
  };

  const handleSelectPR = async (pr, repo = selectedRepo) => {
    setSelectedPR(pr);
    setLoadingDetails(true);

    try {
      const activeRepo = repo || selectedRepo;
      const data = await getPullRequestDetails(
        activeRepo.owner,
        activeRepo.name,
        pr.number
      );
      setPrDetails(data.pullRequest || null);
    } catch (err) {
      toast.error(`Failed to load details for PR #${pr.number}`);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRunAIAnalysis = () => {
    if (!prDetails) return;
    toast.success(`Starting AI Audit on PR #${prDetails.number}...`);
    // This connects to Task 4 / 5 AI Review engine
  };

  return (
    <div className="dashboard-page">
      <div className="container dashboard-container">
        {/* User Hero Banner */}
        <div className="user-profile-card">
          <div className="user-profile-header">
            <img
              src={user?.avatarUrl || 'https://github.com/ghost.png'}
              alt={user?.username}
              className="user-profile-avatar"
            />
            <div className="user-profile-info">
              <div className="user-profile-name-row">
                <h1 className="user-profile-name">
                  {user?.displayName || user?.username}
                </h1>
                <a
                  href={user?.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost btn-xs external-profile-link"
                >
                  <span>@{user?.username}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <p className="user-profile-bio">
                {user?.bio || 'Ready to analyze pull requests and maintain pristine code quality.'}
              </p>
            </div>
          </div>

          <div className="user-stats-bar">
            <div className="stat-item">
              <FolderGit2 size={18} className="stat-icon" />
              <div className="stat-meta">
                <span className="stat-value">{user?.publicRepos || 0}</span>
                <span className="stat-label">Public Repos</span>
              </div>
            </div>

            <div className="stat-item">
              <Users size={18} className="stat-icon" />
              <div className="stat-meta">
                <span className="stat-value">{user?.followers || 0}</span>
                <span className="stat-label">Followers</span>
              </div>
            </div>

            <div className="stat-item">
              <CheckCircle2 size={18} className="stat-icon success" />
              <div className="stat-meta">
                <span className="stat-value">Active</span>
                <span className="stat-label">OAuth Session</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Layout: Left Sidebar = Repos + PR list; Right Main = PR Diff & Audit */}
        <div className="workspace-layout">
          <div className="workspace-sidebar">
            <RepoSelector
              repositories={repositories}
              selectedRepo={selectedRepo}
              onSelectRepo={handleSelectRepo}
              loading={loadingRepos}
            />

            {selectedRepo && (
              <PRList
                pullRequests={pullRequests}
                selectedPR={selectedPR}
                onSelectPR={handleSelectPR}
                loading={loadingPRs}
                repoName={selectedRepo.name}
              />
            )}
          </div>

          <div className="workspace-main">
            {selectedPR ? (
              <PRDetailView
                prDetails={prDetails}
                loading={loadingDetails}
                onAnalyze={handleRunAIAnalysis}
                analyzing={analyzing}
              />
            ) : (
              <div className="card empty-workspace-card">
                <div className="empty-state-box">
                  <GitPullRequest size={48} className="empty-state-icon" />
                  <p className="empty-state-title">No Pull Request Selected</p>
                  <p className="empty-state-desc">
                    Choose a repository from the left panel and select any pull request to view changed files, diffs, and generate AI insights.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
