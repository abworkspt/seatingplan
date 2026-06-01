import { useState } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Table } from '../store';
import type { Guest } from '../data/guests';

interface Props {
  table: Table;
  guests: Guest[];
  onRemove: (tableId: string) => void;
  onRename: (tableId: string, label: string) => void;
  onUnassign: (guestId: string) => void;
  onSeatTap?: (tableId: string, seatIndex: number) => void;
}

interface SeatProps {
  tableId: string;
  seatIndex: number;
  guest: Guest | null;
  onUnassign: (guestId: string) => void;
  onSeatTap?: (tableId: string, seatIndex: number) => void;
}

function DraggableGuest({ guest, onUnassign }: { guest: Guest; onUnassign: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
    data: { guest },
  });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="seat-draggable">
      <span className="seat-type-badge">{guest.type === 'adult' ? 'A' : guest.type === 'child' ? 'C' : 'B'}</span>
      <span className="seat-rect-name">{guest.name}</span>
      <button
        className="seat-rect-remove"
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onUnassign(guest.id); }}
        title="Remover"
      >×</button>
    </div>
  );
}

function Seat({ tableId, seatIndex, guest, onUnassign, onSeatTap }: SeatProps) {
  const { isOver, setNodeRef } = useDroppable({ id: `${tableId}::${seatIndex}` });

  return (
    <div
      ref={setNodeRef}
      className={`seat-rect ${isOver ? 'over' : ''} ${guest ? 'occupied' : 'empty'}`}
      onClick={() => !guest && onSeatTap?.(tableId, seatIndex)}
    >
      {guest ? (
        <DraggableGuest guest={guest} onUnassign={onUnassign} />
      ) : (
        <span className="seat-rect-empty" onClick={() => onSeatTap?.(tableId, seatIndex)}>{seatIndex + 1}</span>
      )}
    </div>
  );
}

export default function TableCard({ table, guests, onRemove, onRename, onUnassign, onSeatTap }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(table.label);

  const guestMap = Object.fromEntries(guests.map(g => [g.id, g]));
  const occupants = table.seats.filter(Boolean).length;

  const handleRename = () => {
    if (draft.trim()) onRename(table.id, draft.trim());
    setEditing(false);
  };

  const handleRemove = () => {
    if (occupants > 0 && !confirm(`A ${table.label} tem ${occupants} pessoa(s). Remover?`)) return;
    onRemove(table.id);
  };

  // seats 0-3 = left, seats 4-7 = right
  const leftSeats = [0, 1, 2, 3];
  const rightSeats = [4, 5, 6, 7];

  return (
    <div className="table-card">
      {/* Left seats */}
      <div className="seats-col left">
        {leftSeats.map(i => (
          <Seat key={i} tableId={table.id} seatIndex={i}
            guest={table.seats[i] ? guestMap[table.seats[i]!] ?? null : null}
            onUnassign={onUnassign} onSeatTap={onSeatTap} />
        ))}
      </div>

      {/* Table body */}
      <div className="table-body">
        <button className="table-remove-btn" onClick={handleRemove} title="Remover mesa">×</button>
        {editing ? (
          <input
            className="table-name-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => e.key === 'Enter' && handleRename()}
            autoFocus
          />
        ) : (
          <span className="table-label" onClick={() => setEditing(true)} title="Clique para renomear">
            {table.label}
          </span>
        )}
        <span className="table-count">{occupants}/8</span>
      </div>

      {/* Right seats */}
      <div className="seats-col right">
        {rightSeats.map(i => (
          <Seat key={i} tableId={table.id} seatIndex={i}
            guest={table.seats[i] ? guestMap[table.seats[i]!] ?? null : null}
            onUnassign={onUnassign} onSeatTap={onSeatTap} />
        ))}
      </div>
    </div>
  );
}
