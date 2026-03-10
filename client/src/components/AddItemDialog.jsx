import { useState, useRef } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { X, Link2, Image, StickyNote, Loader2, Upload, Globe } from 'lucide-react';
import { useUploadThing } from '../lib/uploadthing';

const TABS = [
  { id: 'link', label: 'Link', icon: <Link2 size={12} /> },
  { id: 'note', label: 'Note', icon: <StickyNote size={12} /> },
  { id: 'file', label: 'File', icon: <Image size={12} /> },
];

export default function AddItemDialog({ open, onClose, onSuccess, activeListId }) {
  const [tab, setTab] = useState('link');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fileRef = useRef();
  const debounceRef = useRef();
  const { startUpload, isUploading } = useUploadThing('fileUploader', {
    headers: () => {
      const token = localStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  });

  if (!open) return null;

  const reset = () => { setUrl(''); setNote(''); setFile(null); setPreview(null); };

  const handleUrlChange = (val) => {
    setUrl(val);
    setPreview(null);
    clearTimeout(debounceRef.current);
    if (!val.trim() || !val.startsWith('http')) return;
    debounceRef.current = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const { data } = await api.get('/items/preview', { params: { url: val.trim() } });
        if (data.title) setPreview(data);
      } catch {
        // Ignore errors
      }
      finally { setPreviewLoading(false); }
    }, 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'link') {
        if (!url.trim()) return toast.error('Enter a URL');
        const payload = { type: 'link', url: url.trim() };
        if (activeListId) payload.listIds = [activeListId];
        await api.post('/items', payload);
      } else if (tab === 'note') {
        if (!note.trim()) return toast.error('Note is empty');
        const payload = { type: 'note', content: note.trim() };
        if (activeListId) payload.listIds = [activeListId];
        await api.post('/items', payload);
      } else if (tab === 'file') {
        if (!file) return toast.error('Select a file');
        toast.loading('Uploading file…', { id: 'ut-upload' });
        let uploaded;
        try {
          uploaded = await startUpload([file]);
        } finally {
          toast.dismiss('ut-upload');
        }
        if (!uploaded?.[0]?.ufsUrl) throw new Error('Upload to UploadThing failed');
        const payload = {
          fileUrl: uploaded[0].ufsUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          listIds: activeListId ? [activeListId] : [],
        };
        await api.post('/items/upload-ut', payload);
      }
      toast.success('Saved! AI is processing…');
      reset();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
        @keyframes aidUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-5"
        style={{ background: 'rgba(15,18,22,0.82)', backdropFilter: 'blur(10px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div style={{
          fontFamily: 'DM Sans, sans-serif',
          background: '#222831',
          border: '1px solid #393E46',
          borderRadius: 18,
          width: '100%',
          maxWidth: 440,
          overflow: 'hidden',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
          animation: 'aidUp 0.22s cubic-bezier(0.16,1,0.3,1)',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '18px 22px',
            borderBottom: '1px solid #393E46',
          }}>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 15, fontWeight: 400, fontStyle: 'italic',
              color: '#948979', margin: 0, flex: 1,
            }}>
              Add item
            </h2>
            <div style={{ width: 60, height: 1, background: '#393E46' }} />
            <button
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: 8,
                background: '#393E46', border: 'none',
                color: '#948979', cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#464d57'; e.currentTarget.style.color = '#DFD0B8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#393E46'; e.currentTarget.style.color = '#948979'; }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, padding: '16px 22px 0' }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8,
                  border: `1px solid ${tab === t.id ? '#DFD0B8' : '#393E46'}`,
                  background: tab === t.id ? '#DFD0B8' : 'transparent',
                  color: tab === t.id ? '#1a1e24' : '#948979',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (tab !== t.id) { e.currentTarget.style.background = '#393E46'; e.currentTarget.style.color = '#DFD0B8'; } }}
                onMouseLeave={e => { if (tab !== t.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#948979'; } }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {tab === 'link' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', color: '#948979', opacity: 0.6, textTransform: 'uppercase' }}>
                  URL
                </label>
                <input
                  autoFocus
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/article"
                  type="url"
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: '#181c22', border: '1px solid #393E46',
                    borderRadius: 10, fontFamily: 'DM Sans, sans-serif',
                    fontSize: 13, color: '#DFD0B8', outline: 'none',
                    transition: 'border-color 0.15s', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#948979'}
                  onBlur={e => e.target.style.borderColor = '#393E46'}
                />
                {previewLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#4a5260' }}>
                    <Loader2 size={11} className="animate-spin" /> Fetching preview…
                  </div>
                )}
                {preview && !previewLoading && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 12px', background: '#181c22',
                    border: '1px solid #393E46', borderRadius: 8,
                  }}>
                    {preview.favicon && (
                      <img src={preview.favicon} alt="" width={13} height={13} style={{ borderRadius: 3, flexShrink: 0, opacity: 0.8 }} onError={(e) => e.target.style.display = 'none'} />
                    )}
                    <Globe size={12} style={{ color: '#948979', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#DFD0B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {preview.title}
                    </span>
                  </div>
                )}
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#4a5260', letterSpacing: '0.04em' }}>
                  Title, summary and tags generated by AI.
                </p>
              </div>
            )}

            {tab === 'note' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', color: '#948979', opacity: 0.6, textTransform: 'uppercase' }}>
                  Note
                </label>
                <textarea
                  autoFocus
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write anything… markdown supported"
                  rows={6}
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: '#181c22', border: '1px solid #393E46',
                    borderRadius: 10, fontFamily: 'DM Sans, sans-serif',
                    fontSize: 13, color: '#DFD0B8', lineHeight: 1.65,
                    outline: 'none', transition: 'border-color 0.15s',
                    resize: 'vertical', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#948979'}
                  onBlur={e => e.target.style.borderColor = '#393E46'}
                />
              </div>
            )}

            {tab === 'file' && (
              <div>
                <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
                <div
                  onClick={() => fileRef.current.click()}
                  style={{
                    border: '1.5px dashed #393E46', borderRadius: 12,
                    padding: '36px 24px', textAlign: 'center', cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#948979'; e.currentTarget.style.background = 'rgba(148,137,121,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#393E46'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Upload size={18} style={{ margin: '0 auto 10px', color: '#4a5260' }} />
                  {file ? (
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#DFD0B8', letterSpacing: '0.04em' }}>{file.name}</p>
                  ) : (
                    <>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#948979' }}>Click to choose a file</p>
                      <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#4a5260', marginTop: 4, letterSpacing: '0.06em' }}>
                        IMAGES OR PDF · MAX 20 MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isUploading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '12px',
                background: '#DFD0B8', border: 'none', borderRadius: 10,
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
                color: '#1a1e24', letterSpacing: '0.01em',
                cursor: (loading || isUploading) ? 'not-allowed' : 'pointer',
                opacity: (loading || isUploading) ? 0.6 : 1,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!loading && !isUploading) e.currentTarget.style.background = '#f0e5d0'; }}
              onMouseLeave={e => { if (!loading && !isUploading) e.currentTarget.style.background = '#DFD0B8'; }}
            >
              {isUploading ? <><Loader2 size={13} className="animate-spin" /> Uploading…</> : loading ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Save'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}