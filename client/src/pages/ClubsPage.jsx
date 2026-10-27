import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ClubCard from '../components/ClubCard';
import { Search, Users, Globe, Building, Filter, X } from 'lucide-react';

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [college, setCollege] = useState('');
  const [externalOnly, setExternalOnly] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get('/colleges');
        if (res.success && res.data) {
          setColleges(res.data.colleges || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchColleges();
  }, []);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category !== 'All') params.append('category', category);
      if (college) params.append('college', college);
      if (externalOnly) params.append('externalOnly', 'true');

      const res = await api.get(`/clubs?${params.toString()}`);
      if (res.success && res.data) {
        setClubs(res.data.clubs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [category, college, externalOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClubs();
  };

  const categories = [
    'All',
    'Coding & Development',
    'Artificial Intelligence & Data',
    'Robotics & IoT',
    'Entrepreneurship & E-Cell',
    'Cultural & Performing Arts',
    'Photography & Media',
    'Dance & Choreography',
    'Design & UI/UX',
    'Literary & Debating',
  ];

  return (
    <div style={{ padding: '3rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>
            <Users size={12} /> Student Organizations
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--secondary-900)', marginBottom: '0.5rem' }}>
            College Clubs & Societies
          </h1>
          <p style={{ color: 'var(--secondary-500)', fontSize: '1rem', maxWidth: '700px' }}>
            Join technical guilds, cultural troupes, and research labs. Filter by domains or find clubs welcoming cross-college student memberships.
          </p>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={18}
                  color="var(--secondary-400)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="Search clubs by name or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </form>

            <div style={{ minWidth: '180px' }}>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: '180px' }}>
              <select className="form-select" value={college} onChange={(e) => setCollege(e.target.value)}>
                <option value="">All Colleges</option>
                {colleges.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: 'var(--secondary-700)' }}>
              <input
                type="checkbox"
                checked={externalOnly}
                onChange={(e) => setExternalOnly(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary-600)' }}
              />
              Cross-College Members Allowed
            </label>
          </div>
        </div>

        {/* Clubs Grid */}
        {loading ? (
          <div className="grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : clubs.length > 0 ? (
          <div className="grid-cols-3">
            {clubs.map((club) => (
              <ClubCard key={club._id} club={club} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--secondary-500)' }}>
            <Users size={48} color="var(--primary-300)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--secondary-800)', marginBottom: '0.5rem' }}>No clubs match your criteria</h3>
            <p style={{ fontSize: '0.9rem' }}>Try clearing filters to see all available student clubs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubsPage;

