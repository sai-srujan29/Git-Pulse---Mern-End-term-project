import React from 'react';
import { History, X, ExternalLink, Calendar, ArrowRight } from 'lucide-react';

const ReviewHistoryModal = ({ isOpen, onClose, history, onLoadReview }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <History size={18} className="text-accent" />
            <h3 className="modal-title">Recent PR Audit History</h3>
          </div>
          <button onClick={onClose} className="btn-close" title="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {history.length === 0 ? (
            <div className="empty-state-box">
              <History size={32} className="empty-state-icon" />
              <p className="empty-state-title">No audit history yet</p>
              <p className="empty-state-desc">
                Run an AI PR audit on any pull request to save your review history here.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((rev) => (
                <div key={rev._id} className="history-item">
                  <div className="history-meta">
                    <div className="history-repo-row">
                      <span className="history-repo">{rev.repoFullName}</span>
                      <span className="history-pr-num">#{rev.pullNumber}</span>
                    </div>
                    <h5 className="history-pr-title">{rev.pullTitle}</h5>
                    <span className="history-date">
                      <Calendar size={12} />
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <div className="history-action-side">
                    <span
                      className={`score-badge ${
                        rev.healthScore >= 80
                          ? 'good'
                          : rev.healthScore >= 60
                          ? 'avg'
                          : 'poor'
                      }`}
                    >
                      {rev.healthScore}/100
                    </span>

                    <button
                      onClick={() => {
                        onLoadReview(rev);
                        onClose();
                      }}
                      className="btn btn-ghost btn-xs load-rev-btn"
                    >
                      <span>View</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewHistoryModal;
