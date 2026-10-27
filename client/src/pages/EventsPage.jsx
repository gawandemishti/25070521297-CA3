import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { Search, Filter, Calendar, MapPin, Globe, RefreshCw, X } from 'lucide-react';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [college, setCollege] = useState('');
  const [city, setCity] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('All');
  const [scope, setScope] = useState('All');
  const [feeType, setFeeType] = useState('all');
  const [timeframe, setTimeframe] = useState('upcoming');
  const [page, setPage] = useState(1);

  // Fetch colleges list for filter dropdown
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get('/colleges');
        if (res.success && res.data) {
          setColleges(res.data.colleges || []);
        }
      } catch (err) {
        console.error('Error fetching colleges:', err);
      }
    };
    fetchColleges();
  }, []);

  // Fetch events on filters or page change
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category !== 'All') params.append('category', category);
      if (college) params.append('college', college);
      if (city) params.append('city', city);
      if (deliveryMode !== 'All') params.append('deliveryMode', deliveryMode);
      if (scope !== 'All') params.append('scope', scope);
      if (feeType !== 'all') params.append('feeType', feeType);
      if (timeframe !== 'all') params.append('timeframe', timeframe);
      params.append('page', page);
      params.append('limit', 9);

      const res = await api.get(`/events?${params.toString()}`);
      if (res.success && res.data) {
        setEvents(res.data.events || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, college, city, deliveryMode, scope, feeType, timeframe, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setCollege('');
    setCity('');
    setDeliveryMode('All');
    setScope('All');
    setFeeType('all');
    setTimeframe('upcoming');
    setPage(1);
  };

  const categories = [
    'All',
    'Hackathon',
    'Coding Competition',
    'Workshop & Bootcamp',
    'Cultural Fest',
    'Technical Symposium',
    'Seminar & Guest Lecture',
    'Robotics & Gaming',
    'Sports & Athletics',
    'Paper & Project Expo',
  ];

  return (
    <div style={{ padding: '3rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>
            <Globe size={12} /> Pan-India Collegiate Events
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--secondary-900)', marginBottom: '0.5rem' }}>
            Explore Inter-College Events
          </h1>
          <p style={{ color: 'var(--secondary-500)', fontSize: '1rem', maxWidth: '700px' }}>
            Discover hackathons, symposiums, design sprints, and cultural fests hosted across top universities. Filter by eligibility, college, and domain.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            marginBottom: '2.5rem',
            background: '#ffffff',
          }}
        >
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={18}
                color="var(--secondary-400)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="Search events by title, keywords, or topics (e.g., AI, Hackathon, Robotics)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
              Search
            </button>
          </form>

          {/* Filter Dropdowns Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            {/* Category */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Category
              </label>
              <select
                className="form-select"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Organizing College */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Organizing College
              </label>
              <select
                className="form-select"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                value={college}
                onChange={(e) => {
                  setCollege(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Colleges</option>
                {colleges.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Mode */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Mode
              </label>
              <select
                className="form-select"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                value={deliveryMode}
                onChange={(e) => {
                  setDeliveryMode(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Modes</option>
                <option value="offline">Offline / In-Person</option>
                <option value="online">Virtual / Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Participation Scope (Crucial Multi-College Filter) */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Participation Scope
              </label>
              <select
                className="form-select"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Scopes</option>
                <option value="all">Open to All Colleges</option>
                <option value="selected_colleges">Selected Colleges Only</option>
                <option value="own_college_only">Internal Campus Only</option>
              </select>
            </div>

            {/* Fee */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Pricing
              </label>
              <select
                className="form-select"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                value={feeType}
                onChange={(e) => {
                  setFeeType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Events</option>
                <option value="free">Free Only</option>
                <option value="paid">Paid Only</option>
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Timeline
              </label>
              <select
                className="form-select"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                value={timeframe}
                onChange={(e) => {
                  setTimeframe(e.target.value);
                  setPage(1);
                }}
              >
                <option value="upcoming">Upcoming Events</option>
                <option value="past">Past / Concluded</option>
                <option value="all">All Dates</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              onClick={resetFilters}
              style={{
                fontSize: '0.8rem',
                color: 'var(--secondary-500)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600,
              }}
            >
              <X size={14} /> Clear All Filters
            </button>
          </div>
        </div>

        {/* Results Count Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--secondary-600)' }}>
            Showing <strong>{events.length}</strong> of <strong>{pagination.total}</strong> events found
          </p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="skeleton" style={{ height: '380px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid-cols-3">
            {events.map((evt) => (
              <EventCard key={evt._id} event={evt} />
            ))}
          </div>
        ) : (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              color: 'var(--secondary-500)',
            }}
          >
            <Calendar size={48} color="var(--primary-300)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--secondary-800)', marginBottom: '0.5rem' }}>No events match your criteria</h3>
            <p style={{ fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
              Try adjusting your search terms, changing the category, or switching timeline filters.
            </p>
            <button onClick={resetFilters} className="btn btn-secondary btn-sm">
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '3.5rem',
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary-600)', margin: '0 0.5rem' }}>
              Page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;

