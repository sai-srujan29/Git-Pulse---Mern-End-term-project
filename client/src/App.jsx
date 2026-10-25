import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const ComingSoon = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px'
  }}>
    <div style={{
      fontSize: '2.5rem',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #7c3aed, #a855f7, #3b82f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}>
      GitPulse
    </div>
    <p style={{ color: '#8b949e', fontFamily: 'Inter, sans-serif' }}>
      Automated PR Health & Code Review Dashboard
    </p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161b22',
            color: '#e6edf3',
            border: '1px solid #30363d',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#3fb950', secondary: '#161b22' },
          },
          error: {
            iconTheme: { primary: '#f85149', secondary: '#161b22' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
