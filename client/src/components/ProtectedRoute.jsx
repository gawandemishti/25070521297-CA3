import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--secondary-500)', fontSize: '0.9rem' }}>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate role dashboard
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'organizer') return <Navigate to="/organizer/dashboard" replace />;
    if (user.role === 'college_admin') return <Navigate to="/college-admin/dashboard" replace />;
    if (user.role === 'platform_admin') return <Navigate to="/platform-admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

