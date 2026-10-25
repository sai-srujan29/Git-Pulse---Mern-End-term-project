import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

const PRHealthScoreGauge = ({ score, riskLevel, mergeRecommendation, reason }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = '#3fb950'; // Green
  if (score < 60) {
    scoreColor = '#f85149'; // Red
  } else if (score < 80) {
    scoreColor = '#d29922'; // Yellow/Amber
  }

  const getRecommendationBadge = () => {
    switch (mergeRecommendation) {
      case 'ready':
        return (
          <span className="badge badge-ready">
            <CheckCircle size={14} />
            <span>Ready to Merge</span>
          </span>
        );
      case 'blocked':
        return (
          <span className="badge badge-blocked">
            <XCircle size={14} />
            <span>Merge Blocked</span>
          </span>
        );
      case 'needs_work':
      default:
        return (
          <span className="badge badge-needs-work">
            <AlertTriangle size={14} />
            <span>Needs Revisions</span>
          </span>
        );
    }
  };

  const getRiskBadge = () => {
    switch (riskLevel) {
      case 'high':
        return <span className="risk-pill high">High Risk</span>;
      case 'medium':
        return <span className="risk-pill medium">Medium Risk</span>;
      case 'low':
      default:
        return <span className="risk-pill low">Low Risk</span>;
    }
  };

  return (
    <div className="health-gauge-card">
      <div className="gauge-visual-container">
        <svg className="gauge-svg" width="140" height="140" viewBox="0 0 140 140">
          <circle
            className="gauge-bg"
            cx="70"
            cy="70"
            r={radius}
            strokeWidth="10"
          />
          <circle
            className="gauge-progress"
            cx="70"
            cy="70"
            r={radius}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke={scoreColor}
          />
        </svg>
        <div className="gauge-score-center">
          <span className="gauge-number" style={{ color: scoreColor }}>
            {score}
          </span>
          <span className="gauge-max">/100</span>
        </div>
      </div>

      <div className="gauge-meta">
        <div className="gauge-badges-row">
          {getRecommendationBadge()}
          {getRiskBadge()}
        </div>
        <p className="gauge-reason">{reason}</p>
      </div>
    </div>
  );
};

export default PRHealthScoreGauge;
