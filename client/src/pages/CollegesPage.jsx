import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CollegeCard from '../components/CollegeCard';
import { Search, Building, MapPin, ShieldCheck, X } from 'lucide-react';

const CollegesPage = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (stateFilter) params.append('state', stateFilter);

      const res = await api.get(`/colleges?${params.toString()}`);
      if (res.success && res.data) {
        setColleges(res.data.colleges || []);
      }
    } catch (err) {
      console.error('Error fetching colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [stateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchColleges();
  };

  const states = ['Karnataka', 'Maharashtra', 'Telangana', 'Delhi', 'Tamil Nadu', 'West Bengal', 'Uttar Pradesh'];

  return (
    <div style={{ padding: '3rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>
            <ShieldCheck size={12} /> Institutional Directory
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--secondary-900)', marginBottom: '0.5rem' }}>
            Participating Colleges & Universities
          </h1>
          <p style={{ color: 'var(--secondary-500)', fontSize: '1rem', maxWidth: '700px' }}>
            Explore verified collegiate institutions across India connected on the CampusConnect ecosystem. Discover campus clubs and upcoming events.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '260px', display: 'flex', gap: '0.5rem' }}>
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
                  placeholder="Search college by name, city, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </form>

            <div style={{ minWidth: '200px' }}>
              <select
                className="form-select"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="">All States in India</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* College Grid */}
        {loading ? (
          <div className="grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : colleges.length > 0 ? (
          <div className="grid-cols-3">
            {colleges.map((col) => (
              <CollegeCard key={col._id} college={col} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--secondary-500)' }}>
            <Building size={48} color="var(--primary-300)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--secondary-800)', marginBottom: '0.5rem' }}>No colleges match your search</h3>
            <p style={{ fontSize: '0.9rem' }}>Try clearing filters to view all participating institutions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegesPage;

