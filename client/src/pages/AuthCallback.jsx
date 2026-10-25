import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast.error('GitHub authentication failed. Please try again.');
        navigate('/login', { replace: true });
        return;
      }

      if (token) {
        try {
          await setAuthToken(token);
          toast.success('Successfully connected to GitHub!');
          navigate('/dashboard', { replace: true });
        } catch (err) {
          toast.error('Session verification failed.');
          navigate('/login', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    };

    handleAuth();
  }, [searchParams, navigate, setAuthToken]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        gap: '16px',
      }}
    >
      <div className="spinner" />
      <h3 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
        Authenticating with GitHub...
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Setting up your workspace and session
      </p>
    </div>
  );
};

export default AuthCallback;
