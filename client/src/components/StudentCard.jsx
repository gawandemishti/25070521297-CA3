import React, { useState } from 'react';
import { Building, BookOpen, Send, Check, UserPlus } from 'lucide-react';
import api from '../services/api';

const StudentCard = ({ student, currentUserId, onConnectSent }) => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!student) return null;

  const isSelf = currentUserId && student._id === currentUserId;

  const handleConnect = async () => {
    setConnecting(true);
    setErrorMsg('');
    try {
      const res = await api.post(`/connections/${student._id}`);
      if (res.success) {
        setConnected(true);
        if (onConnectSent) onConnectSent(student._id);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to send request');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
        <img
          src={
            student.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6366f1&color=fff`
          }
          alt={student.name}
          style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--secondary-900)', marginBottom: '0.15rem' }}>
            {student.name}
          </h4>
          {student.college && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--secondary-600)' }}>
              <Building size={12} color="var(--primary-600)" />
              {student.college.name}
            </p>
          )}
          {student.department && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--secondary-500)' }}>
              <BookOpen size={11} />
              {student.department} {student.year && `• ${student.year}`}
            </p>
          )}
        </div>
      </div>

      {student.bio && (
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--secondary-600)',
            lineHeight: 1.45,
            marginBottom: '0.85rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {student.bio}
        </p>
      )}

      {/* Skills */}
      {student.skills && student.skills.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--secondary-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Skills
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {student.skills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                {skill}
              </span>
            ))}
            {student.skills.length > 4 && (
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                +{student.skills.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Interests */}
      {student.interests && student.interests.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--secondary-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Interests
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {student.interests.slice(0, 3).map((interest, idx) => (
              <span key={idx} className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {errorMsg && (
        <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>
          {errorMsg}
        </p>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
        {!isSelf ? (
          <button
            onClick={handleConnect}
            disabled={connecting || connected}
            className={`btn ${connected ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            style={{ width: '100%' }}
          >
            {connected ? (
              <>
                <Check size={14} color="var(--success)" /> Request Sent
              </>
            ) : connecting ? (
              'Sending...'
            ) : (
              <>
                <UserPlus size={14} /> Connect as Teammate
              </>
            )}
          </button>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--secondary-400)', textAlign: 'center', display: 'block' }}>
            (This is your profile)
          </span>
        )}
      </div>
    </div>
  );
};

export default StudentCard;

