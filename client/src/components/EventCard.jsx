import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Globe, Building, CheckCircle, Tag } from 'lucide-react';

const EventCard = ({ event }) => {
  if (!event) return null;

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getScopeBadge = (scope) => {
    if (scope === 'all') {
      return <span className="badge badge-indigo"><Globe size={11} /> Open to All Colleges</span>;
    }
    if (scope === 'selected_colleges') {
      return <span className="badge badge-warning"><Users size={11} /> Selected Colleges</span>;
    }
    return <span className="badge badge-neutral"><Building size={11} /> Internal Only</span>;
  };

  const isClosed =
    new Date() > new Date(event.registrationDeadline) ||
    (event.capacity > 0 && event.registeredCount >= event.capacity);

  const capacityPercent = event.capacity > 0
    ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))
    : 0;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Banner */}
      <div style={{ position: 'relative', width: '100%', height: '170px', background: '#1e293b' }}>
        <img
          src={
            event.bannerImage ||
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
          }
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          <span className="badge badge-neutral" style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#ffffff', backdropFilter: 'blur(4px)', border: 'none' }}>
            {event.category}
          </span>
          <span className="badge" style={{ background: event.deliveryMode === 'online' ? '#0284c7' : '#059669', color: '#ffffff' }}>
            {event.deliveryMode}
          </span>
        </div>

        <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: event.fee === 0 ? '#10b981' : '#f59e0b',
              color: '#ffffff',
            }}
          >
            {event.fee === 0 ? 'FREE' : `₹${event.fee}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Organizing College */}
        {event.organizingCollege && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Building size={13} color="var(--primary-600)" />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--secondary-600)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {event.organizingCollege.name}
            </span>
          </div>
        )}

        {/* Title */}
        <h3
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.35,
            marginBottom: '0.65rem',
            color: 'var(--secondary-900)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          <Link to={`/events/${event._id}`} style={{ color: 'inherit' }}>
            {event.title}
          </Link>
        </h3>

        {/* Meta details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--secondary-600)', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} color="var(--primary-500)" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} color="var(--primary-500)" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.venue}
            </span>
          </div>
        </div>

        {/* Scope badge */}
        <div style={{ marginBottom: '1rem' }}>
          {getScopeBadge(event.participationScope)}
        </div>

        {/* Capacity Progress Bar */}
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--secondary-500)', marginBottom: '0.25rem' }}>
            <span>Registrations</span>
            <span>
              <strong>{event.registeredCount || 0}</strong> / {event.capacity} seats
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--secondary-100)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.85rem' }}>
            <div
              style={{
                width: `${capacityPercent}%`,
                height: '100%',
                background: capacityPercent > 85 ? 'var(--danger)' : 'var(--primary-600)',
                borderRadius: '3px',
              }}
            />
          </div>

          <Link
            to={`/events/${event._id}`}
            className={`btn ${isClosed ? 'btn-secondary' : 'btn-primary'}`}
            style={{ width: '100%', fontSize: '0.85rem', padding: '0.55rem' }}
          >
            {isClosed ? 'View Details (Full/Closed)' : 'Register / View Details'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

