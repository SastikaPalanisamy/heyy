import React, { useState } from 'react';
import axios from 'axios';
import { X, Users, MapPin, Calendar, ShieldCheck, PenTool } from 'lucide-react';
import "../Dashboard.css";

export default function PetitionDetailModal({ petition, onClose, user }) {
  const [isSigning, setIsSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  const handleSign = async () => {
    setIsSigning(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/petitions/sign/${petition._id}`, {
        userId: user?._id
      });
      const data = res.data;
      if (data.action === 'signed') setSigned(true);
      if (data.action === 'unsigned') setSigned(false);
      // update petition count locally
      if (data.current !== undefined) petition.currentSignatures = data.current;
      try { window.dispatchEvent(new Event('civix:refreshDashboard')); } catch(e){}
    } catch (err) {
      alert("Error processing signature");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'grid', placeItems: 'center', zIndex: 2000 }}>
      <div className="modal-box" style={{ maxWidth: '600px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span className="priority">{petition.category}</span>
          <button onClick={onClose} className="i-btn"><X size={20} /></button>
        </div>
        <h2 style={{ color: 'white', marginBottom: '10px' }}>{petition.title}</h2>
        <p style={{ color: 'var(--text-s)', marginBottom: '20px' }}>{petition.description}</p>
        
        <div className="pg-wrap" style={{ marginBottom: '30px' }}>
          <div className="pg-meta">
            <span><Users size={14} /> <strong>{petition.currentSignatures}</strong> signs</span>
          </div>
          <div className="pg-track">
            <div className="pg-fill" style={{ width: `${(petition.currentSignatures/petition.targetSignatures)*100}%` }}></div>
          </div>
        </div>

        {signed ? (
          <div className="status-box" style={{ textAlign: 'center', color: '#10b981' }}>
            <ShieldCheck size={32} style={{ margin: '0 auto 10px' }} />
            <p>Signature Verified!</p>
          </div>
        ) : (
          <button className="btn-main" style={{ width: '100%' }} onClick={handleSign} disabled={isSigning}>
            {isSigning ? "Processing..." : "Sign this Petition"}
          </button>
        )}
      </div>
    </div>
  );
}