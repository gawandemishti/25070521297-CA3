import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '4.5rem 0 2rem',
        borderTop: '1px solid #1e293b',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Brand info */}
          <div style={{ maxWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--violet-600) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <GraduationCap size={22} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Campus<span style={{ color: 'var(--primary-500)' }}>Connect</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The centralized digital ecosystem connecting students, clubs, and college events across India.
            </p>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              "Different Colleges. One Community."
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Explore Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li><Link to="/events" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Inter-College Events</Link></li>
              <li><Link to="/colleges" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Colleges Directory</Link></li>
              <li><Link to="/clubs" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Student Clubs</Link></li>
              <li><Link to="/teammates" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Teammate Matchmaker</Link></li>
            </ul>
          </div>

          {/* Roles */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1.25rem' }}>For Portals</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li><Link to="/login" style={{ color: '#94a3b8' }}>Student Portal</Link></li>
              <li><Link to="/login" style={{ color: '#94a3b8' }}>Club Organizer Console</Link></li>
              <li><Link to="/login" style={{ color: '#94a3b8' }}>College Admin Dashboard</Link></li>
              <li><Link to="/login" style={{ color: '#94a3b8' }}>Platform Administration</Link></li>
            </ul>
          </div>

          {/* Legal & Standards */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Security & Policies</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li><a href="#privacy" style={{ color: '#94a3b8' }}>Privacy Policy</a></li>
              <li><a href="#terms" style={{ color: '#94a3b8' }}>Terms of Service</a></li>
              <li><a href="#guidelines" style={{ color: '#94a3b8' }}>Community Guidelines</a></li>
              <li><span style={{ color: '#64748b' }}>Restricted to Approved Colleges</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
          }}
        >
          <p>© {new Date().getFullYear()} CampusConnect Platform. Designed for modern multi-college ecosystems.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Built with</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span>for university students across India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

