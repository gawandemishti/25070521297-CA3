import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Calendar,
  Users,
  PlusCircle,
  CheckCircle,
  XCircle,
  Eye,
  Building,
  Edit,
  Clock,
  MapPin,
  TrendingUp,
  Tag,
  AlertCircle,
} from 'lucide-react';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active sub-tab: 'events', 'memberships'
  const [activeTab, setActiveTab] = useState('events');

  // Create Event Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'Hackathon',
    bannerImage: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    venue: '',
    deliveryMode: 'offline',
    participationScope: 'all',
    capacity: 100,
    fee: 0,
    prizes: '',
    eligibility: 'Open to enrolled students with valid ID.',
    tags: '',
  });

  // Attendees Modal state
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [selectedEventAttendees, setSelectedEventAttendees] = useState([]);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/organizer');
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load organizer console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const res = await api.post('/events', eventForm);
      if (res.success) {
        setShowCreateModal(false);
        setEventForm({
          title: '',
          description: '',
          category: 'Hackathon',
          bannerImage: '',
          startDate: '',
          endDate: '',
          registrationDeadline: '',
          venue: '',
          deliveryMode: 'offline',
          participationScope: 'all',
          capacity: 100,
          fee: 0,
          prizes: '',
          eligibility: 'Open to enrolled students with valid ID.',
          tags: '',
        });
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleViewAttendees = async (eventId, title) => {
    setSelectedEventTitle(title);
    setShowAttendeesModal(true);
    setAttendeesLoading(true);
    try {
      const res = await api.get(`/events/${eventId}/registrations`);
      if (res.success && res.data) {
        setSelectedEventAttendees(res.data.registrations || []);
      }
    } catch (err) {
      alert(err.message || 'Unable to load attendees list');
    } finally {
      setAttendeesLoading(false);
    }
  };

  const handleToggleAttendance = async (regId, currentStatus) => {
    try {
      await api.patch(`/registrations/${regId}`, { attendanceStatus: !currentStatus });
      setSelectedEventAttendees((prev) =>
        prev.map((r) => (r._id === regId ? { ...r, attendanceStatus: !currentStatus } : r))
      );
    } catch (err) {
      alert(err.message || 'Failed to update attendance');
    }
  };

  const handleReviewMembership = async (clubId, reqId, status) => {
    try {
      await api.patch(`/clubs/${clubId}/membership-requests/${reqId}`, { status });
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to update request');
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

  const { stats = {}, events = [], clubs = [], pendingClubRequests = [] } = dashboardData || {};

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div
          className="card"
          style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <span className="badge badge-warning" style={{ marginBottom: '0.4rem' }}>
              Organizer & Club Lead Console
            </span>
            <h1 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.25rem' }}>
              Organizer Dashboard
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Create and manage inter-college events, review participant lists, and approve club memberships.
            </p>
          </div>

          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <PlusCircle size={16} /> Create New Event
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Events
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-600)', margin: '0.25rem 0' }}>
              {stats.totalEvents || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>
              {stats.publishedEvents || 0} published
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Registrations
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--success)', margin: '0.25rem 0' }}>
              {stats.totalRegistrations || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>
              {stats.attendedCount || 0} checked-in
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Managed Clubs
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--violet-600)', margin: '0.25rem 0' }}>
              {stats.totalClubs || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>Official chapters</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Pending Club Requests
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--warning)', margin: '0.25rem 0' }}>
              {stats.pendingClubRequestsCount || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>Needs your review</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border-light)', marginBottom: '2rem' }}>
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
            My Organized Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('memberships')}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'memberships' ? 'var(--primary-600)' : 'var(--secondary-500)',
              borderBottom: activeTab === 'memberships' ? '3px solid var(--primary-600)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Club Membership Requests ({pendingClubRequests.length})
          </button>
        </div>

        {/* Tab 1: Organized Events List */}
        {activeTab === 'events' && (
          <div>
            {events.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {events.map((evt) => (
                  <div
                    key={evt._id}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.5rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-indigo">{evt.category}</span>
                        <span className={`badge ${evt.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>
                          {evt.status}
                        </span>
                        <span className="badge badge-neutral">{evt.deliveryMode}</span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary-900)', marginBottom: '0.35rem' }}>
                        {evt.title}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--secondary-600)', display: 'flex', gap: '1rem' }}>
                        <span>📅 {new Date(evt.startDate).toLocaleDateString('en-IN')}</span>
                        <span>📍 {evt.venue}</span>
                        <span>🎟️ {evt.registeredCount} / {evt.capacity} registered</span>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleViewAttendees(evt._id, evt.title)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Users size={14} /> View Attendees ({evt.registeredCount})
                      </button>
                      <Link to={`/events/${evt._id}`} className="btn btn-outline btn-sm">
                        <Eye size={14} /> Public Page
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--secondary-500)' }}>
                <Calendar size={40} color="var(--primary-300)" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ color: 'var(--secondary-800)', marginBottom: '0.35rem' }}>No events created yet</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Create your first inter-college competition or workshop.
                </p>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
                  Create Event
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Club Membership Requests */}
        {activeTab === 'memberships' && (
          <div>
            {pendingClubRequests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingClubRequests.map((req) => (
                  <div
                    key={req._id}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-indigo">For: {req.club?.name}</span>
                        <span className="badge badge-neutral">From: {req.college?.name}</span>
                      </div>
                      <h4 style={{ fontSize: '1rem', color: 'var(--secondary-900)' }}>
                        {req.student?.name} ({req.student?.department} • {req.student?.year})
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--secondary-700)', fontStyle: 'italic', margin: '0.35rem 0' }}>
                        "{req.requestMessage}"
                      </p>
                      {req.student?.skills && req.student.skills.length > 0 && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>
                          Skills: {req.student.skills.join(', ')}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleReviewMembership(req.club?._id, req._id, 'approved')}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle size={14} /> Approve Member
                      </button>
                      <button
                        onClick={() => handleReviewMembership(req.club?._id, req._id, 'rejected')}
                        className="btn btn-secondary btn-sm"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--secondary-500)' }}>
                <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ color: 'var(--secondary-800)', marginBottom: '0.35rem' }}>All caught up!</h3>
                <p style={{ fontSize: '0.9rem' }}>No pending club membership requests awaiting review.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal 1: Create Event */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '680px' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', color: 'var(--secondary-900)' }}>
                Publish New Event
              </h3>
              <form onSubmit={handleCreateEvent}>
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. National Inter-College Hackathon 2026"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-cols-2" style={{ marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    >
                      <option value="Hackathon">Hackathon</option>
                      <option value="Coding Competition">Coding Competition</option>
                      <option value="Workshop & Bootcamp">Workshop & Bootcamp</option>
                      <option value="Cultural Fest">Cultural Fest</option>
                      <option value="Technical Symposium">Technical Symposium</option>
                      <option value="Seminar & Guest Lecture">Seminar & Guest Lecture</option>
                      <option value="Robotics & Gaming">Robotics & Gaming</option>
                      <option value="Sports & Athletics">Sports & Athletics</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Delivery Mode *</label>
                    <select
                      className="form-select"
                      value={eventForm.deliveryMode}
                      onChange={(e) => setEventForm({ ...eventForm, deliveryMode: e.target.value })}
                    >
                      <option value="offline">Offline / In-Person</option>
                      <option value="online">Virtual / Online</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description *</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder="Provide full schedule, tracks, guidelines, and what students will build..."
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    required
                  />
                </div>

                {/* Scope Selection: Core Multi-College Feature */}
                <div className="form-group">
                  <label className="form-label">Participation Scope *</label>
                  <select
                    className="form-select"
                    value={eventForm.participationScope}
                    onChange={(e) => setEventForm({ ...eventForm, participationScope: e.target.value })}
                  >
                    <option value="all">Open to All Registered Colleges Across India</option>
                    <option value="own_college_only">Internal Campus Students Only</option>
                    <option value="selected_colleges">Selected Partner Colleges</option>
                  </select>
                </div>

                <div className="grid-cols-3" style={{ marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Start Date *</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">End Date *</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Reg. Deadline *</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={eventForm.registrationDeadline}
                      onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-cols-3" style={{ marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Venue / Link *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Main Auditorium or Meet URL"
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Max Capacity *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                      required
                      min={1}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Fee (₹, 0 for Free)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={eventForm.fee}
                      onChange={(e) => setEventForm({ ...eventForm, fee: e.target.value })}
                      min={0}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Prizes / Perks</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₹1,00,000 Cash Pool + Certificates"
                    value={eventForm.prizes}
                    onChange={(e) => setEventForm({ ...eventForm, prizes: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={creating} className="btn btn-primary btn-sm">
                    {creating ? 'Publishing...' : 'Publish Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Attendees List */}
        {showAttendeesModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '720px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary-900)' }}>
                  Attendees for: {selectedEventTitle}
                </h3>
                <button onClick={() => setShowAttendeesModal(false)} className="btn btn-secondary btn-sm">
                  Close
                </button>
              </div>

              {attendeesLoading ? (
                <p>Loading attendees list...</p>
              ) : selectedEventAttendees.length > 0 ? (
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--secondary-600)' }}>
                        <th style={{ padding: '0.65rem' }}>Student</th>
                        <th style={{ padding: '0.65rem' }}>College</th>
                        <th style={{ padding: '0.65rem' }}>Ticket ID</th>
                        <th style={{ padding: '0.65rem' }}>Status</th>
                        <th style={{ padding: '0.65rem' }}>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEventAttendees.map((reg) => (
                        <tr key={reg._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.65rem' }}>
                            <strong>{reg.student?.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>{reg.student?.email}</div>
                          </td>
                          <td style={{ padding: '0.65rem' }}>{reg.college?.name}</td>
                          <td style={{ padding: '0.65rem', fontFamily: 'monospace' }}>{reg.ticketCode}</td>
                          <td style={{ padding: '0.65rem' }}>
                            <span className="badge badge-success">{reg.registrationStatus}</span>
                          </td>
                          <td style={{ padding: '0.65rem' }}>
                            <button
                              onClick={() => handleToggleAttendance(reg._id, reg.attendanceStatus)}
                              className={`btn btn-sm ${reg.attendanceStatus ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            >
                              {reg.attendanceStatus ? '✓ Attended' : 'Mark Present'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary-500)' }}>
                  No students have registered for this event yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;

