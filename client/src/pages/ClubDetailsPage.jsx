import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import EventCard from '../components/EventCard';
import {
  Users,
  Building,
  Globe,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  Send,
  UserPlus,
} from 'lucide-react';

const ClubDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [clubData, setClubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Request membership modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchClub = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/clubs/${id}`);
      if (res.success && res.data) {
        setClubData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load club details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClub();
  }, [id]);

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmittingRequest(true);
    setError('');
    try {
      const res = await api.post(`/clubs/${id}/membership-requests`, {
        requestMessage: requestNote,
      });
      if (res.success) {
        setShowJoinModal(false);
        setSuccessMsg('Membership request submitted successfully! The club lead will review it.');
        fetchClub();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '220px', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '40px', width: '50%', marginBottom: '1rem' }} />
      </div>
    );
  }

  if (error && !clubData) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="alert alert-error" style={{ maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <Link to="/clubs" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Clubs
        </Link>
      </div>
    );
  }

  const { club, upcomingEvents, memberCount, userMembership, isOrganizer } = clubData || {};
  if (!club) return null;

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/clubs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--secondary-600)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={15} /> Back to Clubs
          </Link>
        </div>

        {/* Club Profile Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <img
                src={club.logo || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=160&h=160&fit=crop'}
                alt={club.name}
                style={{ width: '84px', height: '84px', borderRadius: '18px', objectFit: 'cover' }}
              />
              <div>
                <span className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>
                  {club.category}
                </span>
                <h1 style={{ fontSize: '1.85rem', color: 'var(--secondary-900)', marginBottom: '0.35rem' }}>
                  {club.name}
                </h1>
                {club.college && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--secondary-600)' }}>
                    <Building size={15} color="var(--primary-600)" />
                    Associated with <strong>{club.college.name}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Membership Action Button */}
            <div>
              {isOrganizer ? (
                <Link to="/organizer/dashboard" className="btn btn-secondary">
                  Manage Club in Console
                </Link>
              ) : userMembership?.status === 'approved' ? (
                <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                  <CheckCircle size={15} /> Official Club Member
                </span>
              ) : userMembership?.status === 'pending' ? (
                <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                  <Clock size={15} /> Membership Request Pending
                </span>
              ) : (
                <button onClick={() => setShowJoinModal(true)} className="btn btn-primary">
                  <UserPlus size={16} /> Request to Join Club
                </button>
              )}
            </div>
          </div>

          <p style={{ fontSize: '1rem', color: 'var(--secondary-700)', lineHeight: 1.6, margin: '1.5rem 0' }}>
            {club.description}
          </p>

          {/* Policy & Status Bar */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-light)',
              fontSize: '0.85rem',
              color: 'var(--secondary-600)',
            }}
          >
            <div>
              <Users size={14} color="var(--primary-600)" style={{ display: 'inline', marginRight: '4px' }} />
              <strong>{memberCount}</strong> Active Members
            </div>
            <div>
              <Globe size={14} color="var(--violet-600)" style={{ display: 'inline', marginRight: '4px' }} />
              {club.externalMembershipAllowed ? 'Open to external college members' : 'Restricted to campus students'}
            </div>
            {club.organizer && (
              <div>
                Lead: <strong>{club.organizer.name}</strong> ({club.organizer.department || 'Student Lead'})
              </div>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '2rem' }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Activities and Achievements Grid */}
        <div className="grid-cols-2" style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary-900)', marginBottom: '1rem' }}>
              Key Activities & Pods
            </h3>
            {club.activities && club.activities.length > 0 ? (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {club.activities.map((act, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary-700)' }}>
                    <CheckCircle size={15} color="var(--success)" />
                    {act}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--secondary-500)', fontSize: '0.85rem' }}>Weekly meetings and hands-on project cohorts.</p>
            )}
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary-900)', marginBottom: '1rem' }}>
              Recognitions & Milestones
            </h3>
            {club.achievements && club.achievements.length > 0 ? (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {club.achievements.map((ach, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary-700)' }}>
                    <Award size={15} color="var(--warning)" />
                    {ach}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--secondary-500)', fontSize: '0.85rem' }}>Active student chapter participating in national hackathons.</p>
            )}
          </div>
        </div>

        {/* Upcoming Club Events */}
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary-900)', marginBottom: '1.25rem' }}>
            Events Hosted by this Club
          </h2>
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="grid-cols-3">
              {upcomingEvents.map((evt) => (
                <EventCard key={evt._id} event={evt} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary-500)' }}>
              No upcoming public events scheduled currently.
            </div>
          )}
        </div>

        {/* Join Membership Request Modal */}
        {showJoinModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '480px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--secondary-900)' }}>
                Request Membership in {club.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--secondary-600)', marginBottom: '1.25rem' }}>
                {user?.college?.name
                  ? `Your application will indicate you are from ${user.college.name}.`
                  : 'Submit a short note about why you would like to join.'}
              </p>

              <form onSubmit={handleJoinSubmit}>
                <div className="form-group">
                  <label className="form-label">Note for the Club Lead / Organizer</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder="Tell them about your skills, interests, and what you hope to contribute..."
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingRequest} className="btn btn-primary btn-sm">
                    {submittingRequest ? 'Sending Request...' : 'Submit Request'}
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

export default ClubDetailsPage;

