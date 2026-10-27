import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Mail,
  Building,
  BookOpen,
  Lock,
  LogOut,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    department: user?.department || '',
    year: user?.year || '1st Year',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    profileImage: user?.profileImage || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [changingPass, setChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await api.patch('/users/me', formData);
      if (res.success && res.data) {
        updateUser(res.data.user);
        setProfileSuccess('Profile updated successfully!');
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangingPass(true);
    setPassSuccess('');
    setPassError('');

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPassError('New passwords do not match.');
      setChangingPass(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      setChangingPass(false);
      return;
    }

    try {
      const res = await api.patch('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.success) {
        setPassSuccess('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (err) {
      setPassError(err.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--secondary-900)' }}>Account & Profile Settings</h1>
            <p style={{ color: 'var(--secondary-500)', fontSize: '0.95rem' }}>
              Manage your personal student identity, skills, and security credentials.
            </p>
          </div>
          <button onClick={logout} className="btn btn-danger btn-sm">
            <LogOut size={15} /> Log Out
          </button>
        </div>

        {/* Profile Details Form */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--secondary-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={18} color="var(--primary-600)" /> Personal Information
          </h2>

          {profileSuccess && (
            <div className="alert alert-success">
              <CheckCircle size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}
          {profileError && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="grid-cols-2" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email (Read Only)</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ background: 'var(--secondary-100)', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Image URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://images.unsplash.com/... or your avatar URL"
                value={formData.profileImage}
                onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Headline</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Tell peers what you are passionate about, your projects, or hackathon aspirations..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="grid-cols-2" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Department / Branch</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Year of Study</label>
                <select
                  className="form-select"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Skills (Comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. React.js, Python, Figma, Docker"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interests (Comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Hackathons, AI, Robotics, Music"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              />
            </div>

            <button type="submit" disabled={savingProfile} className="btn btn-primary">
              {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--secondary-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lock size={18} color="var(--primary-600)" /> Security & Password
          </h2>

          {passSuccess && (
            <div className="alert alert-success">
              <CheckCircle size={16} />
              <span>{passSuccess}</span>
            </div>
          )}
          {passError && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </div>

            <div className="grid-cols-2" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Password (min 6 chars)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={changingPass} className="btn btn-secondary">
              {changingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

