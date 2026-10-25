import React, { useState } from 'react';
import {
  GitPullRequest,
  GitCommit,
  FileCode,
  Plus,
  Minus,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const PRDetailView = ({
  prDetails,
  loading,
  onAnalyze,
  analyzing,
}) => {
  const [expandedFiles, setExpandedFiles] = useState({});

  if (loading) {
    return (
      <div className="card pr-detail-card">
        <div className="repo-loading-box" style={{ padding: '40px' }}>
          <div className="spinner" />
          <span>Loading Pull Request diff and files...</span>
        </div>
      </div>
    );
  }

  if (!prDetails) {
    return null;
  }

  const toggleFile = (idx) => {
    setExpandedFiles((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="card pr-detail-card">
      <div className="pr-detail-banner">
        <div className="pr-detail-meta-left">
          <div className="pr-number-title-row">
            <span className="badge badge-open">#{prDetails.number}</span>
            <h2 className="pr-detail-title">{prDetails.title}</h2>
          </div>

          <div className="pr-detail-sub">
            <span className="pr-detail-author">
              Opened by <strong>@{prDetails.author?.login}</strong>
            </span>
            <span>•</span>
            <span className="pr-branches-text">
              <code>{prDetails.head?.ref}</code> into <code>{prDetails.base?.ref}</code>
            </span>
          </div>
        </div>

        <div className="pr-detail-actions">
          <a
            href={prDetails.url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm"
          >
            <span>GitHub</span>
            <ExternalLink size={14} />
          </a>

          <button
            onClick={onAnalyze}
            disabled={analyzing}
            className="btn btn-primary btn-sm analyze-cta-btn"
          >
            <Sparkles size={16} />
            <span>{analyzing ? 'Analyzing with AI...' : 'Run AI PR Audit'}</span>
          </button>
        </div>
      </div>

      <div className="pr-stats-row">
        <div className="pr-stat-box">
          <span className="stat-label">Changed Files</span>
          <span className="stat-number">{prDetails.stats?.changedFiles || 0}</span>
        </div>

        <div className="pr-stat-box">
          <span className="stat-label">Additions</span>
          <span className="stat-number text-success">
            +{prDetails.stats?.additions || 0}
          </span>
        </div>

        <div className="pr-stat-box">
          <span className="stat-label">Deletions</span>
          <span className="stat-number text-danger">
            -{prDetails.stats?.deletions || 0}
          </span>
        </div>

        <div className="pr-stat-box">
          <span className="stat-label">Commits</span>
          <span className="stat-number">{prDetails.stats?.commitsCount || 0}</span>
        </div>
      </div>

      <div className="pr-files-section">
        <div className="section-title-row">
          <FileCode size={18} className="text-accent" />
          <h3 className="section-title">Modified Files ({prDetails.files?.length || 0})</h3>
        </div>

        <div className="files-list">
          {prDetails.files?.map((file, idx) => {
            const isExpanded = expandedFiles[idx] !== false;
            return (
              <div key={file.sha || idx} className="file-diff-item">
                <button
                  type="button"
                  onClick={() => toggleFile(idx)}
                  className="file-diff-header"
                >
                  <div className="file-name-meta">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span className="file-name">{file.filename}</span>
                    <span className="badge badge-file-status">{file.status}</span>
                  </div>

                  <div className="file-diff-counts">
                    <span className="text-success text-xs">+{file.additions}</span>
                    <span className="text-danger text-xs">-{file.deletions}</span>
                  </div>
                </button>

                {isExpanded && file.patch && (
                  <div className="file-diff-patch-container">
                    <pre className="file-diff-code">
                      {file.patch.split('\n').map((line, lIdx) => {
                        let lineClass = 'diff-line-normal';
                        if (line.startsWith('+')) lineClass = 'diff-line-add';
                        else if (line.startsWith('-')) lineClass = 'diff-line-del';
                        else if (line.startsWith('@@')) lineClass = 'diff-line-hunk';

                        return (
                          <div key={lIdx} className={`diff-line ${lineClass}`}>
                            {line}
                          </div>
                        );
                      })}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PRDetailView;
