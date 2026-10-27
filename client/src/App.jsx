import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import CollegesPage from './pages/CollegesPage';
import CollegeProfilePage from './pages/CollegeProfilePage';
import ClubsPage from './pages/ClubsPage';
import ClubDetailsPage from './pages/ClubDetailsPage';
import TeammatesPage from './pages/TeammatesPage';
import ProfilePage from './pages/ProfilePage';

import StudentDashboard from './pages/StudentDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CollegeAdminDashboard from './pages/CollegeAdminDashboard';
import PlatformAdminDashboard from './pages/PlatformAdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/colleges" element={<CollegesPage />} />
              <Route path="/colleges/:id" element={<CollegeProfilePage />} />
              <Route path="/clubs" element={<ClubsPage />} />
              <Route path="/clubs/:id" element={<ClubDetailsPage />} />
              <Route path="/teammates" element={<TeammatesPage />} />

              {/* Protected User Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Role-Based Protected Dashboards */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student', 'organizer', 'college_admin', 'platform_admin']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'college_admin', 'platform_admin']}>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/college-admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['college_admin', 'platform_admin']}>
                    <CollegeAdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/platform-admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['platform_admin']}>
                    <PlatformAdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

