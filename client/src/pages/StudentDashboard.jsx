import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import EventCard from '../components/EventCard';
import {
  Calendar,
  Ticket,
  Users,
  Clock,
  Sparkles,
  CheckCircle,
  Building,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  XCircle,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/student');
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleTeamInvitation = async (teamId, invitationId, status) => {
    try {
      await api.patch(`/teams/${teamId}/invitations/${invitationId}`, { status });
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Action failed');
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

  const {
    stats = {},
    upcomingRegistrations = [],
    pastRegistrations = [],
    memberships = [],
    teamInvitations = [],
    recommendedEvents = [],
  } = dashboardData || {};

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Welcome Banner */}
        <div
          className="card"
          style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%)',
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
              src={
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=6366f1&color=fff`
              }
              alt={user?.name}
              style={{ width: '68px', height: '68px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)' }}
            />
            <div>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', marginBottom: '0.4rem' }}>
                Student Dashboard
              </span>
              <h1 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                Welcome back, {user?.name}!
              </h1>
              {user?.college && (
                <p style={{ color: '#c7d2fe', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building size={14} /> {user.college.name} • {user.department} ({user.year})
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/events" className="btn btn-primary btn-sm">
              Explore Events
            </Link>
            <Link to="/profile" className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Registered Events
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-600)', margin: '0.25rem 0' }}>
              {stats.totalRegistrations || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>
              {stats.upcomingEventsCount || 0} upcoming
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Joined Clubs
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--violet-600)', margin: '0.25rem 0' }}>
              {stats.joinedClubsCount || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>
              {stats.pendingClubRequestsCount || 0} requests pending
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Team Invitations
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--warning)', margin: '0.25rem 0' }}>
              {stats.pendingTeamInvitesCount || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>Awaiting your decision</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Past Participations
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--success)', margin: '0.25rem 0' }}>
              {stats.pastEventsCount || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>Events concluded</span>
          </div>
        </div>

        {/* Pending Team Invitations Alert Banner */}
        {teamInvitations.length > 0 && (
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '2.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', color: '#92400e', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} /> Team Invitations ({teamInvitations.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {teamInvitations.map((inv) => (
                <div
                  key={inv._id}
                  style={{
                    background: '#ffffff',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary-900)' }}>
                      {inv.team?.name} (for {inv.event?.title})
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary-600)' }}>
                      Invited by {inv.sender?.name} • "{inv.message}"
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleTeamInvitation(inv.team?._id, inv._id, 'accepted')}
                      className="btn btn-primary btn-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleTeamInvitation(inv.team?._id, inv._id, 'rejected')}
                      className="btn btn-secondary btn-sm"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 1: Upcoming Registered Events with Tickets */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ticket size={20} color="var(--primary-600)" />
              My Upcoming Registered Events ({upcomingRegistrations.length})
            </h2>
            <Link to="/events" style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 600 }}>
              Find more events →
            </Link>
          </div>

          {upcomingRegistrations.length > 0 ? (
            <div className="grid-cols-2">
              {upcomingRegistrations.map((reg) => (
                <div key={reg._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span className="badge badge-success">
                        <CheckCircle size={12} /> Confirmed
                      </span>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--secondary-500)' }}>
                        Ticket: {reg.ticketCode}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary-900)', marginBottom: '0.35rem' }}>
                      <Link to={`/events/${reg.event?._id}`} style={{ color: 'inherit' }}>
                        {reg.event?.title}
                      </Link>
                    </h3>

                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary-600)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                      <Building size={13} color="var(--primary-600)" />
                      {reg.event?.organizingCollege?.name}
                    </p>

                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} />
                      {new Date(reg.event?.startDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>
                      Venue: {reg.event?.venue}
                    </span>
                    <Link to={`/events/${reg.event?._id}`} className="btn btn-outline btn-sm">
                      View Ticket & Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary-500)' }}>
              <Calendar size={40} color="var(--primary-300)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ color: 'var(--secondary-800)', marginBottom: '0.35rem' }}>No upcoming registered events</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                You have not registered for any upcoming events yet. Discover events from universities across India.
              </p>
              <Link to="/events" className="btn btn-primary btn-sm">
                Explore Events
              </Link>
            </div>
          )}
        </div>

        {/* Section 2: Joined Clubs & Membership Requests */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--violet-600)" />
              My Clubs & Organizations ({memberships.length})
            </h2>
            <Link to="/clubs" style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 600 }}>
              Browse all clubs →
            </Link>
          </div>

          {memberships.length > 0 ? (
            <div className="grid-cols-3">
              {memberships.map((m) => (
                <div key={m._id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span
                      className={`badge ${
                        m.status === 'approved' ? 'badge-success' : m.status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }`}
                    >
                      {m.status === 'approved' ? 'Approved Member' : m.status === 'pending' ? 'Pending Review' : 'Rejected'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--secondary-400)' }}>
                      {new Date(m.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', color: 'var(--secondary-900)', marginBottom: '0.35rem' }}>
                    <Link to={`/clubs/${m.club?._id}`} style={{ color: 'inherit' }}>
                      {m.club?.name}
                    </Link>
                  </h3>

                  <p style={{ fontSize: '0.8rem', color: 'var(--secondary-600)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
                    <Building size={13} color="var(--primary-600)" />
                    {m.club?.college?.name}
                  </p>

                  <Link to={`/clubs/${m.club?._id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    View Club
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary-500)' }}>
              <Users size={40} color="var(--violet-300)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ color: 'var(--secondary-800)', marginBottom: '0.35rem' }}>No club memberships yet</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Join tech clubs, robotics labs, and cultural societies across participating colleges.
              </p>
              <Link to="/clubs" className="btn btn-primary btn-sm">
                Explore Clubs
              </Link>
            </div>
          )}
        </div>

        {/* Section 3: Recommended Events */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--warning)" />
              Recommended For You
            </h2>
            <Link to="/events" style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 600 }}>
              View all →
            </Link>
          </div>

          <div className="grid-cols-4">
            {recommendedEvents.map((evt) => (
              <EventCard key={evt._id} event={evt} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

