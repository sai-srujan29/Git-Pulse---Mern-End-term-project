import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, Zap, GitPullRequest, ArrowRight } from 'lucide-react';
import GithubIcon from '../components/GithubIcon';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="login-page">
      <div className="container hero-container">
        <div className="hero-badge">
          <Sparkles size={14} className="hero-badge-icon" />
          <span>Next-Gen GitHub PR Intelligence</span>
        </div>

        <h1 className="hero-title">
          The Intelligent Pulse of <br />
          <span className="gradient-text">Your Pull Requests</span>
        </h1>

        <p className="hero-subtitle">
          Automated code health metrics, security vulnerability radar, and deep AI-driven code reviews tailored for engineering teams who value speed and craft.
        </p>

        <div className="hero-cta-wrapper">
          <button
            onClick={loginWithGithub}
            className="btn btn-primary btn-lg auth-btn"
          >
            <GithubIcon size={20} />
            <span>Continue with GitHub</span>
            <ArrowRight size={18} />
          </button>
          <span className="cta-caption">
            Instant read-only analysis • No credit card required
          </span>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={24} color="#6366f1" />
            </div>
            <h3 className="feature-title">AI Code Reviewer</h3>
            <p className="feature-desc">
              Context-aware pull request summaries, performance bottlenecks, and automated actionable refactor suggestions powered by Google Gemini.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <GitPullRequest size={24} color="#8b5cf6" />
            </div>
            <h3 className="feature-title">PR Health Score</h3>
            <p className="feature-desc">
              Instant 0-100 score analyzing diff sizes, test coverage ratio, documentation parity, and merge risk indicators.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={24} color="#10b981" />
            </div>
            <h3 className="feature-title">Security Radar</h3>
            <p className="feature-desc">
              Detect exposed API secrets, dangerous regexes, and vulnerable patterns before they ever reach your production branch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
