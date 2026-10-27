import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  Users,
  Globe,
  Tag,
  CheckCircle,
  AlertCircle,
  Share2,
  DollarSign,
  Mail,
  Phone,
  ArrowLeft,
  XCircle,
  Ticket,
} from 'lucide-react';

const EventDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [ticketDetails, setTicketDetails] = useState(null);

  // Cancellation modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/${id}`);
      if (res.success && res.data) {
        setEventData(res.data);
        if (res.data.userRegistration) {
          setTicketDetails(res.data.userRegistration);
        }
      }
    } catch (err) {
      setError(err.message || 'Unable to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    setRegistering(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post(`/events/${id}/register`, {});
      if (res.success && res.data) {
        setSuccessMsg(res.message || 'Registration confirmed!');
        setTicketDetails(res.data.registration);
        fetchEvent(); // Refresh counter & status
      }
    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!ticketDetails?._id) return;
    setCancelling(true);
    try {
      const res = await api.delete(`/registrations/${ticketDetails._id}`);
      if (res.success) {
        setShowCancelModal(false);
        setTicketDetails(null);
        setSuccessMsg('Your registration has been cancelled.');
        fetchEvent();
      }
    } catch (err) {
      setError(err.message || 'Unable to cancel registration.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '40px', width: '60%', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '120px', width: '100%' }} />
      </div>
    );
  }

  if (error && !eventData) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="alert alert-error" style={{ maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <Link to="/events" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Events
        </Link>
      </div>
    );
  }

  const { event, isEligible, eligibilityReason, isRegistrationClosed, seatsRemaining } = eventData || {};
  if (!event) return null;

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/events"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--secondary-600)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={15} /> Back to All Events
          </Link>
        </div>

        {/* Hero Banner Image */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '380px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-md)',
            background: '#0f172a',
          }}
        >
          <img
            src={
              event.bannerImage ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop'
            }
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '2rem',
              left: '2rem',
              right: '2rem',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ background: 'var(--primary-600)', color: '#ffffff' }}>
                {event.category}
              </span>
              <span className="badge" style={{ background: event.deliveryMode === 'online' ? '#0284c7' : '#059669', color: '#ffffff' }}>
                {event.deliveryMode}
              </span>
              <span className="badge" style={{ background: event.fee === 0 ? '#10b981' : '#f59e0b', color: '#ffffff' }}>
                {event.fee === 0 ? 'FREE ENTRY' : `₹${event.fee} REGISTRATION FEE`}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', color: '#ffffff', lineHeight: 1.25, marginBottom: '0.5rem' }}>
              {event.title}
            </h1>

            {event.organizingCollege && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
                <Building size={16} color="var(--primary-200)" />
                Hosted by <strong>{event.organizingCollege.name}</strong> ({event.organizingCollege.city}, {event.organizingCollege.state})
              </p>
            )}
          </div>
        </div>

        {/* Main Details Grid: Left Content (70%), Right Action Box (30%) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Full description, eligibility, schedule */}
          <div>
            {/* Status alerts */}
            {successMsg && (
              <div className="alert alert-success">
                <CheckCircle size={18} />
                <span>{successMsg}</span>
              </div>
            )}
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Confirmed Ticket Card (If Registered) */}
            {ticketDetails && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '1px solid #6ee7b7',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 700 }}>
                    <Ticket size={20} />
                    <span>You are registered for this event!</span>
                  </div>
                  <span className="badge badge-success">Status: Confirmed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#047857' }}>Ticket ID Reference:</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: '#064e3b' }}>
                      {ticketDetails.ticketCode}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Cancel Registration
                  </button>
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: 'var(--secondary-900)' }}>
                About This Event
              </h2>
              <div
                style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  color: 'var(--secondary-700)',
                  whiteSpace: 'pre-line',
                }}
              >
                {event.description}
              </div>

              {event.prizes && (
                <div
                  style={{
                    marginTop: '1.75rem',
                    padding: '1.25rem',
                    background: 'var(--primary-50)',
                    border: '1px solid var(--primary-200)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <h4 style={{ color: 'var(--primary-800)', fontSize: '0.95rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🏆 Prizes & Awards
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--primary-900)', fontWeight: 600 }}>
                    {event.prizes}
                  </p>
                </div>
              )}
            </div>

            {/* Multi-College Eligibility & Scope Card */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: 'var(--secondary-900)' }}>
                Eligibility & Participation Scope
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Globe size={18} color="var(--primary-600)" style={{ marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary-900)' }}>Cross-College Scope</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--secondary-600)' }}>
                      {event.participationScope === 'all'
                        ? 'Open to enrolled students from all recognized universities across India.'
                        : event.participationScope === 'selected_colleges'
                        ? 'Restricted to partner institutions approved for this specific symposium.'
                        : `Exclusive to students of ${event.organizingCollege?.name}.`}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle size={18} color="var(--success)" style={{ marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary-900)' }}>Student Criteria</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--secondary-600)' }}>
                      {event.eligibility}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)', fontWeight: 600 }}>Tags:</span>
                {event.tags.map((t, i) => (
                  <span key={i} className="badge badge-neutral">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Sidebar (Registration & Details) */}
          <div style={{ position: 'sticky', top: '5.5rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              {/* Timing */}
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <Calendar size={18} color="var(--primary-600)" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Date & Time
                    </span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--secondary-900)' }}>
                      {formatDate(event.startDate)}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>
                      to {formatDate(event.endDate)}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <MapPin size={18} color="var(--primary-600)" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Venue
                    </span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--secondary-900)' }}>
                      {event.venue}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Clock size={18} color="var(--warning)" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Registration Deadline
                    </span>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--secondary-900)' }}>
                      {new Date(event.registrationDeadline).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Capacity Status */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--secondary-600)' }}>Capacity</span>
                  <span style={{ fontWeight: 700, color: 'var(--secondary-900)' }}>
                    {event.registeredCount || 0} / {event.capacity} seats filled
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--secondary-100)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.round(((event.registeredCount || 0) / event.capacity) * 100))}%`,
                      height: '100%',
                      background: 'var(--primary-600)',
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', marginTop: '0.35rem' }}>
                  {seatsRemaining > 0 ? `${seatsRemaining} seats remaining` : 'Event is at full capacity'}
                </p>
              </div>

              {/* Eligibility Warning If Student's College Is Ineligible */}
              {isAuthenticated && !isEligible && (
                <div className="alert alert-error" style={{ fontSize: '0.8rem', padding: '0.75rem' }}>
                  <XCircle size={15} />
                  <span>{eligibilityReason}</span>
                </div>
              )}

              {/* Action Button */}
              {ticketDetails ? (
                <button disabled className="btn btn-secondary" style={{ width: '100%', padding: '0.85rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Already Registered
                </button>
              ) : isRegistrationClosed ? (
                <button disabled className="btn btn-secondary" style={{ width: '100%', padding: '0.85rem' }}>
                  Registration Closed
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering || (isAuthenticated && !isEligible)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  {registering
                    ? 'Processing Registration...'
                    : isAuthenticated
                    ? `Register for Event (${event.fee === 0 ? 'Free' : `₹${event.fee}`})`
                    : 'Sign In to Register'}
                </button>
              )}

              {/* Organizer Contact Info */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--secondary-600)' }}>
                <p style={{ fontWeight: 700, color: 'var(--secondary-800)', marginBottom: '0.5rem' }}>
                  Organized by:
                </p>
                <p style={{ fontWeight: 600 }}>{event.organizer?.name}</p>
                {event.contactEmail && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                    <Mail size={13} /> {event.contactEmail}
                  </p>
                )}
                {event.contactPhone && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                    <Phone size={13} /> {event.contactPhone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Confirmation Modal */}
        {showCancelModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '440px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--secondary-900)' }}>
                Cancel Event Registration?
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--secondary-600)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Are you sure you want to cancel your registration for "{event.title}"? Your seat will be released to other students.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowCancelModal(false)} className="btn btn-secondary btn-sm">
                  Keep Registration
                </button>
                <button
                  onClick={handleCancelRegistration}
                  disabled={cancelling}
                  className="btn btn-danger btn-sm"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsPage;

