import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, GraduationCap, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectAfterLogin = (user) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (user.role === 'student') navigate('/student/dashboard');
    else if (user.role === 'organizer') navigate('/organizer/dashboard');
    else if (user.role === 'college_admin') navigate('/college-admin/dashboard');
    else if (user.role === 'platform_admin') navigate('/platform-admin/dashboard');
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedInUser = await login(email, password);
      redirectAfterLogin(loggedInUser);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick evaluator demo account fill
  const fillDemoAccount = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 4.5rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        background: 'linear-gradient(180deg, var(--bg-page) 0%, var(--primary-50) 100%)',
      }}
    >
      <div style={{ maxWidth: '460px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--violet-600) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <GraduationCap size={30} />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--secondary-900)', marginBottom: '0.5rem' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--secondary-500)', fontSize: '0.9rem' }}>
            Log in to your CampusConnect account to access your events, clubs, and network.
          </p>
        </div>

        {/* Demo Fast-Fill Bar for University Evaluation */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid var(--primary-200)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <Sparkles size={14} color="var(--primary-600)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
              Quick Evaluation Demo Accounts
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => fillDemoAccount('aarav.student@campusconnect.edu', 'Student (Apex)')}
              className="badge badge-neutral"
              style={{ cursor: 'pointer', padding: '0.35rem 0.6rem' }}
            >
              🎓 Student (Apex Tech)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('pooja.student@campusconnect.edu', 'Student (Horizon)')}
              className="badge badge-neutral"
              style={{ cursor: 'pointer', padding: '0.35rem 0.6rem' }}
            >
              🎓 Student (Horizon Mumbai)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('organizer.apex@campusconnect.edu', 'Organizer')}
              className="badge badge-warning"
              style={{ cursor: 'pointer', padding: '0.35rem 0.6rem' }}
            >
              🎪 Organizer
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@apex-tech.edu.in', 'College Admin')}
              className="badge badge-indigo"
              style={{ cursor: 'pointer', padding: '0.35rem 0.6rem' }}
            >
              🏛️ College Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@campusconnect.edu', 'Platform Admin')}
              className="badge badge-danger"
              style={{ cursor: 'pointer', padding: '0.35rem 0.6rem' }}
            >
              👑 Platform Admin
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Institutional / Registered Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="var(--secondary-400)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="student@college.edu or name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', cursor: 'pointer' }}>
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="var(--secondary-400)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--secondary-400)',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to CampusConnect'}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-light)',
              fontSize: '0.85rem',
              color: 'var(--secondary-600)',
            }}
          >
            New to CampusConnect?{' '}
            <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

