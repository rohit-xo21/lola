import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Key } from 'lucide-react';

export default function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!groqApiKey.trim()) return toast.error('Enter your Groq API key');
    setLoading(true);
    try {
      await api.put('/settings', { groqApiKey: groqApiKey.trim() });
      const updated = await refreshUser();
      toast.success('API key saved!');
      if (updated.hasGroqKey) navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          background: '#1a1e24',
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(57,62,70,0.12) 39px, rgba(57,62,70,0.12) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(57,62,70,0.07) 39px, rgba(57,62,70,0.07) 40px)
          `,
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Logo row */}
          <div className="flex items-center gap-3 mb-10">
            <img src="/logobrand.svg" alt="Lola" style={{ maxWidth: '160px', height: 'auto', display: 'block' }} />
            {user && (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 cursor-pointer transition-colors"
                style={{
                  background: 'transparent',
                  border: '1px solid #393E46',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  color: '#948979',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#948979'; e.currentTarget.style.color = '#DFD0B8'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#393E46'; e.currentTarget.style.color = '#948979'; }}
              >
                <ArrowLeft size={11} /> DASHBOARD
              </button>
            )}
          </div>

          {/* Card */}
          <div style={{
            background: '#222831',
            border: '1px solid #393E46',
            borderRadius: 16,
            overflow: 'hidden',
          }}>

            {/* Card header */}
            <div style={{
              padding: '20px 24px 18px',
              borderBottom: '1px solid #393E46',
              display: 'flex',
              alignItems: 'baseline',
              gap: 12,
            }}>
              <h2 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 16,
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#948979',
                margin: 0,
              }}>
                Connect Groq AI
              </h2>
              <div style={{ flex: 1, height: 1, background: '#393E46', alignSelf: 'center' }} />
              <Key size={12} color="#4a5260" />
            </div>

            <div style={{ padding: '24px' }}>
              {/* Warning banner */}
              {!user?.hasGroqKey && (
                <div style={{
                  background: 'rgba(223,208,184,0.05)',
                  border: '1px solid rgba(223,208,184,0.12)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#948979', letterSpacing: '0.08em' }}>
                    ⚡ REQUIRED — enables AI summarization and tagging
                  </span>
                </div>
              )}

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    color: '#948979',
                    opacity: 0.6,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>
                    Groq API Key
                  </label>
                  <input
                    type="password"
                    value={groqApiKey}
                    onChange={(e) => setGroqApiKey(e.target.value)}
                    placeholder={user?.hasGroqKey ? '••••••• saved — paste to update' : 'gsk_...'}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      background: '#181c22',
                      border: '1px solid #393E46',
                      borderRadius: 10,
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 12,
                      color: '#DFD0B8',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = '#948979'}
                    onBlur={e => e.target.style.borderColor = '#393E46'}
                  />
                  <p style={{
                    marginTop: 8,
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    color: '#4a5260',
                    letterSpacing: '0.04em',
                  }}>
                    Free key at{' '}
                    <a
                      href="https://console.groq.com"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#948979', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color = '#DFD0B8'}
                      onMouseLeave={e => e.target.style.color = '#948979'}
                    >
                      console.groq.com ↗
                    </a>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 cursor-pointer border-none transition-colors"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: loading ? 'rgba(223,208,184,0.5)' : '#DFD0B8',
                    borderRadius: 10,
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1a1e24',
                    letterSpacing: '0.01em',
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#f0e5d0'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#DFD0B8'; }}
                >
                  {loading
                    ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                    : 'Save & continue'
                  }
                </button>
              </form>
            </div>
          </div>

          {/* Sign out */}
          {user && (
            <button
              onClick={logout}
              className="cursor-pointer transition-colors"
              style={{
                marginTop: 12,
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: '1px solid #393E46',
                borderRadius: 10,
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.1em',
                color: '#4a5260',
                textTransform: 'uppercase',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#948979'; e.currentTarget.style.color = '#948979'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#393E46'; e.currentTarget.style.color = '#4a5260'; }}
            >
              Sign out
            </button>
          )}

        </div>
      </div>
    </>
  );
}