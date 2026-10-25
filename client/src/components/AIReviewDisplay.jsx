import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  Zap,
  Bug,
  FileCheck,
  Code2,
  Copy,
  Check,
  Layers,
  FileText,
  AlertOctagon,
  FlaskConical,
} from 'lucide-react';
import PRHealthScoreGauge from './PRHealthScoreGauge';
import toast from 'react-hot-toast';

const AIReviewDisplay = ({ review }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!review) return null;

  const {
    summary,
    healthScore,
    riskLevel,
    breakdown = {},
    findings = [],
    mergeRecommendation,
    recommendationReason,
  } = review;

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Suggestion copied to clipboard!');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const filteredFindings = findings.filter((f) => {
    if (activeFilter === 'all') return true;
    return f.type === activeFilter;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'security':
        return <Shield size={16} className="text-danger" />;
      case 'performance':
        return <Zap size={16} className="text-accent" />;
      case 'bug':
        return <Bug size={16} className="text-danger" />;
      case 'style':
        return <Code2 size={16} className="text-info" />;
      default:
        return <Sparkles size={16} className="text-accent" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <span className="severity-badge critical">Critical</span>;
      case 'warning':
        return <span className="severity-badge warning">Warning</span>;
      case 'info':
      default:
        return <span className="severity-badge info">Note</span>;
    }
  };

  const exportMarkdownComment = () => {
    const md = `### ⚡ GitPulse AI Code Review & PR Health Audit${review.isDemo ? '\n> 🧪 *Mode: Interactive Demo Sandbox (Simulated PR for testing empty repositories)*\n' : ''}

**PR Health Score**: ${healthScore}/100 • **Risk Level**: ${riskLevel.toUpperCase()} • **Recommendation**: ${mergeRecommendation.toUpperCase()}

> ${summary}

#### 📊 Quality Breakdown
| Metric | Score |
|---|---|
| 📐 Complexity | ${breakdown.complexityScore || 80}/100 |
| 🧪 Testing | ${breakdown.testingScore || 80}/100 |
| 🛡️ Security | ${breakdown.securityScore || 90}/100 |
| 📝 Documentation | ${breakdown.docsScore || 75}/100 |

#### 🔍 Actionable Findings (${findings.length})
${findings
  .map(
    (f, i) =>
      `${i + 1}. **[${f.severity.toUpperCase()}] ${f.title}** (${f.file}${
        f.line ? `:${f.line}` : ''
      })\n   - *Issue*: ${f.description}\n   - *Suggestion*: \`${f.suggestion}\``
  )
  .join('\n\n')}

---
*Generated automatically by [GitPulse](https://github.com/sai-srujan29/Git-Pulse---Mern-End-term-project)*`;

    navigator.clipboard.writeText(md);
    toast.success('Formatted PR comment copied to clipboard!');
  };

  return (
    <div className="card ai-review-card">
      <div className="card-header ai-review-header">
        <div className="header-left-title">
          <div className="card-icon-badge primary">
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="card-title">AI Pull Request Audit</h3>
              {review.isDemo && (
                <span className="badge badge-demo" title="Conducted on simulated PR sandbox data">
                  <FlaskConical size={11} />
                  <span>Demo Audit</span>
                </span>
              )}
            </div>
            <p className="card-subtitle">
              Powered by Google Gemini • Deep contextual code analysis
            </p>
          </div>
        </div>

        <button
          onClick={exportMarkdownComment}
          className="btn btn-ghost btn-sm export-comment-btn"
          title="Copy markdown formatted review to post as a GitHub comment"
        >
          <Copy size={14} />
          <span>Copy PR Comment</span>
        </button>
      </div>

      <div className="card-body ai-review-body">
        {/* Top Hero: Health Score Gauge + Executive Summary */}
        <div className="review-top-grid">
          <PRHealthScoreGauge
            score={healthScore}
            riskLevel={riskLevel}
            mergeRecommendation={mergeRecommendation}
            reason={recommendationReason}
          />

          <div className="executive-summary-box">
            <h4 className="box-heading">Executive Summary</h4>
            <p className="summary-text">{summary}</p>

            <div className="breakdown-grid">
              <div className="breakdown-item">
                <div className="breakdown-label-row">
                  <span className="breakdown-label">
                    <Layers size={12} /> Complexity
                  </span>
                  <span className="breakdown-val">
                    {breakdown.complexityScore || 80}/100
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${breakdown.complexityScore || 80}%` }}
                  />
                </div>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-label-row">
                  <span className="breakdown-label">
                    <FileCheck size={12} /> Testing
                  </span>
                  <span className="breakdown-val">
                    {breakdown.testingScore || 80}/100
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${breakdown.testingScore || 80}%` }}
                  />
                </div>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-label-row">
                  <span className="breakdown-label">
                    <Shield size={12} /> Security
                  </span>
                  <span className="breakdown-val">
                    {breakdown.securityScore || 90}/100
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${breakdown.securityScore || 90}%` }}
                  />
                </div>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-label-row">
                  <span className="breakdown-label">
                    <FileText size={12} /> Documentation
                  </span>
                  <span className="breakdown-val">
                    {breakdown.docsScore || 75}/100
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${breakdown.docsScore || 75}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Findings Section */}
        <div className="findings-section">
          <div className="findings-header-row">
            <h4 className="findings-title">
              Actionable Findings ({findings.length})
            </h4>

            <div className="findings-filter-tabs">
              {['all', 'security', 'bug', 'performance', 'style', 'improvement'].map(
                (tab) => {
                  const count =
                    tab === 'all'
                      ? findings.length
                      : findings.filter((f) => f.type === tab).length;
                  if (tab !== 'all' && count === 0) return null;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveFilter(tab)}
                      className={`filter-pill ${
                        activeFilter === tab ? 'active' : ''
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {filteredFindings.length === 0 ? (
            <div className="clean-findings-box">
              <FileCheck size={28} className="text-success" />
              <p className="clean-text">No issues flagged in this category!</p>
            </div>
          ) : (
            <div className="findings-list">
              {filteredFindings.map((finding, idx) => (
                <div key={idx} className="finding-item-card">
                  <div className="finding-item-top">
                    <div className="finding-icon-title">
                      {getTypeIcon(finding.type)}
                      <h5 className="finding-title">{finding.title}</h5>
                    </div>
                    <div className="finding-badges">
                      {getSeverityBadge(finding.severity)}
                      {finding.file && (
                        <code className="finding-file-badge">
                          {finding.file}
                          {finding.line ? `:${finding.line}` : ''}
                        </code>
                      )}
                    </div>
                  </div>

                  <p className="finding-desc">{finding.description}</p>

                  {finding.suggestion && (
                    <div className="finding-suggestion-box">
                      <div className="suggestion-header">
                        <span className="suggestion-label">
                          Recommended Action / Code Fix:
                        </span>
                        <button
                          onClick={() => handleCopy(finding.suggestion, idx)}
                          className="btn-copy"
                          title="Copy suggestion"
                        >
                          {copiedIdx === idx ? (
                            <Check size={14} className="text-success" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                      <pre className="suggestion-code">
                        {finding.suggestion}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIReviewDisplay;
