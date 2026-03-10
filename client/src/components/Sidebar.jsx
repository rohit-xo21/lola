import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { BookMarked, Star, Tag, List, ChevronDown, Plus, Trash2, MoreHorizontal, Pencil } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Sidebar({ activeFilter, onFilterChange }) {
  const [listsOpen, setListsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [newList, setNewList] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [dragOverListId, setDragOverListId] = useState(null);
  const [deleteListId, setDeleteListId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renameListId, setRenameListId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const qc = useQueryClient();

  const { data: lists = [], refetch: refetchLists } = useQuery({
    queryKey: ['lists'],
    queryFn: () => api.get('/lists').then((r) => r.data),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get('/items/tags').then((r) => r.data),
  });

  const createList = async (e) => {
    e.preventDefault();
    if (!newList.trim()) return;
    try {
      await api.post('/lists', { name: newList.trim() });
      setNewList(''); setAddingList(false); refetchLists();
      toast.success('List created');
    } catch { toast.error('Failed to create list'); }
  };

  const addItemToList = async (itemId, listId) => {
    try {
      const item = await api.get(`/items/${itemId}`).then(r => r.data);
      const listIds = item.listIds || [];
      if (!listIds.includes(listId)) {
        listIds.push(listId);
      }
      await api.patch(`/items/${itemId}`, { listIds });
      qc.invalidateQueries(['items']);
      toast.success('Item added to list');
    } catch (err) {
      toast.error(err.message || 'Failed to add item to list');
    }
  };

  const deleteList = async (listId) => {
    try {
      await api.delete(`/lists/${listId}`);
      qc.invalidateQueries(['lists']);
      qc.invalidateQueries(['items']);
      toast.success('List deleted');
      setDeleteListId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete list');
    }
  };

  const renameList = async (listId) => {
    if (!renameValue.trim()) { setRenameListId(null); return; }
    try {
      await api.patch(`/lists/${listId}`, { name: renameValue.trim() });
      qc.invalidateQueries(['lists']);
      toast.success('List renamed');
      setRenameListId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to rename list');
    }
  };

  const isActive = (type, value) => activeFilter.type === type && activeFilter.value === value;

  return (
    <>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 0 !important; }
        .sidebar-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="sidebar-scroll w-60 shrink-0 bg-[#1e232a] border-r border-[#393E46] flex flex-col overflow-y-auto">

        {/* Logo */}
        <div className="px-3 py-4 border-b border-[#393E46]">
          <img src="/logobrand.svg" alt="Lola" style={{ maxWidth: '113px', height: 'auto', display: 'block' }} />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-3 pt-3 pb-4 border-b border-[#393E46]">
          <NavItem
            icon={<BookMarked size={14} />}
            label="All items"
            active={activeFilter.type === 'all'}
            onClick={() => onFilterChange({ type: 'all' })}
          />
          <NavItem
            icon={<Star size={14} />}
            label="Favorites"
            active={activeFilter.type === 'favorite'}
            onClick={() => onFilterChange({ type: 'favorite' })}
          />
          <NavItem
            icon={<span className="text-[11px]">🗂️</span>}
            label="Archived"
            active={activeFilter.type === 'archived'}
            onClick={() => onFilterChange({ type: 'archived' })}
          />
        </nav>

        {/* Lists */}
        <div className="px-3 pt-4 pb-4 border-b border-[#393E46]">
          <button
            onClick={() => setListsOpen((o) => !o)}
            className="flex items-center gap-2 w-full px-1 py-1.5 text-[#948979]/50 hover:text-[#948979] transition-colors cursor-pointer bg-transparent border-none mb-1"
          >
            <List size={12} />
            <span className="flex-1 text-left text-[10px] font-semibold uppercase tracking-widest">Lists</span>
            <ChevronDown
              size={11}
              style={{ transform: listsOpen ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}
            />
            <span
              onClick={(e) => { e.stopPropagation(); setAddingList(true); }}
              className="hover:text-[#DFD0B8] cursor-pointer p-0.5 transition-colors"
            >
              <Plus size={12} />
            </span>
          </button>

          {listsOpen && (
            <div className="flex flex-col gap-0.5">
              {addingList && (
                <form onSubmit={createList} className="mb-1">
                  <input
                    autoFocus
                    value={newList}
                    onChange={(e) => setNewList(e.target.value)}
                    onBlur={() => { if (!newList) setAddingList(false); }}
                    placeholder="List name…"
                    className="w-full px-3 py-2 bg-[#181c22] border border-[#393E46] rounded-xl text-xs text-[#DFD0B8] placeholder-[#4a5260] outline-none focus:border-[#948979] transition-colors"
                  />
                </form>
              )}
              {lists.map((list) => (
                <div key={list._id} className="group relative">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOverListId(list._id); }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverListId(null); }}
                    onDrop={(e) => {
                      e.preventDefault(); setDragOverListId(null);
                      const itemId = e.dataTransfer.getData('itemId');
                      if (itemId) addItemToList(itemId, list._id);
                    }}
                    className={`flex items-center rounded-lg transition-colors ${
                      dragOverListId === list._id ? 'bg-[#393E46]/60' : ''
                    } ${isActive('list', list._id) ? 'bg-[#393E46]' : 'hover:bg-[#393E46]/40'}`}
                  >
                    {renameListId === list._id ? (
                      <form
                        onSubmit={(e) => { e.preventDefault(); renameList(list._id); }}
                        className="flex-1 px-2 py-1"
                      >
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => renameList(list._id)}
                          onKeyDown={(e) => { if (e.key === 'Escape') setRenameListId(null); }}
                          className="w-full px-2 py-1 bg-[#181c22] border border-[#948979]/50 rounded-lg text-xs text-[#DFD0B8] outline-none"
                        />
                      </form>
                    ) : (
                      <button
                        onClick={() => onFilterChange({ type: 'list', value: list._id, label: list.name })}
                        className={`flex items-center gap-2.5 flex-1 px-3 py-2 text-sm cursor-pointer border-none text-left bg-transparent transition-colors ${
                          isActive('list', list._id) ? 'text-[#DFD0B8] font-medium' : 'text-[#948979] hover:text-[#DFD0B8]'
                        }`}
                      >
                        <span className="shrink-0 text-[#948979] text-sm">{list.icon || '📁'}</span>
                        <span className="flex-1 truncate">{list.name}</span>
                        {list.itemCount != null && <span className="text-[#948979]/40 text-xs">{list.itemCount}</span>}
                      </button>
                    )}
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === list._id ? null : list._id); }}
                        className="mr-1 p-1 text-[#948979]/50 hover:text-[#948979] rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {openMenuId === list._id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-1 top-7 bg-[#1e232a] border border-[#393E46] rounded-lg shadow-xl z-50 min-w-[130px] py-1">
                            <button
                              onClick={() => { setOpenMenuId(null); setRenameListId(list._id); setRenameValue(list.name); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#DFD0B8] hover:bg-[#393E46]/60 transition-colors"
                            >
                              <Pencil size={12} /> Rename
                            </button>
                            <button
                              onClick={() => { setOpenMenuId(null); setDeleteListId(list._id); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
                            >
                              <Trash2 size={12} /> Delete list
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {lists.length === 0 && !addingList && (
                <p className="text-xs text-[#948979]/30 px-2 py-1.5">No lists yet</p>
              )}
            </div>
          )}
        </div>

        {/* Delete confirmation modal */}
        {deleteListId && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDeleteListId(null)}>
            <div className="bg-[#222831] border border-[#393E46] rounded-xl p-6 max-w-xs w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-[#DFD0B8] font-semibold text-sm mb-1">Delete list?</h2>
              <p className="text-[#948979] text-xs mb-5">Items in this list won't be deleted, just removed from it.</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteListId(null)}
                  className="px-4 py-2 text-xs text-[#948979] hover:text-[#DFD0B8] bg-[#393E46]/40 hover:bg-[#393E46] rounded-lg transition-colors"
                >Cancel</button>
                <button
                  onClick={() => deleteList(deleteListId)}
                  className="px-4 py-2 text-xs text-white bg-[#f87171]/80 hover:bg-[#f87171] rounded-lg transition-colors"
                >Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="px-3 pt-4">
          <button
            onClick={() => setTagsOpen((o) => !o)}
            className="flex items-center gap-2 w-full px-1 py-1.5 text-[#948979]/50 hover:text-[#948979] transition-colors cursor-pointer bg-transparent border-none mb-1"
          >
            <Tag size={12} />
            <span className="flex-1 text-left text-[10px] font-semibold uppercase tracking-widest">Tags</span>
            <ChevronDown
              size={11}
              style={{ transform: tagsOpen ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}
            />
          </button>

          {tagsOpen && (
            <div className="flex flex-wrap gap-1.5 pt-1 pb-4">
              {tags.slice(0, 40).map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => onFilterChange({ type: 'tag', value: tag.name })}
                  className={`px-2.5 py-1 rounded-full text-[11px] cursor-pointer border transition-colors
                    ${isActive('tag', tag.name)
                      ? 'bg-[#DFD0B8] text-[#222831] border-[#DFD0B8] font-medium'
                      : 'bg-transparent text-[#948979]/70 border-[#393E46] hover:border-[#948979]/50 hover:text-[#948979]'
                    }`}
                >
                  {tag.name}{' '}
                  <span className="opacity-40">{tag.count}</span>
                </button>
              ))}
              {tags.length === 0 && (
                <p className="text-xs text-[#948979]/30">No tags yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function NavItem({ icon, label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer border-none text-left
        ${active
          ? 'bg-[#393E46] text-[#DFD0B8] font-medium'
          : 'text-[#948979] hover:text-[#DFD0B8] hover:bg-[#393E46]/40 bg-transparent'
        }`}
    >
      <span className="shrink-0 text-[#948979]">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {count != null && (
        <span className="text-[#948979]/40 text-xs">{count}</span>
      )}
    </button>
  );
}