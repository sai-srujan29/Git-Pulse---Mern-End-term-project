import React, { useState } from 'react';
import {
  GitPullRequest,
  GitCommit,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

const PRList = ({
  pullRequests,
  selectedPR,
  onSelectPR,
  loading,
  repoName,
}) => {
  const [filterState, setFilterState] = useState('all');

  const filtered = pullRequests.filter((pr) => {
    if (filterState === 'all') return true;
    return pr.state === filterState;
  });

  const getStatusBadge = (pr) => {
    if (pr.mergedAt) {
      return (
        <span className="badge badge-merged">
          <CheckCircle2 size={12} />
          <span>Merged</span>
        </span>
      );
    }
    if (pr.state === 'closed') {
      return (
        <span className="badge badge-closed">
          <XCircle size={12} />
          <span>Closed</span>
        </span>
      );
    }
    return (
      <span className="badge badge-open">
        <GitPullRequest size={12} />
        <span>Open</span>
      </span>
    );
  };

  return (
    <div className="card pr-list-card">
      <div className="card-header pr-list-header">
        <div className="header-left">
          <div className="card-icon-badge secondary">
            <GitPullRequest size={20} />
          </div>
          <div>
            <h3 className="card-title">Pull Requests</h3>
            <p className="card-subtitle">
              {repoName ? `Showing PRs for ${repoName}` : 'Select a repository first'}
            </p>
          </div>
        </div>

        <div className="filter-pill-group">
          <button
            onClick={() => setFilterState('all')}
            className={`filter-pill ${filterState === 'all' ? 'active' : ''}`}
          >
            All ({pullRequests.length})
          </button>
          <button
            onClick={() => setFilterState('open')}
            className={`filter-pill ${filterState === 'open' ? 'active' : ''}`}
          >
            Open ({pullRequests.filter((p) => p.state === 'open').length})
          </button>
          <button
            onClick={() => setFilterState('closed')}
            className={`filter-pill ${filterState === 'closed' ? 'active' : ''}`}
          >
            Closed ({pullRequests.filter((p) => p.state === 'closed').length})
          </button>
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="repo-loading-box">
            <div className="spinner" />
            <span>Fetching pull requests from GitHub...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state-box">
            <GitPullRequest size={32} className="empty-state-icon" />
            <p className="empty-state-title">No pull requests found</p>
            <p className="empty-state-desc">
              This repository doesn't have any {filterState !== 'all' ? filterState : ''} pull requests yet.
            </p>
          </div>
        ) : (
          <div className="pr-items-list">
            {filtered.map((pr) => {
              const isSelected = selectedPR?.number === pr.number;
              return (
                <button
                  key={pr.id}
                  onClick={() => onSelectPR(pr)}
                  className={`pr-item ${isSelected ? 'selected' : ''}`}
                >
                  <div className="pr-item-top">
                    {getStatusBadge(pr)}
                    <span className="pr-number">#{pr.number}</span>
                    <h4 className="pr-title">{pr.title}</h4>
                  </div>

                  <div className="pr-item-details">
                    <div className="pr-branch-pill">
                      <code>{pr.headBranch}</code>
                      <ArrowRight size={12} />
                      <code>{pr.baseBranch}</code>
                    </div>

                    <div className="pr-meta-info">
                      <div className="pr-author">
                        <img
                          src={pr.user?.avatarUrl || 'https://github.com/ghost.png'}
                          alt={pr.user?.login}
                          className="pr-author-avatar"
                        />
                        <span>{pr.user?.login}</span>
                      </div>

                      <span className="pr-date">
                        <Clock size={12} />
                        <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                      </span>

                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="pr-external-link"
                        title="View on GitHub"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PRList;
