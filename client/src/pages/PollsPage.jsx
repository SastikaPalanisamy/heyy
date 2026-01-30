import React, { useEffect, useState } from 'react';
import { PlusCircle, BarChart3, Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import "../Dashboard.css";

export default function PollsPage({ onNavigate, user }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/polls');
        setPolls(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Polls Fetch Error:", err);
        setPolls([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, []);

  return (
    <div className="civix-body">
      {/* --- HERO SECTION --- */}
      <section className="welcome-hero" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '30px' }}>
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} color="#3b82f6" />
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Community Feedback</h2>
          </div>
          <p style={{ color: '#64748b' }}>Make your voice heard in the current active consultations.</p>
        </div>

        <button onClick={() => onNavigate('create-poll')} style={createBtnStyle}>
          <PlusCircle size={18} /> New Poll
        </button>
      </section>

      {/* --- POLLS GRID --- */}
      {loading ? (
        <div className="loading-text" style={{ textAlign: 'center', padding: '100px', color: '#3b82f6' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '10px', fontSize: '13px', letterSpacing: '1px' }}>LOADING NODES...</p>
        </div>
      ) : (
        <div className="petition-grid">
          {polls.map(poll => {
            const totalVotes = poll.options?.reduce((acc, opt) => acc + (opt.votes || 0), 0) || 0;
            // CHECK IF USER HAS VOTED
            const hasVoted = user && (poll.voters || []).some(v => v.userId === user._id);

            return (
              <div key={poll._id} className="case-card" style={cardStyle}>
                
                {/* 1. HEADER - Showing Voted Status or Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  {hasVoted ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '11px', fontWeight: '700' }}>
                      <CheckCircle2 size={14} /> VOTED
                    </div>
                  ) : (
                    <div style={{ color: '#3b82f6', fontSize: '11px', fontWeight: '700' }}>ACTIVE</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontSize: '11px' }}>
                    <Clock size={12} /> {new Date(poll.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* 2. CONTENT */}
                <h3 style={pollTitleStyle}>{poll.title}</h3>
                <p style={pollDescStyle} className="line-clamp-2">{poll.description}</p>

                {/* 3. DYNAMIC OPTIONS PREVIEW */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {poll.options?.slice(0, 2).map((opt, i) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                    return (
                      <div key={i} style={miniProgressBarStyle}>
                        <div style={{ ...fillOverlayStyle, width: `${pct}%`, background: hasVoted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)' }} />
                        <div style={progressTextStyle}>
                          <span>{opt.text}</span>
                          <span style={{ fontWeight: '700' }}>{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 4. FOOTER */}
                <div style={footerStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '12px' }}>
                    <Users size={14} /> <span>{totalVotes} participants</span>
                  </div>
                  
                  <button onClick={() => onNavigate('poll-detail', poll)} style={viewBtnStyle}>
                    {hasVoted ? 'VIEW RESULTS AND DETAILS' : 'VIEW DETAILS AND CAST VOTE'} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* --- REFINED STYLES --- */
const createBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '8px',
  background: '#3b82f6', color: 'white', border: 'none',
  padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
  fontWeight: '700', fontSize: '13px'
};

const cardStyle = {
  background: '#0f172a', border: '1px solid #1e293b',
  padding: '25px', borderRadius: '16px', display: 'flex', flexDirection: 'column',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const pollTitleStyle = { color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '8px' };
const pollDescStyle = { color: '#64748b', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' };

const miniProgressBarStyle = {
  position: 'relative', height: '36px', background: 'rgba(255,255,255,0.02)',
  borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e293b'
};

const fillOverlayStyle = { height: '100%', transition: 'width 0.8s ease' };
const progressTextStyle = {
  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '0 15px', fontSize: '12px', color: '#cbd5e1'
};

const footerStyle = {
  marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #1e293b',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};

const viewBtnStyle = {
  background: 'none', border: 'none', color: '#3b82f6',
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
  fontWeight: '800', fontSize: '12px', letterSpacing: '0.5px', textTransform: 'uppercase'
};