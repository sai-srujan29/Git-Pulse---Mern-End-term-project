import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, LayoutDashboard } from 'lucide-react';
import GithubIcon from './GithubIcon';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          <div className="pulse-icon">
            <Activity size={22} color="var(--primary-color)" />
          </div>
          <span className="brand-name">
            Git<span className="gradient-text">Pulse</span>
          </span>
        </Link>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user">
              <Link to="/dashboard" className="btn btn-ghost btn-sm">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>

              <div className="user-profile-badge">
                <img
                  src={user.avatarUrl || 'https://github.com/ghost.png'}
                  alt={user.username}
                  className="user-avatar"
                />
                <span className="user-name">@{user.username}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm text-muted"
                title="Log out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button onClick={loginWithGithub} className="btn btn-primary btn-sm">
              <GithubIcon size={16} />
              <span>Connect GitHub</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
