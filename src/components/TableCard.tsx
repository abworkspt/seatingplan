import React, { useState } from 'react';
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
  onSetShape?: (shape: 'rectangular' | 'circular') => void;
  onDragHandlePointerDown?: (e: React.PointerEvent) => void;
  onSeatTap?: (tableId: string, seatIndex: number) => void;
}

// ── Draggable guest inside a seat ──
function DraggableGuest({ guest, onUnassign }: { guest: Guest; onUnassign: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
    data: { guest },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="seat-draggable"
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
    >
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

// ── Rectangular seat ──
function RectSeat({ tableId, seatIndex, guest, onUnassign, onSeatTap }: {
  tableId: string; seatIndex: number; guest: Guest | null;
  onUnassign: (id: string) => void; onSeatTap?: (tableId: string, seatIndex: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `${tableId}::${seatIndex}` });
  return (
    <div
      ref={setNodeRef}
      className={`seat-rect ${isOver ? 'over' : ''} ${guest ? 'occupied' : 'empty'}`}
      onClick={() => !guest && onSeatTap?.(tableId, seatIndex)}
    >
      {guest
        ? <DraggableGuest guest={guest} onUnassign={onUnassign} />
        : <span className="seat-rect-empty" onClick={() => onSeatTap?.(tableId, seatIndex)}>{seatIndex + 1}</span>
      }
    </div>
  );
}

// ── Circular seat ──
const CIRC_CENTER = 130;
const CIRC_RADIUS = 88;
const CIRC_SEAT_W = 72;
const CIRC_SEAT_H = 26;
const CIRC_ANGLES = [270, 315, 0, 45, 90, 135, 180, 225]; // clockwise from top

function CircSeat({ tableId, seatIndex, guest, onUnassign, onSeatTap }: {
  tableId: string; seatIndex: number; guest: Guest | null;
  onUnassign: (id: string) => void; onSeatTap?: (tableId: string, seatIndex: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `${tableId}::${seatIndex}` });
  const angle = CIRC_ANGLES[seatIndex] ?? 0;
  const rad = (angle * Math.PI) / 180;
  const cx = CIRC_CENTER + CIRC_RADIUS * Math.cos(rad);
  const cy = CIRC_CENTER + CIRC_RADIUS * Math.sin(rad);

  return (
    <div
      ref={setNodeRef}
      className={`circ-seat ${isOver ? 'over' : ''} ${guest ? 'occupied' : 'empty'}`}
      style={{
        left: cx - CIRC_SEAT_W / 2,
        top: cy - CIRC_SEAT_H / 2,
        width: CIRC_SEAT_W,
        height: CIRC_SEAT_H,
      }}
      onClick={() => !guest && onSeatTap?.(tableId, seatIndex)}
    >
      {guest ? (
        <DraggableGuest guest={guest} onUnassign={onUnassign} />
      ) : (
        <span className="circ-seat-empty" onClick={() => onSeatTap?.(tableId, seatIndex)}>{seatIndex + 1}</span>
      )}
    </div>
  );
}

// ── Table name editor (shared) ──
function TableLabel({ table, onRename, onRemove }: {
  table: Table;
  onRename: (id: string, label: string) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(table.label);
  const occupants = table.seats.filter(Boolean).length;

  const commit = () => {
    if (draft.trim()) onRename(table.id, draft.trim());
    else setDraft(table.label);
    setEditing(false);
  };

  const handleRemove = () => {
    if (occupants > 0 && !confirm(`A ${table.label} tem ${occupants} pessoa(s). Remover?`)) return;
    onRemove(table.id);
  };

  return (
    <>
      <button className="table-remove-btn" onClick={handleRemove} title="Remover mesa">×</button>
      {editing ? (
        <input
          className="table-name-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(table.label); setEditing(false); } }}
          autoFocus
          onPointerDown={e => e.stopPropagation()}
        />
      ) : (
        <span className="table-label" onClick={() => setEditing(true)} title="Clique para renomear">
          {table.label}
        </span>
      )}
      <span className="table-count">{occupants}/8</span>
    </>
  );
}

// ── Main TableCard ──
export default function TableCard({ table, guests, onRemove, onRename, onUnassign, onSetShape, onDragHandlePointerDown, onSeatTap }: Props) {
  const guestMap = Object.fromEntries(guests.map(g => [g.id, g]));
  const isCanvas = !!onDragHandlePointerDown;

  // ── CIRCULAR ──
  if (table.shape === 'circular') {
    return (
      <div className="circular-table-card">
        {/* Shape toggle */}
        {onSetShape && (
          <button className="shape-toggle-btn" onClick={() => onSetShape('rectangular')} title="Mudar para rectangular">⬜</button>
        )}
        {/* Seats */}
        {Array.from({ length: 8 }, (_, i) => (
          <CircSeat
            key={i}
            tableId={table.id}
            seatIndex={i}
            guest={table.seats[i] ? guestMap[table.seats[i]!] ?? null : null}
            onUnassign={onUnassign}
            onSeatTap={onSeatTap}
          />
        ))}
        {/* Circle body (drag handle on canvas) */}
        <div
          className="circular-table-body"
          onPointerDown={isCanvas ? onDragHandlePointerDown : undefined}
          style={{ cursor: isCanvas ? 'grab' : 'default' }}
        >
          <TableLabel table={table} onRename={onRename} onRemove={onRemove} />
        </div>
      </div>
    );
  }

  // ── RECTANGULAR ──
  const leftSeats = [0, 1, 2, 3];
  const rightSeats = [4, 5, 6, 7];

  return (
    <div className="table-card">
      {/* Left seats */}
      <div className="seats-col left">
        {leftSeats.map(i => (
          <RectSeat key={i} tableId={table.id} seatIndex={i}
            guest={table.seats[i] ? guestMap[table.seats[i]!] ?? null : null}
            onUnassign={onUnassign} onSeatTap={onSeatTap}
          />
        ))}
      </div>

      {/* Table body */}
      <div
        className="table-body"
        onPointerDown={isCanvas ? onDragHandlePointerDown : undefined}
        style={{ cursor: isCanvas ? 'grab' : 'default' }}
      >
        <TableLabel table={table} onRename={onRename} onRemove={onRemove} />
        {onSetShape && (
          <button className="shape-toggle-btn" onClick={() => onSetShape('circular')} title="Mudar para circular">⭕</button>
        )}
      </div>

      {/* Right seats */}
      <div className="seats-col right">
        {rightSeats.map(i => (
          <RectSeat key={i} tableId={table.id} seatIndex={i}
            guest={table.seats[i] ? guestMap[table.seats[i]!] ?? null : null}
            onUnassign={onUnassign} onSeatTap={onSeatTap}
          />
        ))}
      </div>
    </div>
  );
}
