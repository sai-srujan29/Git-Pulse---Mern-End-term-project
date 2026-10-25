import React, { useState } from 'react';
import { Search, FolderGit2, Star, GitFork, Lock, Globe, ChevronRight } from 'lucide-react';

const RepoSelector = ({ repositories, selectedRepo, onSelectRepo, loading }) => {
  const [search, setSearch] = useState('');

  const filtered = repositories.filter((repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="repo-selector-card card">
      <div className="card-header">
        <div className="card-icon-badge primary">
          <FolderGit2 size={20} />
        </div>
        <div>
          <h3 className="card-title">Select Repository</h3>
          <p className="card-subtitle">
            Choose a repository to view pull requests and run automated PR health checks
          </p>
        </div>
      </div>

      <div className="card-body">
        <div className="repo-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="input search-input"
            placeholder="Search repositories by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="repo-loading-box">
            <div className="spinner" />
            <span>Loading your GitHub repositories...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state-box">
            <FolderGit2 size={28} className="empty-state-icon" />
            <p className="empty-state-title">No repositories found</p>
            <p className="empty-state-desc">
              {search
                ? 'Try a different search term.'
                : 'No repositories found in your GitHub account.'}
            </p>
          </div>
        ) : (
          <div className="repo-list">
            {filtered.map((repo) => {
              const isSelected = selectedRepo?.id === repo.id;
              return (
                <button
                  key={repo.id}
                  onClick={() => onSelectRepo(repo)}
                  className={`repo-item ${isSelected ? 'selected' : ''}`}
                >
                  <div className="repo-item-main">
                    <div className="repo-item-title-row">
                      <span className="repo-item-name">{repo.name}</span>
                      <span className={`badge ${repo.isPrivate ? 'badge-private' : 'badge-public'}`}>
                        {repo.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                        <span>{repo.isPrivate ? 'Private' : 'Public'}</span>
                      </span>
                    </div>
                    {repo.description && (
                      <p className="repo-item-desc">{repo.description}</p>
                    )}
                    <div className="repo-item-meta">
                      {repo.language && (
                        <span className="repo-meta-tag">
                          <span className="language-dot" />
                          <span>{repo.language}</span>
                        </span>
                      )}
                      {repo.stars > 0 && (
                        <span className="repo-meta-tag">
                          <Star size={12} />
                          <span>{repo.stars}</span>
                        </span>
                      )}
                      {repo.forks > 0 && (
                        <span className="repo-meta-tag">
                          <GitFork size={12} />
                          <span>{repo.forks}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="repo-arrow" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoSelector;
