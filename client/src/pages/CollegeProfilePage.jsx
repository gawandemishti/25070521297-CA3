import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import EventCard from '../components/EventCard';
import ClubCard from '../components/ClubCard';
import {
  Building,
  MapPin,
  Globe,
  CheckCircle,
  Calendar,
  Users,
  Award,
  Bell,
  PlusCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

const CollegeProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [college, setCollege] = useState(null);
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [activeTab, setActiveTab] = useState('events'); // 'events', 'clubs', 'announcements', 'about'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Announcement modal for authorized college admin
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [postingAnnounce, setPostingAnnounce] = useState(false);

  const fetchCollegeData = async () => {
    setLoading(true);
    try {
      const [colRes, evtRes, clbRes] = await Promise.all([
        api.get(`/colleges/${id}`),
        api.get(`/colleges/${id}/events`),
        api.get(`/colleges/${id}/clubs`),
      ]);

      if (colRes.success && colRes.data) {
        setCollege(colRes.data.college);
      }
      if (evtRes.success && evtRes.data) {
        setEvents(evtRes.data.events || []);
      }
      if (clbRes.success && clbRes.data) {
        setClubs(clbRes.data.clubs || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to load college details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollegeData();
  }, [id]);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle || !announceContent) return;

    setPostingAnnounce(true);
    try {
      const res = await api.patch(`/colleges/${college._id}`, {
        newAnnouncement: { title: announceTitle, content: announceContent },
      });
      if (res.success) {
        setShowAnnounceModal(false);
        setAnnounceTitle('');
        setAnnounceContent('');
        fetchCollegeData();
      }
    } catch (err) {
      alert(err.message || 'Failed to post announcement');
    } finally {
      setPostingAnnounce(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '40px', width: '50%', marginBottom: '1rem' }} />
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="alert alert-error" style={{ maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error || 'College not found.'}</span>
        </div>
        <Link to="/colleges" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Colleges
        </Link>
      </div>
    );
  }

  const isCollegeAdminOfThis =
    user &&
    (user.role === 'platform_admin' ||
      (user.role === 'college_admin' &&
        user.college &&
        (user.college._id?.toString() === college._id?.toString() ||
          user.college.toString() === college._id?.toString())));

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Banner & Header */}
      <div
        style={{
          position: 'relative',
          height: '240px',
          background: 'linear-gradient(135deg, var(--primary-800), var(--violet-900))',
        }}
      >
        {college.bannerImage && (
          <img
            src={college.bannerImage}
            alt={college.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
          />
        )}
      </div>

      <div className="container" style={{ position: 'relative', marginTop: '-60px' }}>
        <div
          className="card"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <img
                src={college.logo || 'https://images.unsplash.com/photo-1562774053-701939374585?w=160&h=160&fit=crop'}
                alt={college.name}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '4px solid #ffffff',
                  boxShadow: 'var(--shadow-md)',
                  backgroundColor: '#ffffff',
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                  <h1 style={{ fontSize: '1.65rem', color: 'var(--secondary-900)' }}>{college.name}</h1>
                  {college.verificationStatus === 'verified' && (
                    <span className="badge badge-success">
                      <CheckCircle size={13} /> Verified Institution
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--secondary-500)', fontSize: '0.875rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="var(--primary-600)" /> {college.city}, {college.state}
                  </span>
                  {college.website && (
                    <a
                      href={college.website}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-600)', fontWeight: 600 }}
                    >
                      <Globe size={14} /> Official Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            {isCollegeAdminOfThis && (
              <button onClick={() => setShowAnnounceModal(true)} className="btn btn-outline btn-sm">
                <PlusCircle size={15} /> Publish Announcement
              </button>
            )}
          </div>

          <p style={{ color: 'var(--secondary-700)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {college.description}
          </p>

          {/* Quick Stats Pill Bar */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-light)',
              fontSize: '0.9rem',
              color: 'var(--secondary-700)',
            }}
          >
            <div>
              <strong>{events.length}</strong> <span style={{ color: 'var(--secondary-500)' }}>Published Events</span>
            </div>
            <div>
              <strong>{clubs.length}</strong> <span style={{ color: 'var(--secondary-500)' }}>Active Student Clubs</span>
            </div>
            {college.establishedYear && (
              <div>
                <span style={{ color: 'var(--secondary-500)' }}>Est.</span> <strong>{college.establishedYear}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            borderBottom: '2px solid var(--border-light)',
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={() => setActiveTab('events')}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'events' ? 'var(--primary-600)' : 'var(--secondary-500)',
              borderBottom: activeTab === 'events' ? '3px solid var(--primary-600)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'clubs' ? 'var(--primary-600)' : 'var(--secondary-500)',
              borderBottom: activeTab === 'clubs' ? '3px solid var(--primary-600)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Clubs ({clubs.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'announcements' ? 'var(--primary-600)' : 'var(--secondary-500)',
              borderBottom: activeTab === 'announcements' ? '3px solid var(--primary-600)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Announcements ({college.announcements?.length || 0})
          </button>
        </div>

        {/* Tab 1: Events */}
        {activeTab === 'events' && (
          <div>
            {events.length > 0 ? (
              <div className="grid-cols-3">
                {events.map((evt) => (
                  <EventCard key={evt._id} event={evt} />
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary-500)' }}>
                No events currently hosted by this college.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Clubs */}
        {activeTab === 'clubs' && (
          <div>
            {clubs.length > 0 ? (
              <div className="grid-cols-3">
                {clubs.map((c) => (
                  <ClubCard key={c._id} club={c} />
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary-500)' }}>
                No active clubs registered yet.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Announcements */}
        {activeTab === 'announcements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {college.announcements && college.announcements.length > 0 ? (
              college.announcements.map((ann, idx) => (
                <div key={idx} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary-900)' }}>{ann.title}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary-400)' }}>
                      {new Date(ann.date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--secondary-700)', lineHeight: 1.5 }}>
                    {ann.content}
                  </p>
                  {ann.postedBy && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', marginTop: '0.5rem' }}>
                      Posted by {ann.postedBy}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary-500)' }}>
                No institutional announcements posted yet.
              </div>
            )}
          </div>
        )}

        {/* Modal: Post Announcement (Admin only) */}
        {showAnnounceModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--secondary-900)' }}>
                Post Institutional Announcement
              </h3>
              <form onSubmit={handlePostAnnouncement}>
                <div className="form-group">
                  <label className="form-label">Announcement Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Call for Papers or Registration Open"
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
                    placeholder="Enter announcement details for students..."
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
                    {postingAnnounce ? 'Posting...' : 'Publish Announcement'}
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

export default CollegeProfilePage;

