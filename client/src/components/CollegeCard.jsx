import React from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Calendar, Users, CheckCircle, ExternalLink } from 'lucide-react';

const CollegeCard = ({ college }) => {
  if (!college) return null;

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
      <div style={{ height: '90px', position: 'relative', background: 'linear-gradient(135deg, var(--primary-700), var(--violet-700))' }}>
        {college.bannerImage && (
          <img
            src={college.bannerImage}
            alt={college.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
          />
        )}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          {college.verificationStatus === 'verified' ? (
            <span className="badge badge-success" style={{ background: 'rgba(255,255,255,0.95)', border: 'none' }}>
              <CheckCircle size={12} /> Verified
            </span>
          ) : (
            <span className="badge badge-warning" style={{ background: 'rgba(255,255,255,0.95)', border: 'none' }}>
              Pending Verification
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '0 1.25rem 1.25rem', marginTop: '-30px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <img
          src={college.logo || 'https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop'}
          alt={college.name}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            border: '3px solid #ffffff',
            objectFit: 'cover',
            boxShadow: 'var(--shadow-sm)',
            backgroundColor: '#ffffff',
            marginBottom: '0.75rem',
          }}
        />

        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', color: 'var(--secondary-900)' }}>
          <Link to={`/colleges/${college._id}`} style={{ color: 'inherit' }}>
            {college.name}
          </Link>
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--secondary-500)', marginBottom: '0.75rem' }}>
          <MapPin size={13} color="var(--primary-500)" />
          <span>{college.city}, {college.state}</span>
        </div>

        <p
          style={{
            fontSize: '0.825rem',
            color: 'var(--secondary-600)',
            lineHeight: 1.45,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {college.description || 'Participating collegiate institution in CampusConnect.'}
        </p>

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
          <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.75rem', color: 'var(--secondary-600)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={13} color="var(--primary-600)" />
              <strong>{college.eventCount || 0}</strong> Events
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Users size={13} color="var(--violet-600)" />
              <strong>{college.clubCount || 0}</strong> Clubs
            </span>
          </div>

          <Link to={`/colleges/${college._id}`} className="btn btn-outline btn-sm">
            View College
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CollegeCard;

