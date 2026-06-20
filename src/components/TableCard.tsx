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

// ── Circular seat (position computed by parent) ──
function CircSeat({ tableId, seatIndex, guest, left, top, width, height, onUnassign, onSeatTap }: {
  tableId: string; seatIndex: number; guest: Guest | null;
  left: number; top: number; width: number; height: number;
  onUnassign: (id: string) => void; onSeatTap?: (tableId: string, seatIndex: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `${tableId}::${seatIndex}` });
  return (
    <div
      ref={setNodeRef}
      className={`circ-seat ${isOver ? 'over' : ''} ${guest ? 'occupied' : 'empty'}`}
      style={{ left, top, width, height }}
      onClick={() => !guest && onSeatTap?.(tableId, seatIndex)}
    >
      {guest
        ? <DraggableGuest guest={guest} onUnassign={onUnassign} />
        : <span className="circ-seat-empty" onClick={() => onSeatTap?.(tableId, seatIndex)}>{seatIndex + 1}</span>
      }
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
  const total = table.seats.length;

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
      <button className="table-remove-btn" onClick={handleRemove} onPointerDown={e => e.stopPropagation()} title="Remover mesa">×</button>
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
        <span className="table-label" onClick={() => setEditing(true)} onPointerDown={e => e.stopPropagation()} title="Clique para renomear">
          {table.label}
        </span>
      )}
      <span className="table-count">{occupants}/{total}</span>
    </>
  );
}

// ── Main TableCard ──
export default function TableCard({ table, guests, onRemove, onRename, onUnassign, onSetShape, onDragHandlePointerDown, onSeatTap }: Props) {
  const guestMap = Object.fromEntries(guests.map(g => [g.id, g]));
  const isCanvas = !!onDragHandlePointerDown;
  const n = table.seats.length;

  // ── CIRCULAR ──
  if (table.shape === 'circular') {
    const seatW = 70;
    const seatH = 26;
    const bodyD = 84;
    const minSpacing = 80; // min distance between adjacent seat centers along the ring
    // Ring must clear the central body; for few seats this floor (not a fixed 80)
    // keeps the card from being huge and mostly empty.
    const minRing = bodyD / 2 + 8 + seatH / 2;
    const radius = Math.max(minRing, (minSpacing * n) / (2 * Math.PI));
    const pad = 8;
    const cardSize = 2 * (radius + seatW / 2) + pad * 2;
    const center = cardSize / 2;

    return (
      <div className="circular-table-card" style={{ width: cardSize, height: cardSize }}>
        {Array.from({ length: n }, (_, i) => {
          const angleDeg = -90 + i * (360 / n); // first seat at top, clockwise
          const rad = (angleDeg * Math.PI) / 180;
          const cx = center + radius * Math.cos(rad);
          const cy = center + radius * Math.sin(rad);
          return (
            <CircSeat
              key={i}
              tableId={table.id}
              seatIndex={i}
              guest={table.seats[i] ? guestMap[table.seats[i]!] ?? null : null}
              left={cx - seatW / 2}
              top={cy - seatH / 2}
              width={seatW}
              height={seatH}
              onUnassign={onUnassign}
              onSeatTap={onSeatTap}
            />
          );
        })}
        <div
          className="circular-table-body"
          style={{
            width: bodyD,
            height: bodyD,
            left: center,
            top: center,
            cursor: isCanvas ? 'grab' : 'default',
          }}
          onPointerDown={isCanvas ? onDragHandlePointerDown : undefined}
        >
          <TableLabel table={table} onRename={onRename} onRemove={onRemove} />
          {onSetShape && (
            <button className="shape-toggle-btn" onPointerDown={e => e.stopPropagation()} onClick={() => onSetShape('rectangular')} title="Mudar para rectangular">⬛</button>
          )}
        </div>
      </div>
    );
  }

  // ── RECTANGULAR ──
  const half = Math.ceil(n / 2);
  const leftSeats = Array.from({ length: half }, (_, i) => i);
  const rightSeats = Array.from({ length: n - half }, (_, i) => i + half);

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
          <button className="shape-toggle-btn" onPointerDown={e => e.stopPropagation()} onClick={() => onSetShape('circular')} title="Mudar para circular">⬤</button>
        )}
      </div>

      {/* Right seats (omitted entirely when there are none, e.g. single-seat table) */}
      {rightSeats.length > 0 && (
        <div className="seats-col right">
          {rightSeats.map(i => (
            <RectSeat key={i} tableId={table.id} seatIndex={i}
              guest={table.seats[i] ? guestMap[table.seats[i]!] ?? null : null}
              onUnassign={onUnassign} onSeatTap={onSeatTap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
