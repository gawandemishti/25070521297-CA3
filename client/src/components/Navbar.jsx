import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  GraduationCap,
  Calendar,
  Users,
  Compass,
  Bell,
  LogOut,
  User,
  LayoutDashboard,
  Menu,
  X,
  CheckCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isStudent, isOrganizer, isCollegeAdmin, isPlatformAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  // Fetch notifications if logged in
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          if (res.success && res.data) {
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
          }
        } catch {
          // Soft fail
        }
      };

      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000); // 25s polling
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const markNotificationRead = async (id, link) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (link) navigate(link);
    } catch {
      if (link) navigate(link);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardPath = () => {
    if (isStudent) return '/student/dashboard';
    if (isOrganizer) return '/organizer/dashboard';
    if (isCollegeAdmin) return '/college-admin/dashboard';
    if (isPlatformAdmin) return '/platform-admin/dashboard';
    return '/student/dashboard';
  };

  const getRoleBadge = () => {
    if (isPlatformAdmin) return <span className="badge badge-danger">Platform Admin</span>;
    if (isCollegeAdmin) return <span className="badge badge-indigo">College Admin</span>;
    if (isOrganizer) return <span className="badge badge-warning">Organizer</span>;
    return <span className="badge badge-neutral">Student</span>;
  };

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem',
        }}
      >
        {/* Brand Logo & Tagline */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--violet-600) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--secondary-900)',
                  letterSpacing: '-0.02em',
                }}
              >
                Campus<span style={{ color: 'var(--primary-600)' }}>Connect</span>
              </span>
            </div>
            <p
              style={{
                fontSize: '0.68rem',
                color: 'var(--secondary-500)',
                fontWeight: 600,
                letterSpacing: '0.01em',
                lineHeight: 1,
              }}
            >
              Different Colleges. One Community.
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="desktop-nav">
          <Link
            to="/events"
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: location.pathname.startsWith('/events') ? 'var(--primary-600)' : 'var(--secondary-600)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Calendar size={16} />
            Explore Events
          </Link>
          <Link
            to="/colleges"
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: location.pathname.startsWith('/colleges') ? 'var(--primary-600)' : 'var(--secondary-600)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Compass size={16} />
            Colleges
          </Link>
          <Link
            to="/clubs"
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: location.pathname.startsWith('/clubs') ? 'var(--primary-600)' : 'var(--secondary-600)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Users size={16} />
            Clubs
          </Link>
          <Link
            to="/teammates"
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: location.pathname.startsWith('/teammates') ? 'var(--primary-600)' : 'var(--secondary-600)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <GraduationCap size={16} />
            Find Teammates
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              {/* Role-Specific Dashboard Shortcut Button */}
              <Link to={getDashboardPath()} className="btn btn-secondary btn-sm desktop-only">
                <LayoutDashboard size={15} />
                Dashboard
              </Link>

              {/* In-app Notification Bell */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  style={{
                    position: 'relative',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--secondary-700)',
                    backgroundColor: 'var(--secondary-100)',
                    transition: 'all 0.2s',
                  }}
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        background: 'var(--danger)',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #ffffff',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Drawer */}
                {notifDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '46px',
                      width: '340px',
                      background: '#ffffff',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      padding: '0.75rem',
                      zIndex: 100,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.5rem 0.75rem',
                        borderBottom: '1px solid var(--border-light)',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--secondary-900)' }}>
                        Notifications ({unreadCount})
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600 }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--secondary-400)', fontSize: '0.85rem' }}>
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => markNotificationRead(n._id, n.link)}
                            style={{
                              padding: '0.75rem',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: n.isRead ? 'transparent' : 'var(--primary-50)',
                              cursor: 'pointer',
                              marginBottom: '0.25rem',
                              transition: 'background 0.15s',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--secondary-900)' }}>
                                {n.title}
                              </span>
                              {!n.isRead && (
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-600)' }} />
                              )}
                            </div>
                            <p style={{ fontSize: '0.775rem', color: 'var(--secondary-600)', lineHeight: 1.3 }}>
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--secondary-50)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <img
                    src={
                      user.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`
                    }
                    alt={user.name}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--secondary-800)',
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    className="desktop-only"
                  >
                    {user.name}
                  </span>
                  <ChevronDown size={14} color="var(--secondary-500)" />
                </button>

                {profileDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '46px',
                      width: '240px',
                      background: '#ffffff',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      padding: '0.75rem',
                      zIndex: 100,
                    }}
                  >
                    <div style={{ padding: '0.5rem 0.5rem 0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--secondary-900)' }}>
                        {user.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', marginBottom: '0.35rem' }}>
                        {user.email}
                      </p>
                      {getRoleBadge()}
                      {user.college && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--secondary-600)', marginTop: '0.4rem', fontWeight: 500 }}>
                          🏛️ {user.college.name}
                        </p>
                      )}
                    </div>

                    <div style={{ padding: '0.5rem 0' }}>
                      <Link
                        to={getDashboardPath()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          color: 'var(--secondary-700)',
                          fontWeight: 500,
                        }}
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          color: 'var(--secondary-700)',
                          fontWeight: 500,
                        }}
                      >
                        <User size={16} />
                        Profile & Settings
                      </Link>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
                      <button
                        onClick={logout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          color: 'var(--danger)',
                          fontWeight: 600,
                        }}
                      >
                        <LogOut size={16} />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join Platform
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              padding: '0.5rem',
              color: 'var(--secondary-700)',
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--border-light)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Link to="/events" style={{ fontWeight: 600, color: 'var(--secondary-800)' }}>
            Explore Events
          </Link>
          <Link to="/colleges" style={{ fontWeight: 600, color: 'var(--secondary-800)' }}>
            Colleges Directory
          </Link>
          <Link to="/clubs" style={{ fontWeight: 600, color: 'var(--secondary-800)' }}>
            Clubs Directory
          </Link>
          <Link to="/teammates" style={{ fontWeight: 600, color: 'var(--secondary-800)' }}>
            Find Teammates
          </Link>
          {isAuthenticated && (
            <>
              <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.5rem 0' }} />
              <Link to={getDashboardPath()} style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                Go to Dashboard
              </Link>
              <Link to="/profile" style={{ fontWeight: 600, color: 'var(--secondary-800)' }}>
                Account Settings
              </Link>
              <button onClick={logout} style={{ textAlign: 'left', fontWeight: 600, color: 'var(--danger)' }}>
                Log Out
              </button>
            </>
          )}
        </div>
      )}

      {/* Embedded CSS for responsive hiding */}
      <style>{`
        @media (max-width: 840px) {
          .desktop-nav, .desktop-only {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;

