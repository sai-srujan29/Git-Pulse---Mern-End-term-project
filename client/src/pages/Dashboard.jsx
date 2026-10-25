import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FolderGit2,
  Users,
  ExternalLink,
  CheckCircle2,
  GitPullRequest,
  Sparkles,
  History,
} from 'lucide-react';
import RepoSelector from '../components/RepoSelector';
import PRList from '../components/PRList';
import PRDetailView from '../components/PRDetailView';
import AIReviewDisplay from '../components/AIReviewDisplay';
import ReviewHistoryModal from '../components/ReviewHistoryModal';
import {
  getRepositories,
  getPullRequests,
  getPullRequestDetails,
} from '../services/repoService';
import { analyzePullRequest, getReviewHistory } from '../services/reviewService';
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

  const [currentReview, setCurrentReview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const handleOpenHistory = async () => {
    try {
      const data = await getReviewHistory();
      if (data && data.reviews) {
        setHistoryList(data.reviews);
      }
      setHistoryModalOpen(true);
    } catch (e) {
      toast.error('Failed to load review history.');
    }
  };

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
    setCurrentReview(null);
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
    setCurrentReview(null);
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

  const handleRunAIAnalysis = async () => {
    if (!prDetails || !selectedRepo) return;
    setAnalyzing(true);
    const toastId = toast.loading('Running Gemini AI code audit...');

    try {
      const data = await analyzePullRequest(
        selectedRepo.owner,
        selectedRepo.name,
        prDetails.number
      );

      if (data && data.review) {
        setCurrentReview(data.review);
        toast.success('AI Audit completed successfully!', { id: toastId });
      } else {
        toast.error('Failed to generate review.', { id: toastId });
      }
    } catch (err) {
      toast.error('Error generating AI audit. Please retry.', { id: toastId });
    } finally {
      setAnalyzing(false);
    }
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

            <button
              onClick={handleOpenHistory}
              className="btn btn-ghost btn-sm stat-history-btn"
              title="View past PR review reports"
            >
              <History size={16} />
              <span>Audit History</span>
            </button>
          </div>
        </div>

        {/* Workspace Layout: Left Sidebar = Repos + PR list; Right Main = AI Review + PR Diff */}
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
            {currentReview && (
              <AIReviewDisplay review={currentReview} />
            )}

            {selectedPR ? (
              <PRDetailView
                prDetails={prDetails}
                loading={loadingDetails}
                onAnalyze={handleRunAIAnalysis}
                analyzing={analyzing}
              />
            ) : selectedRepo ? (
              <div className="card empty-workspace-card">
                <div className="empty-state-box">
                  <div className="card-icon-badge secondary" style={{ width: 56, height: 56 }}>
                    <GitPullRequest size={28} />
                  </div>
                  <h3 className="empty-state-title" style={{ fontSize: '1.25rem' }}>
                    0 Pull Requests in {selectedRepo.name}
                  </h3>
                  <p className="empty-state-desc" style={{ maxWidth: 480 }}>
                    All code in this repository was committed directly to <code>main</code>, so there are no open or closed pull requests on GitHub yet.
                  </p>
                  <div style={{ marginTop: '16px' }}>
                    <a
                      href={`${selectedRepo.url}/compare`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                    >
                      <ExternalLink size={16} />
                      <span>Open a Pull Request on GitHub</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card empty-workspace-card">
                <div className="empty-state-box">
                  <GitPullRequest size={48} className="empty-state-icon" />
                  <p className="empty-state-title">No Repository Selected</p>
                  <p className="empty-state-desc">
                    Choose a repository from the left panel to begin.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <ReviewHistoryModal
          isOpen={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          history={historyList}
          onLoadReview={(rev) => setCurrentReview(rev)}
        />
      </div>
    </div>
  );
};

export default Dashboard;

