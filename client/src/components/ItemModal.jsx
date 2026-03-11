import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { X, ExternalLink, Star, Archive, Trash2, RefreshCw, FileText, Image, Link2, StickyNote, Clock, Pencil, Eye } from 'lucide-react';
import { timeAgo } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TYPE_ICON = {
  link: <Link2 size={13} />,
  pdf: <FileText size={13} />,
  image: <Image size={13} />,
  note: <StickyNote size={13} />,
};

export default function ItemModal({ item: initialItem, onClose, onUpdate }) {
  const qc = useQueryClient();
  const { data: item = initialItem } = useQuery({
    queryKey: ['item', initialItem._id],
    queryFn: () => api.get(`/items/${initialItem._id}`).then((r) => r.data),
    refetchInterval: (query) => query.state.data?.aiStatus !== 'done' ? 3000 : false,
    placeholderData: initialItem,
    staleTime: 0,
  });

  const [editTags, setEditTags] = useState(item.tags?.join(', ') || '');
  const [editNotes, setEditNotes] = useState(item.userNotes || '');
  const [notesEditing, setNotesEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const notesEditingRef = useRef(false);
  notesEditingRef.current = notesEditing;

  // Sync notes from live query (resolves after the card's initialData, which excludes rawContent)
  useEffect(() => {
    if (!notesEditingRef.current) {
      setEditNotes(item.userNotes || '');
    }
  }, [item.userNotes]);

  // When AI finishes processing, refresh the card list in the background
  useEffect(() => {
    if (item.aiStatus === 'done') {
      qc.invalidateQueries(['items']);
      qc.invalidateQueries(['tags']);
    }
  }, [item.aiStatus]);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/items/${item._id}`, {
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
        userNotes: editNotes,
      });
      toast.success('Saved');
      setNotesEditing(false);
      qc.invalidateQueries(['item', item._id]);
      qc.invalidateQueries(['items']);
      qc.invalidateQueries(['tags']);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggle = async (field) => {
    try {
      await api.patch(`/items/${item._id}`, { [field]: !item[field] });
      qc.invalidateQueries(['items']);
      qc.invalidateQueries(['item', item._id]);
    } catch { toast.error('Failed'); }
  };

  const del = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await api.delete(`/items/${item._id}`);
      toast.success('Deleted');
      onUpdate();
    } catch { toast.error('Failed'); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');

        .im-root { font-family: 'DM Sans', sans-serif; }

        /* Section header — identical to landing "What it does" */
        .im-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .im-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .im-section-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 13px;
          color: #948979;
          margin: 0;
          white-space: nowrap;
        }
        .im-section-rule {
          flex: 1;
          height: 1px;
          background: #393E46;
        }

        /* Markdown content */
        .im-md { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 300; color: #948979; line-height: 1.75; }
        .im-md p { margin: 0 0 10px; }
        .im-md p:last-child { margin-bottom: 0; }
        .im-md h1,.im-md h2,.im-md h3 { font-family: 'Playfair Display', serif; font-weight: 400; color: #DFD0B8; margin: 14px 0 6px; font-size: 14px; }
        .im-md ul,.im-md ol { padding-left: 18px; margin: 0 0 10px; }
        .im-md li { margin-bottom: 4px; }
        .im-md code { font-family: 'DM Mono', monospace; font-size: 11px; background: #181c22; border: 1px solid #393E46; border-radius: 4px; padding: 1px 5px; color: #DFD0B8; }
        .im-md pre { background: #181c22; border: 1px solid #393E46; border-radius: 8px; padding: 12px; overflow-x: auto; margin: 0 0 10px; }
        .im-md pre code { border: none; background: none; padding: 0; }
        .im-md blockquote { border-left: 2px solid #393E46; margin: 0 0 10px; padding: 2px 0 2px 12px; color: #4a5260; }
        .im-md strong { color: #DFD0B8; font-weight: 500; }
        .im-md a { color: #DFD0B8; text-decoration: underline; opacity: 0.7; }
        .im-md hr { border: none; border-top: 1px solid #393E46; margin: 12px 0; }
        .im-md table { width: 100%; border-collapse: collapse; margin: 0 0 10px; font-size: 12px; }
        .im-md th { background: #181c22; color: #DFD0B8; font-weight: 500; text-align: left; padding: 7px 10px; border: 1px solid #393E46; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.04em; }
        .im-md td { padding: 6px 10px; border: 1px solid #2a2f38; color: #948979; }
        .im-md tr:nth-child(even) td { background: #1e232a; }
        .im-md del { opacity: 0.4; }

        /* Modal title */
        .im-title {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 400;
          color: #DFD0B8;
          line-height: 1.4;
          margin: 0;
        }

        /* Inputs */
        .im-input {
          width: 100%;
          padding: 10px 14px;
          background: #181c22;
          border: 1px solid #393E46;
          border-radius: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #DFD0B8;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .im-input::placeholder { color: #4a5260; }
        .im-input:focus { border-color: #948979; }

        .im-textarea {
          resize: vertical;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.7;
          min-height: 96px;
        }

        /* Save button */
        .im-save {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 22px;
          background: #DFD0B8;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1a1e24;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: background 0.15s;
        }
        .im-save:hover:not(:disabled) { background: #f0e5d0; }
        .im-save:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Open link buttons */
        .im-open-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #948979;
          background: transparent;
          border: 1px solid #393E46;
          padding: 6px 12px;
          border-radius: 8px;
          text-decoration: none;
          transition: border-color 0.15s, color 0.15s;
        }
        .im-open-btn:hover { border-color: #948979; color: #DFD0B8; }

        /* Timestamp */
        .im-timestamp {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #4a5260;
          letter-spacing: 0.08em;
        }

        @keyframes imIn {
          from { opacity: 0; transform: translateY(10px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .im-panel {
          animation: imIn 0.22s cubic-bezier(0.16,1,0.3,1);
        }
      `}</style>

      <div
        className="im-root fixed inset-0 z-50 flex items-center justify-center p-5"
        style={{ background: 'rgba(15,18,22,0.82)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="im-panel bg-[#222831] border border-[#393E46] w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden"
          style={{ borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.55)' }}
        >

          {/* ── Header ── */}
          <div className="flex items-start gap-4 px-6 pt-6 pb-5" style={{ borderBottom: '1px solid #393E46' }}>
            <div className="flex-1 min-w-0">

              {/* Meta pills */}
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: 'rgba(148,137,121,0.5)' }}>{TYPE_ICON[item.type]}</span>
                {item.category && (
                  <span style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#948979',
                    background: '#393E46',
                    padding: '2px 8px',
                    borderRadius: 100,
                  }}>
                    {item.category}
                  </span>
                )}
                {item.readingTimeMinutes && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    color: 'rgba(148,137,121,0.5)',
                    background: '#393E46',
                    padding: '2px 8px',
                    borderRadius: 100,
                  }}>
                    <Clock size={9} /> {item.readingTimeMinutes}m
                  </span>
                )}
                {(item.aiStatus === 'pending' || item.aiStatus === 'processing') && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    color: 'rgba(223,208,184,0.4)',
                  }}>
                    <RefreshCw size={9} className="animate-spin" /> PROCESSING
                  </span>
                )}
                {item.aiStatus === 'failed' && (
                  <button
                    onClick={async () => {
                      try {
                        await api.post(`/items/${item._id}/reprocess`);
                        qc.invalidateQueries(['item', item._id]);
                        qc.invalidateQueries(['items']);
                        toast.success('Re-queued for AI processing');
                      } catch { toast.error('Failed to retry'); }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 10,
                      letterSpacing: '0.06em',
                      color: '#f87171',
                      background: 'rgba(248,113,113,0.08)',
                      border: '1px solid rgba(248,113,113,0.25)',
                      borderRadius: 100,
                      padding: '2px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={9} /> AI FAILED · RETRY
                  </button>
                )}
              </div>

              {/* Title — Playfair, like landing h1 */}
              <h2 className="im-title">{item.title}</h2>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <ActionBtn onClick={() => toggle('isFavorite')} title="Favorite" active={item.isFavorite}>
                <Star size={14} fill={item.isFavorite ? '#DFD0B8' : 'none'} color={item.isFavorite ? '#DFD0B8' : '#948979'} />
              </ActionBtn>
              <ActionBtn onClick={() => toggle('isArchived')} title="Archive" active={item.isArchived}>
                <Archive size={14} />
              </ActionBtn>
              <ActionBtn onClick={del} title="Delete">
                <Trash2 size={14} />
              </ActionBtn>
              <div style={{ width: 1, height: 16, background: '#393E46', margin: '0 2px' }} />
              <ActionBtn onClick={onClose}>
                <X size={14} />
              </ActionBtn>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

            {/* Preview image */}
            {item.previewImage && (
              <a href={item.fileUrl || item.previewImage} target="_blank" rel="noreferrer">
                <img
                  src={item.previewImage}
                  alt=""
                  style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 12, opacity: 0.88, cursor: 'zoom-in', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.target.style.opacity = 1}
                  onMouseLeave={e => e.target.style.opacity = 0.88}
                  onError={(e) => e.target.parentElement.style.display = 'none'}
                />
              </a>
            )}

            {/* Open buttons */}
            {(item.fileUrl || item.url) && (
              <div className="flex flex-wrap gap-2">
                {item.type === 'pdf' && item.fileUrl && (
                  <a href={item.fileUrl} target="_blank" rel="noreferrer" className="im-open-btn">
                    <ExternalLink size={11} /> Open PDF
                  </a>
                )}
                {item.type === 'image' && item.fileUrl && (
                  <a href={item.fileUrl} target="_blank" rel="noreferrer" className="im-open-btn">
                    <ExternalLink size={11} /> Open image
                  </a>
                )}
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="im-open-btn">
                    <ExternalLink size={11} /> Open original
                  </a>
                )}
              </div>
            )}

            {/* Note content (for note type items — show raw user content) */}
            {item.type === 'note' && item.rawContent && (
              <Section title="Note">
                <div className="im-md">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.rawContent}</ReactMarkdown>
                </div>
              </Section>
            )}

            {/* Summary (for non-note types) */}
            {item.type !== 'note' && item.summary && (
              <Section title="Summary">
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 300, color: '#948979', lineHeight: 1.75, margin: 0 }}>
                  {item.summary}
                </p>
              </Section>
            )}

            {/* Key points */}
            {item.keyPoints?.length > 0 && (
              <Section title="Key points">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {item.keyPoints.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 10,
                        color: '#4a5260',
                        letterSpacing: '0.06em',
                        marginTop: 3,
                        flexShrink: 0,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 300, color: '#948979', lineHeight: 1.65 }}>
                        {p}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Tags */}
            <Section title="Tags">
              <input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="im-input"
              />
            </Section>

            {/* Notes */}
            <Section title="Your notes">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 6 }}>
                <button
                  onClick={() => setNotesEditing(e => !e)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontFamily: 'DM Mono, monospace', fontSize: 10,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: '#948979', background: 'transparent',
                    border: '1px solid #393E46', padding: '4px 10px',
                    borderRadius: 7, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#948979'; e.currentTarget.style.color = '#DFD0B8'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#393E46'; e.currentTarget.style.color = '#948979'; }}
                >
                  {notesEditing ? <><Eye size={9} /> Preview</> : <><Pencil size={9} /> Edit</>}
                </button>
              </div>
              {notesEditing ? (
                <textarea
                  autoFocus
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add your notes… markdown supported"
                  rows={5}
                  className="im-input im-textarea"
                />
              ) : editNotes ? (
                <div className="im-md" style={{ minHeight: 60 }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{editNotes}</ReactMarkdown>
                </div>
              ) : (
                <button
                  onClick={() => setNotesEditing(true)}
                  style={{
                    width: '100%', padding: '14px',
                    background: '#181c22', border: '1px dashed #393E46',
                    borderRadius: 10, fontFamily: 'DM Sans, sans-serif',
                    fontSize: 13, color: '#4a5260', cursor: 'pointer',
                    textAlign: 'left', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#948979'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#393E46'}
                >
                  Add your notes… markdown supported
                </button>
              )}
            </Section>

            {/* Footer row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
              <button onClick={save} disabled={saving} className="im-save">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <span className="im-timestamp">Added {timeAgo(item.createdAt)}</span>
            </div>

          </div>
        </div>

        {/* ── Delete confirmation modal ── */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: 'rgba(10,13,16,0.75)', backdropFilter: 'blur(6px)' }}
          >
            <div style={{
              background: '#222831',
              border: '1px solid #393E46',
              borderRadius: 16,
              padding: '32px 36px',
              width: 340,
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              animation: 'imIn 0.18s cubic-bezier(0.16,1,0.3,1)',
            }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f87171', opacity: 0.8 }}>
                  Confirm delete
                </span>
              </div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: 400, fontSize: 16, color: '#DFD0B8', margin: '0 0 8px' }}>
                Delete this item?
              </h3>
              <div style={{ width: '100%', height: 1, background: '#393E46', margin: '12px 0 16px' }} />
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 300, color: '#948979', lineHeight: 1.6, margin: '0 0 24px' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#DFD0B8', opacity: 0.7 }}>"{item.title?.slice(0, 50)}{item.title?.length > 50 ? '…' : ''}"</span>
                <br />will be permanently removed.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    flex: 1, padding: '10px',
                    background: 'transparent', border: '1px solid #393E46',
                    borderRadius: 10, fontFamily: 'DM Sans, sans-serif',
                    fontSize: 13, color: '#948979', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#948979'; e.currentTarget.style.color = '#DFD0B8'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#393E46'; e.currentTarget.style.color = '#948979'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    flex: 1, padding: '10px',
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
                    borderRadius: 10, fontFamily: 'DM Sans, sans-serif',
                    fontSize: 13, fontWeight: 500, color: '#f87171', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* Section header — mirrors landing "What it does" label + rule pattern */
function Section({ title, children }) {
  return (
    <div className="im-section">
      <div className="im-section-header">
        <h4 className="im-section-title">{title}</h4>
        <div className="im-section-rule" />
      </div>
      {children}
    </div>
  );
}

function ActionBtn({ onClick, children, title, active }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 34, height: 34,
        borderRadius: 9,
        border: `1px solid ${active ? 'rgba(148,137,121,0.4)' : '#393E46'}`,
        background: active ? '#393E46' : 'transparent',
        color: active ? '#DFD0B8' : '#948979',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#393E46'; e.currentTarget.style.color = '#DFD0B8'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#948979'; }}}
    >
      {children}
    </button>
  );
}