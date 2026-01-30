import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  ArrowLeft, CheckCircle, Users, MapPin, 
  ShieldCheck, Target, Award, Info 
} from "lucide-react";

export default function PetitionDetail({ petition: initialPetition, user, onNavigate }) {
  const [petition, setPetition] = useState(initialPetition);
  const [signed, setSigned] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const userIdentifier = user?._id || user?.fullName || user?.email || "citizen_user";

  useEffect(() => {
    if (petition) {
      const isSigned = petition.signers?.includes(userIdentifier);
      setSigned(isSigned);
      setCurrentCount(petition.currentSignatures || 0);
    }
  }, [petition, userIdentifier]);

  const handleToggleSign = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/petitions/sign/${petition._id}`, {
        userId: userIdentifier
      });
      const newCount = res.data.current;
      setCurrentCount(newCount);
      setPetition(prev => {
        const alreadySigned = prev.signers.includes(userIdentifier);
        const updatedList = alreadySigned 
          ? prev.signers.filter(id => id !== userIdentifier)
          : [...prev.signers, userIdentifier];
        return { ...prev, signers: updatedList, currentSignatures: newCount };
      });
      setSigned(!signed);
    } catch (err) {
      alert("Backend Sync Error!");
    } finally {
      setLoading(false);
    }
  };

  if (!petition) return <div className="civix-body">No data found.</div>;

  return (
    <div className="civix-body" style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px' }}>
      <button onClick={() => onNavigate('petitions')} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'white', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', color: '#64748b', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontWeight: '600' }}>
        <ArrowLeft size={18} /> Back to Petitions
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '32px', maxWidth: '1150px', margin: '0 auto' }}>
        
        {/* LEFT SECTION: CONTENT */}
        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
              {petition.category}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>• {new Date(petition.createdAt).toLocaleDateString()}</span>
          </div>
          
          <h1 style={{ fontSize: '34px', color: '#0f172a', fontWeight: '800', lineHeight: '1.2', marginBottom: '28px' }}>{petition.title}</h1>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', padding: '24px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}><MapPin size={20} color="#ef4444" /> <b>{petition.location}</b></div>
            {/* UPDATED: Organized by @username */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
               <Users size={20} color="#2563eb" /> 
               <span>Organized by <b style={{ color: '#2563eb' }}>@{petition.author}</b></span>
            </div>
          </div>

          <p style={{ lineHeight: '1.8', color: '#475569', fontSize: '17px', whiteSpace: 'pre-wrap' }}>{petition.description}</p>
        </div>

        {/* RIGHT SECTION: SIGN CARD */}
        <div style={{ position: 'sticky', top: '40px', height: 'fit-content' }}>
          <div style={{ background: 'white', padding: '35px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px' }}>
                {/* UPDATED: "3 Signatures" instead of just "3" */}
                <h4 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
                   {currentCount.toLocaleString()} <span style={{ fontSize: '18px', fontWeight: '600', color: '#64748b' }}>Signatures</span>
                </h4>
                <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>Goal: {petition.targetSignatures}</span>
              </div>
              
              <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min((currentCount / petition.targetSignatures) * 100, 100)}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', 
                  borderRadius: '20px',
                  transition: 'width 1.2s ease-out' 
                }}></div>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={16} color="#3b82f6" /> {Math.max(0, petition.targetSignatures - currentCount)} more to reach goal
              </p>
            </div>

            <button 
              onClick={handleToggleSign}
              disabled={loading}
              style={{ 
                width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
                background: signed ? '#10b981' : '#2563eb', color: 'white', 
                fontWeight: '700', fontSize: '16px', cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}
            >
              {loading ? "..." : signed ? <><CheckCircle size={20}/> SIGNED (WITHDRAW)</> : "SIGN THIS PETITION"}
            </button>

            <div style={{ marginTop: '28px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                <ShieldCheck size={22} color="#10b981" />
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  <strong>Verified Citizen Action</strong><br/>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '14px' }}>
                <Award size={22} color="#f59e0b" />
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  <strong>Impact Factor</strong><br/>
                  <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>+15 Points</span> for contribution
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}