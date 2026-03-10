import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import Sidebar from '../components/Sidebar';
import ItemCard from '../components/ItemCard';
import ItemModal from '../components/ItemModal';
import AddItemDialog from '../components/AddItemDialog';
import { Plus, Search, LayoutGrid, List, Settings, LogOut, Trash2, FolderMinus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [view, setView] = useState('grid');
  const [selectedItem, setSelectedItem] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState({ type: 'all' });
  const [isDragging, setIsDragging] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isOverRemove, setIsOverRemove] = useState(false);

  // Track any drag happening on the page
  useEffect(() => {
    const onDragStart = (e) => {
      if (e.dataTransfer?.types?.includes('itemid') || true) setIsDragging(true);
    };
    const onDragEnd = () => { setIsDragging(false); setIsOverTrash(false); };
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('dragend', onDragEnd);
    return () => {
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('dragend', onDragEnd);
    };
  }, []);

  const deleteItem = async (itemId) => {
    try {
      await api.delete(`/items/${itemId}`);
      queryClient.invalidateQueries(['items']);
    } catch {}
  };

  const removeFromList = async (itemId) => {
    try {
      const item = await api.get(`/items/${itemId}`).then(r => r.data);
      const listIds = (item.listIds || []).filter(id => id !== activeFilter.value && id.toString() !== activeFilter.value);
      await api.patch(`/items/${itemId}`, { listIds });
      queryClient.invalidateQueries(['items']);
    } catch { }
  };

  const buildQuery = () => {
    const p = new URLSearchParams({ page, limit: 24 });
    if (activeFilter.type === 'list') p.set('listId', activeFilter.value);
    if (activeFilter.type === 'tag') p.set('tag', activeFilter.value);
    if (activeFilter.type === 'favorite') p.set('favorite', 'true');
    if (activeFilter.type === 'archived') p.set('archived', 'true');
    if (search) p.set('q', search);
    return p.toString();
  };

  const { data, isLoading } = useQuery({
    queryKey: ['items', activeFilter, search, page],
    queryFn: () => api.get(`/items?${buildQuery()}`).then((r) => r.data),
    // Auto-poll every 5s while any item is still being processed by AI
    refetchInterval: (query) => {
      const items = query.state.data?.items || [];
      return items.some(i => i.aiStatus !== 'done' && i.aiStatus !== 'failed') ? 5000 : false;
    },
  });

  const items = data?.items || [];
  const total = data?.total || 0;

  // When polling detects AI finished (had pending items, now all done/failed), refresh sidebar tags
  const hadPendingRef = useRef(false);
  useEffect(() => {
    const hasPending = items.some(i => i.aiStatus !== 'done' && i.aiStatus !== 'failed');
    if (hadPendingRef.current && !hasPending && items.length > 0) {
      queryClient.invalidateQueries(['tags']);
    }
    hadPendingRef.current = hasPending;
  }, [items]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };
  const handleFilterChange = (filter) => { setActiveFilter(filter); setPage(1); setSearch(''); setSearchInput(''); };

  const filterLabel = () => {
    if (activeFilter.type === 'all') return 'All items';
    if (activeFilter.type === 'favorite') return 'Favorites';
    if (activeFilter.type === 'archived') return 'Archived';
    if (activeFilter.type === 'list') return activeFilter.label || 'List';
    if (activeFilter.type === 'tag') return `#${activeFilter.value}`;
    return 'Items';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');

        .dash-root {
          font-family: 'DM Sans', sans-serif;
        }

        .dash-root * {
          box-sizing: border-box;
        }
      `}</style>

      <div
        className="dash-root flex h-screen overflow-hidden"
        style={{
          background: '#1a1e24',
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(57,62,70,0.12) 39px, rgba(57,62,70,0.12) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(57,62,70,0.07) 39px, rgba(57,62,70,0.07) 40px)
          `,
        }}
      >
        <Sidebar activeFilter={activeFilter} onFilterChange={handleFilterChange} />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Topbar */}
          <div
            className="flex items-center gap-3 px-6 py-3.5 shrink-0"
            style={{ borderBottom: '1px solid #393E46', background: 'rgba(30,35,42,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <form onSubmit={handleSearch} className="flex-1 relative max-w-sm">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#948979', opacity: 0.4 }} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search everything…"
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  background: '#181c22',
                  border: '1px solid #393E46',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'DM Mono, monospace',
                  color: '#DFD0B8',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#948979'}
                onBlur={e => e.target.style.borderColor = '#393E46'}
              />
            </form>

            {/* View toggles */}
            <div className="flex gap-1">
              <IconBtn active={view === 'grid'} onClick={() => setView('grid')} title="Grid"><LayoutGrid size={14} /></IconBtn>
              <IconBtn active={view === 'list'} onClick={() => setView('list')} title="List"><List size={14} /></IconBtn>
            </div>

            <div style={{ width: 1, height: 20, background: '#393E46' }} />

            <IconBtn onClick={() => navigate('/settings')} title="Settings"><Settings size={14} /></IconBtn>
            <IconBtn onClick={logout} title="Sign out"><LogOut size={14} /></IconBtn>

            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 cursor-pointer border-none transition-colors"
              style={{
                padding: '8px 16px',
                background: '#DFD0B8',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                color: '#1a1e24',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0e5d0'}
              onMouseLeave={e => e.currentTarget.style.background = '#DFD0B8'}
            >
              <Plus size={13} /> Add
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto" style={{ padding: '28px 28px 40px' }}>

            {/* Page header */}
            <div className="flex items-baseline gap-4 mb-6" style={{ borderBottom: '1px solid #393E46', paddingBottom: '16px' }}>
              <h1 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '20px',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#948979',
                margin: 0,
              }}>
                {filterLabel()}
              </h1>
              <div style={{ flex: 1, height: 1, background: '#393E46' }} />
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '10px',
                color: '#4a5260',
                letterSpacing: '0.1em',
              }}>
                {total} item{total !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Items grid / list */}
            {isLoading ? (
              <div className={`grid ${view === 'grid' ? 'gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]' : 'gap-2 grid-cols-1'}`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl"
                    style={{
                      height: view === 'grid' ? 220 : 76,
                      background: '#222831',
                      border: '1px solid #393E46',
                      opacity: 1 - i * 0.08,
                    }}
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ height: 280 }}>
                <span style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: '#948979',
                  opacity: 0.5,
                  marginBottom: 8,
                }}>
                  Nothing saved yet
                </span>
                <span style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '10px',
                  color: '#4a5260',
                  letterSpacing: '0.08em',
                }}>
                  CLICK + ADD TO BEGIN
                </span>
              </div>
            ) : (
              <div className={`grid ${view === 'grid' ? 'gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]' : 'gap-2 grid-cols-1'}`}>
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} view={view} onClick={() => setSelectedItem(item)} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > 24 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <PagBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  ← Prev
                </PagBtn>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#4a5260', letterSpacing: '0.1em' }}>
                  {page} / {data?.pages}
                </span>
                <PagBtn onClick={() => setPage((p) => p + 1)} disabled={page >= (data?.pages || 1)}>
                  Next →
                </PagBtn>
              </div>
            )}
          </div>
        </div>

        {selectedItem && (
          <ItemModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={() => { queryClient.invalidateQueries(['items']); setSelectedItem(null); }}
          />
        )}
        <AddItemDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={() => { queryClient.invalidateQueries(['items']); setAddOpen(false); }}
          activeListId={activeFilter.type === 'list' ? activeFilter.value : null}
        />

        {/* Floating trash drop zone — appears on drag */}
        <div style={{ position: 'fixed', bottom: 28, right: 28, display: 'flex', gap: 10, zIndex: 100, pointerEvents: isDragging ? 'all' : 'none', opacity: isDragging ? 1 : 0, transform: isDragging ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(16px)', transition: 'opacity 0.2s, transform 0.2s' }}>

          {/* Remove from list — only when inside a list */}
          {activeFilter.type === 'list' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsOverRemove(true); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsOverRemove(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsOverRemove(false);
                setIsDragging(false);
                const itemId = e.dataTransfer.getData('itemId');
                if (itemId) removeFromList(itemId);
              }}
              style={{
                width: isOverRemove ? 80 : 60,
                height: isOverRemove ? 80 : 60,
                borderRadius: isOverRemove ? 20 : 16,
                background: isOverRemove ? 'rgba(148,137,121,0.2)' : 'rgba(34,40,49,0.92)',
                border: `2px ${isOverRemove ? 'solid' : 'dashed'} ${isOverRemove ? '#DFD0B8' : '#393E46'}`,
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                cursor: 'copy',
                transition: 'width 0.15s, height 0.15s, border-radius 0.15s, background 0.15s, border-color 0.15s',
                boxShadow: isOverRemove ? '0 0 24px rgba(223,208,184,0.15)' : '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <FolderMinus
                size={isOverRemove ? 22 : 18}
                style={{ color: isOverRemove ? '#DFD0B8' : '#948979', transition: 'color 0.15s' }}
              />
              {isOverRemove && (
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, letterSpacing: '0.08em', color: '#DFD0B8', textTransform: 'uppercase' }}>
                  Remove
                </span>
              )}
            </div>
          )}

          {/* Delete permanently */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsOverTrash(true); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsOverTrash(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsOverTrash(false);
              setIsDragging(false);
              const itemId = e.dataTransfer.getData('itemId');
              if (itemId) deleteItem(itemId);
            }}
            style={{
              width: isOverTrash ? 80 : 60,
              height: isOverTrash ? 80 : 60,
              borderRadius: isOverTrash ? 20 : 16,
              background: isOverTrash ? 'rgba(239,68,68,0.2)' : 'rgba(34,40,49,0.92)',
              border: `2px ${isOverTrash ? 'solid' : 'dashed'} ${isOverTrash ? '#ef4444' : '#393E46'}`,
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'copy',
              transition: 'width 0.15s, height 0.15s, border-radius 0.15s, background 0.15s, border-color 0.15s',
              boxShadow: isOverTrash ? '0 0 24px rgba(239,68,68,0.25)' : '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <Trash2
              size={isOverTrash ? 22 : 18}
              style={{ color: isOverTrash ? '#ef4444' : '#948979', transition: 'color 0.15s' }}
            />
            {isOverTrash && (
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, letterSpacing: '0.08em', color: '#ef4444', textTransform: 'uppercase' }}>Delete</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function IconBtn({ active, onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center cursor-pointer transition-colors border"
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        borderColor: '#393E46',
        background: active ? '#393E46' : 'transparent',
        color: active ? '#DFD0B8' : '#948979',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(57,62,70,0.5)';
          e.currentTarget.style.color = '#DFD0B8';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#948979';
        }
      }}
    >
      {children}
    </button>
  );
}

function PagBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer border transition-colors"
      style={{
        padding: '6px 14px',
        background: 'transparent',
        border: '1px solid #393E46',
        borderRadius: 8,
        fontFamily: 'DM Mono, monospace',
        fontSize: '10px',
        letterSpacing: '0.06em',
        color: disabled ? '#4a5260' : '#948979',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = '#948979'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.borderColor = '#393E46'; }}
    >
      {children}
    </button>
  );
}