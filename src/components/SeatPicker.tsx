import { useState } from 'react';
import type { Guest } from '../data/guests';
import type { Table } from '../store';

interface Props {
  table: Table;
  seatIndex: number;
  guests: Guest[];
  assignedIds: Set<string>;
  currentGuest: Guest | null;
  onAssign: (guestId: string) => void;
  onUnassign: () => void;
  onClose: () => void;
}

export default function SeatPicker({ table, seatIndex, guests, assignedIds, currentGuest, onAssign, onUnassign, onClose }: Props) {
  const [search, setSearch] = useState('');

  const unassigned = guests.filter(g => !assignedIds.has(g.id));
  const filtered = unassigned.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const TYPE_LABEL: Record<string, string> = { adult: 'A', child: 'C', baby: 'B' };

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-sheet" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <span className="picker-title">{table.label} — Lugar {seatIndex + 1}</span>
          <button className="picker-close" onClick={onClose}>×</button>
        </div>

        {currentGuest && (
          <div className="picker-current">
            <span className="picker-current-name">{currentGuest.name}</span>
            <button className="picker-remove-btn" onClick={() => { onUnassign(); onClose(); }}>
              Remover
            </button>
          </div>
        )}

        <input
          className="picker-search"
          placeholder="Pesquisar convidado..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />

        <div className="picker-list">
          {filtered.length === 0 && (
            <p className="picker-empty">Nenhum convidado por colocar</p>
          )}
          {filtered.map(g => (
            <button
              key={g.id}
              className="picker-guest-item"
              onClick={() => { onAssign(g.id); onClose(); }}
            >
              <span className="picker-type">{TYPE_LABEL[g.type]}</span>
              <span className="picker-name">{g.name}</span>
              {g.mainGuestId && (
                <span className="picker-companion-of">
                  acomp. {guests.find(x => x.id === g.mainGuestId)?.name.split(' ')[0]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
