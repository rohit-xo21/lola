import { useRef, useState } from 'react';
import { timeAgo, truncate } from '../lib/utils';
import { Link2, FileText, Image, StickyNote, Clock, Star, RefreshCw, GripVertical } from 'lucide-react';

const TYPE_ICON = {
  link: <Link2 size={13} />,
  pdf: <FileText size={13} />,
  image: <Image size={13} />,
  note: <StickyNote size={13} />,
};

export default function ItemCard({ item, view, onClick }) {
  if (view === 'list') return <ListCard item={item} onClick={onClick} />;
  return <GridCard item={item} onClick={onClick} />;
}

function GridCard({ item, onClick }) {
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  return (
    <div
      draggable
      onClick={() => { if (!dragging.current) onClick(); }}
      onDragStart={(e) => {
        dragging.current = true;
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('itemId', item._id);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setTimeout(() => { dragging.current = false; }, 100);
      }}
      style={{ opacity: isDragging ? 0.4 : 1, transform: isDragging ? 'scale(0.97)' : 'scale(1)', transition: 'opacity 0.15s, transform 0.15s' }}
      className="bg-[#222831] border border-[#393E46]/80 rounded-2xl overflow-hidden cursor-pointer hover:border-[#948979]/40 hover:bg-[#262e38] group relative"
    >
      {item.previewImage && (
        <div className="h-40 overflow-hidden bg-[#1a1e24]">
          <img
            src={item.previewImage}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 opacity-90"
            onError={(e) => e.target.parentElement.style.display = 'none'}
          />
        </div>
      )}
      <div className="p-5">
        {/* Drag handle */}
        <div
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-[#948979]/40 hover:text-[#948979]"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3">
          {item.favicon && (
            <img src={item.favicon} alt="" width={14} height={14} className="rounded-sm shrink-0 opacity-80" onError={(e) => e.target.style.display = 'none'} />
          )}
          <span className="text-[#948979]/50">{TYPE_ICON[item.type]}</span>
          {item.category && (
            <span className="text-[10px] text-[#948979]/80 bg-[#393E46]/60 px-2 py-0.5 rounded-full">
              {item.category}
            </span>
          )}
          <span className="ml-auto flex items-center gap-2">
            {item.isFavorite && <Star size={12} fill="#DFD0B8" color="#DFD0B8" />}
            <AiDot status={item.aiStatus} />
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-semibold text-[#DFD0B8] mb-2 leading-snug line-clamp-2">
          {truncate(item.title, 80)}
        </h3>

        {/* Summary */}
        {item.summary && (
          <p className="text-xs text-[#948979]/80 leading-relaxed mb-3 line-clamp-2">
            {truncate(item.summary, 110)}
          </p>
        )}

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-[#948979]/70 bg-[#393E46]/50 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2.5 text-[11px] text-[#948979]/40 pt-3 border-t border-[#393E46]/40">
          {item.readingTimeMinutes && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {item.readingTimeMinutes}m
            </span>
          )}
          <span className="ml-auto">{timeAgo(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function ListCard({ item, onClick }) {
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  return (
    <div
      draggable
      onClick={() => { if (!dragging.current) onClick(); }}
      onDragStart={(e) => {
        dragging.current = true;
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('itemId', item._id);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setTimeout(() => { dragging.current = false; }, 100);
      }}
      style={{ opacity: isDragging ? 0.4 : 1, transform: isDragging ? 'scale(0.99)' : 'scale(1)', transition: 'opacity 0.15s, transform 0.15s' }}
      className="flex items-center gap-3 bg-[#222831] border border-[#393E46]/80 rounded-2xl px-4 py-4 cursor-pointer hover:border-[#948979]/40 hover:bg-[#262e38] group"
    >
      {/* Drag handle */}
      <div
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-[#948979]/40 hover:text-[#948979]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </div>
      {item.previewImage && (
        <img
          src={item.previewImage}
          alt=""
          className="w-12 h-12 rounded-xl object-cover shrink-0 opacity-90"
          onError={(e) => e.target.style.display = 'none'}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1">
          <h3 className="text-[13px] font-semibold text-[#DFD0B8] truncate flex-1">{item.title}</h3>
          {item.isFavorite && <Star size={12} fill="#DFD0B8" color="#DFD0B8" />}
          <AiDot status={item.aiStatus} />
        </div>

        {item.summary && (
          <p className="text-xs text-[#948979]/80 truncate mb-2">{item.summary}</p>
        )}

        <div className="flex items-center gap-1.5">
          {item.tags?.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[10px] text-[#948979]/70 bg-[#393E46]/50 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
          <span className="text-[11px] text-[#948979]/40 ml-auto">{timeAgo(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function AiDot({ status }) {
  if (status === 'done') return null;
  if (status === 'processing') return <RefreshCw size={10} className="text-[#DFD0B8]/60 animate-spin" />;
  if (status === 'failed') return <span className="w-1.5 h-1.5 rounded-full bg-red-400/70 inline-block" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-[#393E46] inline-block" />;
}