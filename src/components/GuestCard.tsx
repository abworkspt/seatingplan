import { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Guest } from '../data/guests';

interface Props {
  guest: Guest;
  compact?: boolean;
  isCompanion?: boolean;
  onRename?: (guestId: string, name: string) => void;
  placed?: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  adult: 'A',
  child: 'C',
  baby: 'B',
};

export default function GuestCard({ guest, compact, isCompanion, onRename, placed }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(guest.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
    data: { guest },
    disabled: editing,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: editing ? 'default' : 'grab',
  };

  const startEdit = (e: React.MouseEvent) => {
    if (!onRename) return;
    e.stopPropagation();
    setDraft(guest.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    if (draft.trim() && draft.trim() !== guest.name) {
      onRename?.(guest.id, draft.trim());
    } else {
      setDraft(guest.name);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') { setDraft(guest.name); setEditing(false); }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(editing ? {} : listeners)}
      {...attributes}
      className={`guest-card ${isCompanion ? 'companion' : 'main'} ${compact ? 'compact' : ''} ${isDragging ? 'dragging' : ''} ${placed ? 'placed' : ''}`}
    >
      {placed ? <span className="placed-check">✓</span> : <span className="badge type-badge">{TYPE_LABEL[guest.type]}</span>}
      {editing ? (
        <input
          ref={inputRef}
          className="guest-name-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          autoFocus
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span className="guest-name" onDoubleClick={startEdit} title="Duplo clique para editar">
          {guest.name}
        </span>
      )}
    </div>
  );
}
