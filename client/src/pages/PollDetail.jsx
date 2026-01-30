import React, { useState } from "react";
import { ArrowLeft, Users, Info, CheckCircle2, Calendar, User, BarChart3, Fingerprint } from "lucide-react";
import axios from "axios";

export default function PollDetail({ poll, user, onNavigate }) {
  const [local, setLocal] = useState(poll);
  const [loading, setLoading] = useState(false);
  // determine current user's vote from poll.voters
  const userVoteEntry = (poll?.voters || []).find(v => v.userId === user?._id);
  const userVotedIndexInitial = userVoteEntry ? userVoteEntry.optionIndex : null;
  const [userVotedIndex, setUserVotedIndex] = useState(userVotedIndexInitial);

  if (!local) return (
    <div className="civix-body" style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '100px' }}>
      <div className="spinner" style={{ marginBottom: '20px' }}></div>
      <p>Synchronizing poll data...</p>
    </div>
  );

  const totalVotes = local.options?.reduce((acc, opt) => acc + (opt.votes || 0), 0) || 0;

  const handleVote = async (idx) => {
    if (loading) return;
    if (!user || !user._id) return alert('Please login to vote');
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/polls/vote/${local._id}`, { 
        optionIndex: idx,
        userId: user._id
      });
      if (res.data.poll) {
        setLocal(res.data.poll);
        // update local user voted index based on server voters
        const entry = (res.data.poll.voters || []).find(v => v.userId === user._id);
        setUserVotedIndex(entry ? entry.optionIndex : null);
        // refresh dashboard feed
        try { window.dispatchEvent(new Event('civix:refreshDashboard')); } catch(e){}
      }
    } catch (err) {
      console.error(err);
      alert("Verification Failed: Could not record vote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="civix-body" style={{ background: '#020408', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* TOP NAVIGATION */}
        <button 
          onClick={() => onNavigate('polls')} 
          style={backButtonStyle}
        >
          <ArrowLeft size={16} /> BACK TO COMMUNITY FEED
        </button>

        <div style={mainCardStyle}>
          {/* HEADER SECTION */}
          <header style={{ marginBottom: '40px', borderBottom: '1px solid #1e293b', paddingBottom: '30px' }}>
            <div style={badgeStyle}>
              <BarChart3 size={14} /> LIVE ANALYTICS
            </div>
            <h1 style={titleStyle}>{local.title}</h1>
            
            <div style={metaContainerStyle}>
              <div style={metaItemStyle}><User size={14} color="#3b82f6" /> {local.author}</div>
              <div style={metaItemStyle}><Users size={14} color="#3b82f6" /> {totalVotes} Total Participants</div>
              <div style={metaItemStyle}><Calendar size={14} color="#3b82f6" /> {new Date(local.createdAt).toLocaleDateString()}</div>
            </div>
          </header>

          {/* DESCRIPTION SECTION */}
          <div style={{ marginBottom: '45px' }}>
            <h3 style={sectionLabelStyle}>OBJECTIVE & CONTEXT</h3>
            <p style={descStyle}>{local.description || "The organizer has not provided additional context for this poll."}</p>
          </div>

          {/* OPTIONS GRID */}
          <div>
            <h3 style={sectionLabelStyle}>SELECT AN OPTION TO CAST VOTE</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {local.options && local.options.map((opt, i) => {
                const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                const isUserChoice = userVotedIndex === i;

                return (
                  <div 
                    key={i} 
                    onClick={() => handleVote(i)} 
                    style={optionWrapperStyle(userVotedIndex !== null, i)}
                  >
                    {/* Progress Fill Background */}
                    <div style={progressFillStyle(percentage)} />
                    
                    <div style={optionContentStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={radioCircleStyle(userVotedIndex !== null)}>
                          {isUserChoice ? <CheckCircle2 size={16} color="#10b981" /> : <Fingerprint size={16} />}
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: '500' }}>{opt.text}</span>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6' }}>{percentage}%</div>
                        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>{opt.votes} Votes</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {userVotedIndex !== null && (
            <div style={successAlertStyle}>
              <CheckCircle2 size={18} /> Identification Verified. Your response has been logged securely.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- PROFESSIONAL STYLES --- */

const backButtonStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
  color: '#64748b', background: 'none', border: 'none',
  cursor: 'pointer', fontSize: '12px', fontWeight: '700',
  letterSpacing: '1px', marginBottom: '25px', padding: '0'
};

const mainCardStyle = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  padding: '50px',
  borderRadius: '24px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
};

const titleStyle = {
  color: 'white',
  fontSize: '32px',
  fontWeight: '800',
  lineHeight: '1.2',
  marginBottom: '20px'
};

const badgeStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
  padding: '6px 12px', borderRadius: '6px', fontSize: '11px',
  fontWeight: '800', marginBottom: '15px', border: '1px solid rgba(59, 130, 246, 0.2)'
};

const metaContainerStyle = { display: 'flex', flexWrap: 'wrap', gap: '24px' };
const metaItemStyle = { display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' };

const sectionLabelStyle = {
  color: '#475569', fontSize: '11px', fontWeight: '800',
  letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '15px'
};

const descStyle = {
  color: '#cbd5e1', lineHeight: '1.8', fontSize: '16px',
  maxWidth: '700px'
};

const optionWrapperStyle = (voted, i) => ({
  position: 'relative',
  background: '#1e293b',
  borderRadius: '12px',
  border: '1px solid #334155',
  cursor: voted ? 'default' : 'pointer',
  overflow: 'hidden',
  transition: 'all 0.2s ease'
});

const progressFillStyle = (pct) => ({
  position: 'absolute',
  left: 0, top: 0, bottom: 0,
  width: `${pct}%`,
  background: 'rgba(59, 130, 246, 0.15)',
  borderRight: pct > 0 ? '2px solid #3b82f6' : 'none',
  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
});

const optionContentStyle = {
  position: 'relative', zIndex: 2,
  padding: '18px 24px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  color: 'white'
};

const radioCircleStyle = (voted) => ({
  width: '32px', height: '32px', borderRadius: '50%',
  background: '#0f172a', border: '1px solid #334155',
  display: 'grid', placeItems: 'center', color: '#64748b'
});

const successAlertStyle = {
  marginTop: '40px', padding: '16px', borderRadius: '12px',
  background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)',
  color: '#10b981', display: 'flex', alignItems: 'center', gap: '12px',
  fontSize: '14px', fontWeight: '500', justifyContent: 'center'
};