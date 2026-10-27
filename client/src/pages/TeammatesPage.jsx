import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StudentCard from '../components/StudentCard';
import {
  Users,
  Search,
  MessageSquare,
  PlusCircle,
  Sparkles,
  Send,
  CheckCircle,
  Building,
  Tag,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

const TeammatesPage = () => {
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('matchmaker'); // 'matchmaker', 'posts', 'connections'
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [posts, setPosts] = useState([]);
  const [connectionsData, setConnectionsData] = useState({ received: [], sent: [], connections: [] });
  const [loading, setLoading] = useState(true);

  // Search & filter
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');

  // Create collaboration post modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Fetch initial data
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

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (skillFilter.trim()) params.append('skill', skillFilter.trim());
      if (collegeFilter) params.append('college', collegeFilter);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.success && res.data) {
        setStudents(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      if (res.success && res.data) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConnections = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/connections/requests');
      if (res.success && res.data) {
        setConnectionsData(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'matchmaker') {
      fetchStudents();
    } else if (activeTab === 'posts') {
      fetchPosts();
    } else if (activeTab === 'connections') {
      fetchConnections();
    }
  }, [activeTab, skillFilter, collegeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;

    setSubmittingPost(true);
    try {
      const res = await api.post('/posts', {
        title: postTitle,
        content: postContent,
        requiredSkills: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      if (res.success) {
        setShowPostModal(false);
        setPostTitle('');
        setPostContent('');
        setRequiredSkills('');
        fetchPosts();
      }
    } catch (err) {
      alert(err.message || 'Failed to publish post');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleRespondConnection = async (id, status) => {
    try {
      await api.patch(`/connections/${id}`, { status });
      fetchConnections();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleAddComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    try {
      await api.post(`/posts/${postId}/comments`, { text: commentText });
      fetchPosts();
    } catch (err) {
      alert(err.message || 'Failed to comment');
    }
  };

  return (
    <div style={{ padding: '3rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>
              🤝 Student Network & Collaboration
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--secondary-900)', marginBottom: '0.5rem' }}>
              Find Teammates & Collaborators
            </h1>
            <p style={{ color: 'var(--secondary-500)', fontSize: '1rem', maxWidth: '700px' }}>
              Discover peers from other universities with the specific skills you need for hackathons, engineering capstones, and open source projects.
            </p>
          </div>

          {isAuthenticated && (
            <button onClick={() => setShowPostModal(true)} className="btn btn-primary">
              <PlusCircle size={16} /> Post Teammate Request
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            borderBottom: '2px solid var(--border-light)',
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={() => setActiveTab('matchmaker')}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'matchmaker' ? 'var(--primary-600)' : 'var(--secondary-500)',
              borderBottom: activeTab === 'matchmaker' ? '3px solid var(--primary-600)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Student Directory
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === 'posts' ? 'var(--primary-600)' : 'var(--secondary-500)',
              borderBottom: activeTab === 'posts' ? '3px solid var(--primary-600)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Collaboration Posts ({posts.length})
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('connections')}
              style={{
                padding: '0.75rem 1.25rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: activeTab === 'connections' ? 'var(--primary-600)' : 'var(--secondary-500)',
                borderBottom: activeTab === 'connections' ? '3px solid var(--primary-600)' : '3px solid transparent',
                marginBottom: '-2px',
              }}
            >
              My Network ({connectionsData.connections.length})
              {connectionsData.received.length > 0 && (
                <span className="badge badge-warning" style={{ marginLeft: '6px', fontSize: '0.7rem' }}>
                  {connectionsData.received.length} pending
                </span>
              )}
            </button>
          )}
        </div>

        {/* TAB 1: Student Directory Matchmaker */}
        {activeTab === 'matchmaker' && (
          <div>
            {/* Filter controls */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                      placeholder="Search students by name, skill, or department..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Search
                  </button>
                </form>

                <div style={{ minWidth: '180px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Filter by Skill (e.g. React, AI)"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                  />
                </div>

                <div style={{ minWidth: '180px' }}>
                  <select
                    className="form-select"
                    value={collegeFilter}
                    onChange={(e) => setCollegeFilter(e.target.value)}
                  >
                    <option value="">All Colleges</option>
                    {colleges.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Students Grid */}
            {loading ? (
              <div className="grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-lg)' }} />
                ))}
              </div>
            ) : students.length > 0 ? (
              <div className="grid-cols-3">
                {students.map((std) => (
                  <StudentCard key={std._id} student={std} currentUserId={user?._id} />
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--secondary-500)' }}>
                <Users size={48} color="var(--primary-300)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: 'var(--secondary-800)', marginBottom: '0.5rem' }}>No student profiles matched</h3>
                <p style={{ fontSize: '0.9rem' }}>Try searching broader skills or removing college filters.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Collaboration Posts Feed */}
        {activeTab === 'posts' && (
          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id} className="card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                    <img
                      src={
                        post.author?.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Student')}&background=6366f1&color=fff`
                      }
                      alt={post.author?.name}
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary-900)' }}>{post.author?.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>
                        {post.college?.name} • {new Date(post.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary-900)', marginBottom: '0.65rem' }}>
                    {post.title}
                  </h3>

                  <p style={{ fontSize: '0.95rem', color: 'var(--secondary-700)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {post.content}
                  </p>

                  {/* Required Skills */}
                  {post.requiredSkills && post.requiredSkills.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-500)', textTransform: 'uppercase' }}>
                        Skills Needed:
                      </span>
                      {post.requiredSkills.map((sk, idx) => (
                        <span key={idx} className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Comments Section */}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary-600)', marginBottom: '0.75rem' }}>
                      Replies ({post.comments?.length || 0})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                      {post.comments?.map((c, i) => (
                        <div key={i} style={{ background: 'var(--secondary-50)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--secondary-900)', marginRight: '6px' }}>
                            {c.user?.name}:
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--secondary-700)' }}>
                            {c.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Quick Comment Input */}
                    {isAuthenticated ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const input = e.target.elements.comment;
                          handleAddComment(post._id, input.value);
                          input.value = '';
                        }}
                        style={{ display: 'flex', gap: '0.5rem' }}
                      >
                        <input
                          name="comment"
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.85rem', padding: '0.5rem 0.8rem' }}
                          placeholder="Write a reply or offer to team up..."
                          required
                        />
                        <button type="submit" className="btn btn-primary btn-sm">
                          Reply
                        </button>
                      </form>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>
                        <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Log in</Link> to reply to this collaboration post.
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary-500)' }}>
                No project collaboration posts found. Be the first to post!
              </div>
            )}
          </div>
        )}

        {/* TAB 3: My Network & Connections */}
        {activeTab === 'connections' && isAuthenticated && (
          <div>
            {/* Received Requests */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary-900)', marginBottom: '1rem' }}>
                Pending Received Requests ({connectionsData.received.length})
              </h3>
              {connectionsData.received.length > 0 ? (
                <div className="grid-cols-2">
                  {connectionsData.received.map((req) => (
                    <div key={req._id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={req.requester?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.requester?.name || 'Student')}`}
                          alt={req.requester?.name}
                          style={{ width: '44px', height: '44px', borderRadius: '50%' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary-900)' }}>{req.requester?.name}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>{req.requester?.college?.name}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--secondary-600)', fontStyle: 'italic', marginTop: '2px' }}>
                            "{req.message}"
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleRespondConnection(req._id, 'accepted')} className="btn btn-primary btn-sm">
                          Accept
                        </button>
                        <button onClick={() => handleRespondConnection(req._id, 'rejected')} className="btn btn-secondary btn-sm">
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--secondary-500)', fontSize: '0.9rem' }}>No pending received requests.</p>
              )}
            </div>

            {/* Connected Peers */}
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary-900)', marginBottom: '1rem' }}>
                Connected Teammates ({connectionsData.connections.length})
              </h3>
              {connectionsData.connections.length > 0 ? (
                <div className="grid-cols-3">
                  {connectionsData.connections.map((conn) => {
                    const otherUser = conn.requester?._id === user._id ? conn.recipient : conn.requester;
                    return (
                      <div key={conn._id} className="card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <img
                            src={otherUser?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'Student')}`}
                            alt={otherUser?.name}
                            style={{ width: '42px', height: '42px', borderRadius: '50%' }}
                          />
                          <div>
                            <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary-900)' }}>{otherUser?.name}</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--secondary-500)' }}>{otherUser?.college?.name}</p>
                          </div>
                        </div>
                        {otherUser?.email && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600, marginTop: '0.5rem' }}>
                            ✉️ {otherUser.email}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--secondary-500)', fontSize: '0.9rem' }}>You have not connected with any students yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Modal: Create Collaboration Post */}
        {showPostModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--secondary-900)' }}>
                Post a Project Collaboration Request
              </h3>
              <form onSubmit={handleCreatePost}>
                <div className="form-group">
                  <label className="form-label">Headline / Goal *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Seeking ML Engineer for HackBengaluru 2026 AI Track"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Description & Context *</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder="Describe your project vision, what tech stack you are using, and what kind of teammate you want to work with..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Python, PyTorch, React, Tailwind CSS"
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setShowPostModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingPost} className="btn btn-primary btn-sm">
                    {submittingPost ? 'Publishing...' : 'Publish Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeammatesPage;

