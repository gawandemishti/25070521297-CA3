import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Globe, Building, ArrowRight } from 'lucide-react';

const ClubCard = ({ club }) => {
  if (!club) return null;

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
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <img
            src={club.logo || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop'}
            alt={club.name}
            style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
          />
          <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
            {club.category}
          </span>
        </div>

        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', color: 'var(--secondary-900)' }}>
          <Link to={`/clubs/${club._id}`} style={{ color: 'inherit' }}>
            {club.name}
          </Link>
        </h3>

        {club.college && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', color: 'var(--secondary-500)', marginBottom: '0.65rem' }}>
            <Building size={13} color="var(--primary-500)" />
            <span>{club.college.name}</span>
          </div>
        )}

        <p
          style={{
            fontSize: '0.825rem',
            color: 'var(--secondary-600)',
            lineHeight: 1.45,
            marginBottom: '0.85rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {club.description}
        </p>

        <div style={{ marginBottom: '1rem' }}>
          {club.externalMembershipAllowed ? (
            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
              <Globe size={11} /> Cross-College Members Welcome
            </span>
          ) : (
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
              Internal Members Only
            </span>
          )}
        </div>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', color: 'var(--secondary-600)' }}>
            <Users size={14} color="var(--primary-600)" />
            <span><strong>{club.memberCount || 1}</strong> members</span>
          </div>

          <Link to={`/clubs/${club._id}`} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Explore Club <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;

