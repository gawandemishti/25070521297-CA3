import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ShieldAlert,
  Building,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Ticket,
  AlertTriangle,
  UserX,
  UserCheck,
  TrendingUp,
  PieChart as PieIcon,
  BarChart as BarIcon,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const PlatformAdminDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [pendingColleges, setPendingColleges] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subtabs: 'overview', 'verifications', 'users', 'moderation'
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  const fetchPlatformData = async () => {
    setLoading(true);
    try {
      const [dashRes, pendRes, usersRes, reportsRes] = await Promise.all([
        api.get('/dashboard/platform-admin'),
        api.get('/admin/colleges/pending'),
        api.get('/admin/users?limit=30'),
        api.get('/admin/reports'),
      ]);

      if (dashRes.success && dashRes.data) {
        setStatsData(dashRes.data);
      }
      if (pendRes.success && pendRes.data) {
        setPendingColleges(pendRes.data.colleges || []);
      }
      if (usersRes.success && usersRes.data) {
        setUsersList(usersRes.data.users || []);
      }
      if (reportsRes.success && reportsRes.data) {
        setReports(reportsRes.data.reports || []);
      }
    } catch (err) {
      console.error('Error loading platform admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const handleVerifyCollege = async (collegeId, status) => {
    try {
      const res = await api.patch(`/admin/colleges/${collegeId}/verification`, { status });
      if (res.success) {
        fetchPlatformData();
      }
    } catch (err) {
      alert(err.message || 'Verification update failed');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, { role: newRole });
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      await api.patch(`/admin/reports/${reportId}`, { status });
      fetchPlatformData();
    } catch (err) {
      alert(err.message || 'Failed to resolve report');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }} />
        <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      </div>
    );
  }

  const { stats = {}, charts = {} } = statsData || {};

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div
          className="card"
          style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <span className="badge badge-danger" style={{ marginBottom: '0.4rem' }}>
              Platform Super-Administrator
            </span>
            <h1 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.25rem' }}>
              CampusConnect Platform Command Center
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Ecosystem governance, college approvals, user role moderation, and platform-wide live telemetry.
            </p>
          </div>

          <button onClick={fetchPlatformData} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
            <RefreshCw size={14} /> Refresh Metrics
          </button>
        </div>

        {/* Live Metric Cards Grid */}
        <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Colleges Connected
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-600)', margin: '0.25rem 0' }}>
              {stats.totalColleges || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>
              {stats.verifiedColleges || 0} verified ({stats.pendingColleges || 0} pending)
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Registered Students
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--success)', margin: '0.25rem 0' }}>
              {stats.totalStudents || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>
              + {stats.totalOrganizers || 0} authorized organizers
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Events Published
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--violet-600)', margin: '0.25rem 0' }}>
              {stats.publishedEvents || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>
              {stats.totalRegistrations || 0} total tickets issued
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', textTransform: 'uppercase', fontWeight: 700 }}>
              Campus Clubs
            </span>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--warning)', margin: '0.25rem 0' }}>
              {stats.totalClubs || 0}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>Cross-college organizations</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border-light)', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'overview' ? 'var(--primary-600)' : 'var(--secondary-500)',
              borderBottom: activeTab === 'overview' ? '3px solid var(--primary-600)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Analytics & Charts
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'verifications' ? 'var(--primary-600)' : 'var(--secondary-500)',
              borderBottom: activeTab === 'verifications' ? '3px solid var(--primary-600)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Pending Verifications ({pendingColleges.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'users' ? 'var(--primary-600)' : 'var(--secondary-500)',
              borderBottom: activeTab === 'users' ? '3px solid var(--primary-600)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            User Management ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'moderation' ? 'var(--primary-600)' : 'var(--secondary-500)',
              borderBottom: activeTab === 'moderation' ? '3px solid var(--primary-600)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Reports & Moderation ({reports.length})
          </button>
        </div>

        {/* TAB 1: Analytics & Recharts */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
              {/* Chart 1: Events by Category */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BarIcon size={18} color="var(--primary-600)" />
                  Events Distribution by Category
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--secondary-500)', marginBottom: '1.5rem' }}>
                  Live aggregate counts from MongoDB event records.
                </p>
                <div style={{ width: '100%', height: '280px' }}>
                  {charts.categoryDistribution && charts.categoryDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={charts.categoryDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Events" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--secondary-400)' }}>
                      No category metrics available
                    </p>
                  )}
                </div>
              </div>

              {/* Chart 2: Colleges by State */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={18} color="var(--violet-600)" />
                  Participating Colleges by State
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--secondary-500)', marginBottom: '1.5rem' }}>
                  Geographic distribution across Indian states.
                </p>
                <div style={{ width: '100%', height: '280px' }}>
                  {charts.collegesByState && charts.collegesByState.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={charts.collegesByState}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="state" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Colleges" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--secondary-400)' }}>
                      No state metrics available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: College Verifications */}
        {activeTab === 'verifications' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary-900)', marginBottom: '0.5rem' }}>
              College Registration Verifications
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-500)', marginBottom: '1.5rem' }}>
              Colleges must be verified by Platform Administrators before they can publish public events.
            </p>

            {pendingColleges.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--secondary-600)' }}>
                      <th style={{ padding: '0.75rem' }}>College Name</th>
                      <th style={{ padding: '0.75rem' }}>Location</th>
                      <th style={{ padding: '0.75rem' }}>Website</th>
                      <th style={{ padding: '0.75rem' }}>Submitted By</th>
                      <th style={{ padding: '0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingColleges.map((col) => (
                      <tr key={col._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <strong>{col.name}</strong>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {col.city}, {col.state}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {col.website ? (
                            <a href={col.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-600)' }}>
                              {col.website}
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>{col.submittedBy?.name || 'Self-submitted'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleVerifyCollege(col._id, 'verified')}
                              className="btn btn-primary btn-sm"
                            >
                              <CheckCircle size={14} /> Approve & Verify
                            </button>
                            <button
                              onClick={() => handleVerifyCollege(col._id, 'rejected')}
                              className="btn btn-danger btn-sm"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary-500)' }}>
                <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 0.75rem' }} />
                <h4>No pending college verifications</h4>
                <p style={{ fontSize: '0.85rem' }}>All registered institutions are verified.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: User Management */}
        {activeTab === 'users' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary-900)' }}>
                  Platform User Directory ({filteredUsers.length})
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary-500)' }}>
                  Manage accounts, adjust privileges, or suspend violating profiles.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '220px', fontSize: '0.85rem' }}
                  placeholder="Search user by name/email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <select
                  className="form-select"
                  style={{ width: '160px', fontSize: '0.85rem' }}
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  <option value="student">Student</option>
                  <option value="organizer">Organizer</option>
                  <option value="college_admin">College Admin</option>
                  <option value="platform_admin">Platform Admin</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--secondary-600)' }}>
                    <th style={{ padding: '0.65rem' }}>User</th>
                    <th style={{ padding: '0.65rem' }}>College</th>
                    <th style={{ padding: '0.65rem' }}>Current Role</th>
                    <th style={{ padding: '0.65rem' }}>Status</th>
                    <th style={{ padding: '0.65rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.65rem' }}>
                        <strong>{u.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '0.65rem' }}>{u.college?.name || 'Platform HQ'}</td>
                      <td style={{ padding: '0.65rem' }}>
                        <select
                          className="form-select"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: '130px' }}
                          value={u.role}
                          onChange={(e) => handleChangeUserRole(u._id, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="organizer">Organizer</option>
                          <option value="college_admin">College Admin</option>
                          <option value="platform_admin">Platform Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.65rem' }}>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem' }}>
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                          className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Moderation Reports */}
        {activeTab === 'moderation' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary-900)', marginBottom: '0.5rem' }}>
              Flagged Content & Reports
            </h3>
            {reports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reports.map((r) => (
                  <div
                    key={r._id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <span className="badge badge-warning" style={{ marginBottom: '0.25rem' }}>
                        {r.contentType.toUpperCase()} REPORT
                      </span>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary-900)' }}>
                        Target: {r.targetTitle || r.targetId}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--danger)', margin: '0.25rem 0' }}>
                        Reason: {r.reason}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>
                        Reported by: {r.reporter?.name} ({r.reporter?.email})
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleResolveReport(r._id, 'resolved')}
                        className="btn btn-primary btn-sm"
                      >
                        Resolve & Clean
                      </button>
                      <button
                        onClick={() => handleResolveReport(r._id, 'dismissed')}
                        className="btn btn-secondary btn-sm"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary-500)' }}>
                <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 0.75rem' }} />
                <h4>Zero reported content items</h4>
                <p style={{ fontSize: '0.85rem' }}>Platform is safe and within community guidelines.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformAdminDashboard;

