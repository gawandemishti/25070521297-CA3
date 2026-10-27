import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Building,
  Users,
  Calendar,
  CheckCircle,
  Bell,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ExternalLink,
} from 'lucide-react';

const CollegeAdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Announcement modal
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [postingAnnounce, setPostingAnnounce] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/college-admin');
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load college admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle || !announceContent) return;

    setPostingAnnounce(true);
    try {
      const collegeId = dashboardData?.college?._id;
      const res = await api.patch(`/colleges/${collegeId}`, {
        newAnnouncement: { title: announceTitle, content: announceContent },
      });
      if (res.success) {
        setShowAnnounceModal(false);
        setAnnounceTitle('');
        setAnnounceContent('');
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to post announcement');
    } finally {
      setPostingAnnounce(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }} />
        <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      </div>
    );
  }

  const { college = {}, stats = {}, clubs = [], events = [] } = dashboardData || {};

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div
          className="card"
          style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, var(--primary-900) 0%, #1e1b4b 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src={college.logo || 'https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop'}
              alt={college.name}
              style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', background: '#fff' }}
            />
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>
                Institutional Portal
              </span>
              <h1 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                {college.name} Administration
              </h1>
              <p style={{ color: '#c7d2fe', fontSize: '0.9rem' }}>
                {college.city}, {college.state} • Authorized College Dean & Administrator
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setShowAnnounceModal(true)} className="btn btn-primary btn-sm">
              <PlusCircle size={15} /> Publish Announcement
            </button>
            <Link to={`/colleges/${college._id}`} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
              Public Profile
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Affiliated Students
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-600)', margin: '0.25rem 0' }}>
              {stats.totalStudents || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>Active student accounts</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Active Campus Clubs
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--violet-600)', margin: '0.25rem 0' }}>
              {stats.totalClubs || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>Chapters established</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              College Events
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--success)', margin: '0.25rem 0' }}>
              {stats.totalEvents || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>
              {stats.publishedEvents || 0} published
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Event Registrations
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--warning)', margin: '0.25rem 0' }}>
              {stats.totalRegistrations || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>Across all college events</span>
          </div>
        </div>

        {/* College Announcements Section */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--secondary-900)' }}>
              Institutional Announcements ({college.announcements?.length || 0})
            </h2>
            <button onClick={() => setShowAnnounceModal(true)} className="btn btn-outline btn-sm">
              <PlusCircle size={14} /> New Announcement
            </button>
          </div>

          {college.announcements && college.announcements.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {college.announcements.map((ann, i) => (
                <div key={i} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--secondary-900)' }}>{ann.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary-400)' }}>
                      {new Date(ann.date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--secondary-700)', lineHeight: 1.5 }}>
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--secondary-500)' }}>
              No institutional announcements published yet.
            </div>
          )}
        </div>

        {/* College Clubs & Events Table */}
        <div className="grid-cols-2">
          {/* Managed Clubs */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary-900)', marginBottom: '1rem' }}>
              Campus Clubs ({clubs.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {clubs.map((c) => (
                <div
                  key={c._id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--secondary-900)' }}>{c.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>
                      Category: {c.category} • Organizer: {c.organizer?.name}
                    </p>
                  </div>
                  <Link to={`/clubs/${c._id}`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Managed Events */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary-900)', marginBottom: '1rem' }}>
              Published Events ({events.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {events.map((e) => (
                <div
                  key={e._id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--secondary-900)' }}>{e.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>
                      {new Date(e.startDate).toLocaleDateString('en-IN')} • {e.registeredCount} / {e.capacity} seats
                    </p>
                  </div>
                  <Link to={`/events/${e._id}`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal: Publish Announcement */}
        {showAnnounceModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--secondary-900)' }}>
                Publish Institutional Announcement
              </h3>
              <form onSubmit={handlePostAnnouncement}>
                <div className="form-group">
                  <label className="form-label">Announcement Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dean's List Announced or Campus Fest Dates"
                    value={announceTitle}
                    onChange={(e) => setAnnounceTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder="Enter details visible to students across colleges..."
                    value={announceContent}
                    onChange={(e) => setAnnounceContent(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setShowAnnounceModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={postingAnnounce} className="btn btn-primary btn-sm">
                    {postingAnnounce ? 'Publishing...' : 'Publish Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeAdminDashboard;

