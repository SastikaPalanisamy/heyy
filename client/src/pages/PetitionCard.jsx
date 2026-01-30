import React from 'react';
import { ArrowUpRight, MapPin, Users, Tag } from 'lucide-react';
import "../Dashboard.css";

export function PetitionCard({ petition, onClick }) {
  const current = petition.currentSignatures || 0;
  const goal = petition.targetSignatures || 100;
  const percentage = Math.min(Math.round((current / goal) * 100), 100);

  return (
    <div className="case-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="case-top">
        <span className="priority" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)' }}>
          <Tag size={12} /> {petition.category}
        </span>
        <span className="timer"><MapPin size={12} /> {petition.location}</span>
      </div>
      <h3 style={{ fontSize: '18px', margin: '15px 0 10px', color: 'white' }}>{petition.title}</h3>
      <p className="line-clamp-2" style={{ color: 'var(--text-s)', fontSize: '13px', marginBottom: '20px' }}>
        {petition.description}
      </p>
      <div className="pg-wrap">
        <div className="pg-meta">
          <span><Users size={14} /> <strong>{current}</strong> / {goal}</span>
          <span style={{ color: 'var(--accent)' }}>{percentage}%</span>
        </div>
        <div className="pg-track"><div className="pg-fill" style={{ width: `${percentage}%` }}></div></div>
      </div>
      <div className="case-foot" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
        <div className="case-author">
          <div className="u-box">{petition.author?.charAt(0)}</div>
          <p>By <strong>{petition.author}</strong></p>
        </div>
        <button className="i-btn"><ArrowUpRight size={16} /></button>
      </div>
    </div>
  );
}