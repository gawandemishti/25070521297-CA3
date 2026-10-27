import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import CollegeCard from '../components/CollegeCard';
import ClubCard from '../components/ClubCard';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Building,
  Users,
  Award,
  Globe,
  Compass,
  CheckCircle,
  ShieldCheck,
  TrendingUp,
  Cpu,
} from 'lucide-react';

const LandingPage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [featuredClubs, setFeaturedClubs] = useState([]);
  const [stats, setStats] = useState({
    colleges: 5,
    events: 10,
    clubs: 8,
    students: 150,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [eventsRes, collegesRes, clubsRes] = await Promise.all([
          api.get('/events?limit=3&sortBy=startDate&order=asc'),
          api.get('/colleges?limit=4'),
          api.get('/clubs?limit=4'),
        ]);

        if (eventsRes.success && eventsRes.data) {
          setFeaturedEvents(eventsRes.data.events || []);
        }
        if (collegesRes.success && collegesRes.data) {
          setColleges(collegesRes.data.colleges || []);
        }
        if (clubsRes.success && clubsRes.data) {
          setFeaturedClubs(clubsRes.data.clubs || []);
        }

        // Live counts
        setStats({
          colleges: collegesRes.pagination?.total || 5,
          events: eventsRes.pagination?.total || 10,
          clubs: clubsRes.pagination?.total || 8,
          students: 240,
        });
      } catch (err) {
        console.warn('Using default demo stats while backend connects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  return (
    <div>
      {/* 1. Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '6rem 0 5rem',
          background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 100%)',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Background Grid Pattern & Glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            opacity: 0.6,
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '880px' }}>
          {/* Tagline Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              backdropFilter: 'blur(8px)',
              marginBottom: '1.75rem',
            }}
          >
            <Sparkles size={15} color="var(--primary-200)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-200)', letterSpacing: '0.02em' }}>
              Different Colleges. One Community.
            </span>
          </div>

          {/* Master Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
            }}
          >
            Your College Is Your Beginning.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #a5b4fc 0%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              The World Is Your Campus.
            </span>
          </h1>

          {/* Supporting Description */}
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              lineHeight: 1.6,
              color: '#94a3b8',
              maxWidth: '720px',
              margin: '0 auto 2.5rem',
            }}
          >
            CampusConnect bridges institutions across India into a unified digital ecosystem. Discover hackathons outside your campus, join inter-college clubs, find skilled teammates, and collaborate with peers nationwide.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '4rem',
            }}
          >
            <Link to="/events" className="btn btn-primary btn-lg">
              Explore Events <ArrowRight size={18} />
            </Link>
            <Link
              to="/register"
              className="btn btn-secondary btn-lg"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Join CampusConnect
            </Link>
          </div>

          {/* Platform Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div>
              <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                {stats.colleges}+
              </p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Colleges Connected</p>
            </div>
            <div>
              <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                {stats.events}+
              </p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Active Events</p>
            </div>
            <div>
              <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                {stats.clubs}+
              </p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Student Clubs</p>
            </div>
            <div>
              <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                100%
              </p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Verified Multi-Campus</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Inter-College Events */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>
                <Globe size={12} /> Cross-Campus Discovery
              </span>
              <h2 style={{ fontSize: '2rem', color: 'var(--secondary-900)' }}>
                Featured Inter-College Events
              </h2>
              <p style={{ color: 'var(--secondary-500)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Competitions, hackathons, and symposiums open to multiple institutions.
              </p>
            </div>
            <Link to="/events" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              View All Events <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid-cols-3">
              {featuredEvents.map((evt) => (
                <EventCard key={evt._id} event={evt} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-500)' }}>
              No events available yet. Check back soon!
            </div>
          )}
        </div>
      </section>

      {/* 3. Participating Institutions */}
      <section className="section" style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>
              <ShieldCheck size={12} /> Approved Network
            </span>
            <h2 style={{ fontSize: '2rem', color: 'var(--secondary-900)', marginBottom: '0.5rem' }}>
              Participating Colleges Across India
            </h2>
            <p style={{ color: 'var(--secondary-500)', fontSize: '0.95rem' }}>
              Every institution on CampusConnect is verified to guarantee authentic student communities, faculty approvals, and inter-collegiate prestige.
            </p>
          </div>

          <div className="grid-cols-4">
            {colleges.map((college) => (
              <CollegeCard key={college._id} college={college} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/colleges" className="btn btn-secondary">
              Browse College Directory ({stats.colleges} Institutions) <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Active Clubs & Societies */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>
                <Users size={12} /> Student Communities
              </span>
              <h2 style={{ fontSize: '2rem', color: 'var(--secondary-900)' }}>
                Clubs & Special Interest Groups
              </h2>
              <p style={{ color: 'var(--secondary-500)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Join tech clubs, robotics labs, E-cells, and creative guilds accepting cross-college members.
              </p>
            </div>
            <Link to="/clubs" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Explore All Clubs <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-cols-4">
            {featuredClubs.map((club) => (
              <ClubCard key={club._id} club={club} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Teammate Networking Spotlight */}
      <section
        className="section"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div>
              <span className="badge badge-warning" style={{ marginBottom: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                🤝 Inter-College Teammate Matchmaker
              </span>
              <h2 style={{ fontSize: '2.25rem', color: '#ffffff', lineHeight: 1.25, marginBottom: '1rem' }}>
                Building a Hackathon Team? Find Your Missing Specialist.
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                Need a Python machine learning developer from Bangalore or a UI/UX Figma designer from Mumbai? Post project collaboration requests, search students by specific tech stacks, and form inter-college teams with ease.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/teammates" className="btn btn-primary">
                  Find Teammates Now <ArrowRight size={16} />
                </Link>
                <Link to="/register" className="btn btn-secondary" style={{ background: 'transparent', color: '#ffffff', borderColor: '#64748b' }}>
                  Create Student Profile
                </Link>
              </div>
            </div>

            {/* Visual Teammate Card Mockup */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop"
                  alt="Aarav"
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '1.1rem' }}>Aarav Mehta</h4>
                  <p style={{ color: '#a5b4fc', fontSize: '0.85rem' }}>Apex Institute of Technology, Bengaluru</p>
                </div>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                "Looking for a Machine Learning engineer for HackBengaluru 2026. We already have frontend and backend covered!"
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span className="badge badge-neutral" style={{ background: '#334155', color: '#ffffff' }}>Python</span>
                <span className="badge badge-neutral" style={{ background: '#334155', color: '#ffffff' }}>PyTorch</span>
                <span className="badge badge-neutral" style={{ background: '#334155', color: '#ffffff' }}>LangChain</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>Status: 1 slot remaining</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Active Collaboration Post</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Evaluator & Student Testimonials (Clearly Identified Demonstration Content) */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
            <span className="badge badge-neutral" style={{ marginBottom: '0.5rem' }}>
              Demonstration Showcase
            </span>
            <h2 style={{ fontSize: '2rem', color: 'var(--secondary-900)', marginBottom: '0.5rem' }}>
              What Students & Organizers Say
            </h2>
            <p style={{ color: 'var(--secondary-500)', fontSize: '0.9rem' }}>
              Sample demonstration feedback from our multi-college pilot participants.
            </p>
          </div>

          <div className="grid-cols-3">
            <div className="card" style={{ padding: '1.75rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--secondary-700)', lineHeight: 1.6, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                "Discovering HackBengaluru while studying in Mumbai opened doors I didn't know existed. Our cross-college team won 2nd prize!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop"
                  alt="Pooja"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--secondary-900)' }}>Pooja Nair</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>Horizon College, Mumbai</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--secondary-700)', lineHeight: 1.6, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                "Managing registrations for our robotics symposium used to require 3 separate Google forms. CampusConnect simplified everything into one verified pipeline."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop"
                  alt="Vikram"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--secondary-900)' }}>Vikram Malhotra</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>Lead Organizer, Apex Tech</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--secondary-700)', lineHeight: 1.6, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                "As an administrator, being able to verify our college presence while seeing our students collaborate across institutions is truly transformative."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
                  alt="Prof Kulkarni"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--secondary-900)' }}>Prof. Rajesh Kulkarni</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>Dean of Student Affairs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom Call to Action */}
      <section
        style={{
          padding: '5rem 0',
          background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--violet-600) 100%)',
          color: '#ffffff',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '680px' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '1rem' }}>
            Ready to Expand Your Horizon?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '2rem' }}>
            Join thousands of university students connecting across institutions today. Free forever for students.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
              Create Student Account
            </Link>
            <Link to="/events" className="btn btn-outline btn-lg" style={{ borderColor: '#ffffff', color: '#ffffff' }}>
              Browse Inter-College Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

