import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  GraduationCap,
  Building,
  Mail,
  Lock,
  User,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeId: '',
    department: '',
    year: '1st Year',
    skills: '',
    interests: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch approved colleges list from backend
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get('/colleges');
        if (res.success && res.data) {
          setColleges(res.data.colleges || []);
          if (res.data.colleges?.length > 0) {
            setFormData((prev) => ({ ...prev, collegeId: res.data.colleges[0]._id }));
          }
        }
      } catch (err) {
        console.error('Error fetching colleges:', err);
      } finally {
        setCollegesLoading(false);
      }
    };

    fetchColleges();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please provide your institutional email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.collegeId) {
      setError('Please select your affiliated college.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 4.5rem)',
        padding: '3rem 1rem',
        background: 'linear-gradient(180deg, var(--bg-page) 0%, var(--primary-50) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: '640px', width: '100%' }}>
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
          <h1 style={{ fontSize: '1.85rem', color: 'var(--secondary-900)', marginBottom: '0.5rem' }}>
            Join CampusConnect
          </h1>
          <p style={{ color: 'var(--secondary-500)', fontSize: '0.9rem' }}>
            One account connects you to events, clubs, and hackathons across colleges nationwide.
          </p>
        </div>

        {/* Card Form */}
        <div className="card" style={{ padding: '2.25rem' }}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name & Email */}
            <div className="grid-cols-2" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="name">
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    color="var(--secondary-400)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="e.g. Aarav Mehta"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="email">
                  Institutional Email *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="var(--secondary-400)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid-cols-2" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="password">
                  Password (min 6 characters) *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--secondary-400)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                    placeholder="Create strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-400)' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--secondary-400)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* College Selection (Mandatory Multi-College feature) */}
            <div className="form-group">
              <label className="form-label" htmlFor="collegeId">
                Select Your Affiliated College *
              </label>
              <div style={{ position: 'relative' }}>
                <Building
                  size={16}
                  color="var(--secondary-400)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <select
                  id="collegeId"
                  name="collegeId"
                  className="form-select"
                  style={{ paddingLeft: '2.4rem' }}
                  value={formData.collegeId}
                  onChange={handleChange}
                  required
                >
                  {collegesLoading ? (
                    <option>Loading participating colleges...</option>
                  ) : (
                    colleges.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.city}, {c.state})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <p className="form-hint">
                Only students from approved partner institutions can register for cross-college competitions.
              </p>
            </div>

            {/* Department and Year of study */}
            <div className="grid-cols-2" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="department">
                  Department / Branch
                </label>
                <div style={{ position: 'relative' }}>
                  <BookOpen
                    size={16}
                    color="var(--secondary-400)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="department"
                    name="department"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="e.g. Computer Science, AI, Design"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="year">
                  Year of Study
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar
                    size={16}
                    color="var(--secondary-400)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <select
                    id="year"
                    name="year"
                    className="form-select"
                    style={{ paddingLeft: '2.4rem' }}
                    value={formData.year}
                    onChange={handleChange}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skills & Interests */}
            <div className="form-group">
              <label className="form-label" htmlFor="skills">
                Key Skills (Comma separated)
              </label>
              <input
                id="skills"
                name="skills"
                type="text"
                className="form-input"
                placeholder="e.g. React.js, Python, UI/UX, PyTorch, Figma"
                value={formData.skills}
                onChange={handleChange}
              />
              <p className="form-hint">Used for matching you with teammates for hackathons.</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="interests">
                Interests / Domain Focus (Comma separated)
              </label>
              <input
                id="interests"
                name="interests"
                type="text"
                className="form-input"
                placeholder="e.g. Web3, Robotics, Startups, Cultural Fests"
                value={formData.interests}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              {loading ? 'Creating Student Account...' : 'Complete Registration'}
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
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

