import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FolderGit2,
  Users,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="container dashboard-container">
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

        <div className="dashboard-content-grid">
          <div className="card dashboard-card">
            <div className="card-header">
              <div className="card-icon-badge primary">
                <FolderGit2 size={20} />
              </div>
              <div>
                <h3 className="card-title">Connected Repositories</h3>
                <p className="card-subtitle">
                  Select a repository to scan open Pull Requests and run AI reviews
                </p>
              </div>
            </div>
            <div className="card-body">
              <div className="empty-state-box">
                <GitPullRequest size={32} className="empty-state-icon" />
                <p className="empty-state-title">Repository Sync Ready</p>
                <p className="empty-state-desc">
                  Authentication is fully verified. We are ready to load your GitHub repositories and analyze PR health in the next step.
                </p>
              </div>
            </div>
          </div>

          <div className="card dashboard-card">
            <div className="card-header">
              <div className="card-icon-badge secondary">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="card-title">Gemini AI Engine</h3>
                <p className="card-subtitle">
                  Automated code review & security vulnerability audit
                </p>
              </div>
            </div>
            <div className="card-body">
              <div className="ai-status-card">
                <div className="ai-status-indicator">
                  <span className="status-dot-pulse" />
                  <span className="ai-status-text">Engine Online (Gemini 2.5)</span>
                </div>
                <p className="ai-status-desc">
                  Configured to perform contextual diff analysis, line-by-line feedback, risk scoring, and anti-pattern detection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
