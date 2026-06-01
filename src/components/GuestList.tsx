import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Guest, GuestType } from '../data/guests';
import GuestCard from './GuestCard';

interface Props {
  guests: Guest[];
  assignedIds: Set<string>;
  onRemoveCompanion: (guestId: string) => void;
  onDeleteGuest: (guestId: string) => void;
  onAddGuest: (name: string, type: GuestType, mainGuestId?: string) => void;
  onRenameGuest: (guestId: string, name: string) => void;
}

function DroppableGuest({ guest, companions, assignedIds, onRemoveCompanion, onDeleteGuest, onAddCompanion, onRenameGuest }: {
  guest: Guest;
  companions: Guest[];
  assignedIds: Set<string>;
  onRemoveCompanion: (guestId: string) => void;
  onDeleteGuest: (guestId: string) => void;
  onAddCompanion: (mainGuestId: string) => void;
  onRenameGuest: (guestId: string, name: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `guest-target::${guest.id}` });

  return (
    <div ref={setNodeRef} className={`guest-group ${isOver ? 'drop-target' : ''}`}>
      <div className="guest-main-row">
        <GuestCard guest={guest} isCompanion={false} onRename={onRenameGuest} placed={assignedIds.has(guest.id)} />
        <div className="guest-actions">
          <button className="guest-action-btn add-companion-btn" onClick={() => onAddCompanion(guest.id)} title="Adicionar acompanhante">+</button>
          <button className="guest-action-btn delete-btn" onClick={() => onDeleteGuest(guest.id)} title="Apagar">×</button>
        </div>
      </div>
      {companions.map(c => (
        <div key={c.id} className="guest-companion-row">
          <GuestCard guest={c} isCompanion compact onRename={onRenameGuest} placed={assignedIds.has(c.id)} />
          <div className="guest-actions">
            <button className="guest-action-btn detach-btn" onClick={() => onRemoveCompanion(c.id)} title="Tornar independente">↑</button>
            <button className="guest-action-btn delete-btn" onClick={() => onDeleteGuest(c.id)} title="Apagar">×</button>
          </div>
        </div>
      ))}
    </div>
  );
}

interface AddFormProps {
  onAdd: (name: string, type: GuestType, mainGuestId?: string) => void;
  mainGuestId?: string;
  onCancel?: () => void;
  label?: string;
}

function AddGuestForm({ onAdd, mainGuestId, onCancel, label }: AddFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<GuestType>('adult');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), type, mainGuestId);
    setName('');
    setType('adult');
    onCancel?.();
  };

  return (
    <form className="add-guest-form" onSubmit={handleSubmit}>
      <div className="add-guest-row">
        <select className="type-select" value={type} onChange={e => setType(e.target.value as GuestType)}>
          <option value="adult">A</option>
          <option value="child">C</option>
          <option value="baby">B</option>
        </select>
        <input
          className="add-guest-input"
          placeholder={label ?? 'Nome do convidado...'}
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </div>
      <div className="add-guest-btns">
        <button type="submit" className="add-confirm-btn">Adicionar</button>
        {onCancel && <button type="button" className="add-cancel-btn" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  );
}

export default function GuestList({ guests, assignedIds, onRemoveCompanion, onDeleteGuest, onAddGuest, onRenameGuest }: Props) {
  const [search, setSearch] = useState('');
  const [addingCompanionTo, setAddingCompanionTo] = useState<string | null>(null);
  const [showAddMain, setShowAddMain] = useState(false);

  const unassignedCount = guests.filter(g => !assignedIds.has(g.id)).length;
  const assignedCount = guests.filter(g => assignedIds.has(g.id)).length;
  const mainGuests = guests.filter(g => g.isMain);

  const renderGroup = (main: Guest) => {
    const companions = guests.filter(g => g.mainGuestId === main.id);
    const allInGroup = [main, ...companions];

    if (search) {
      const anyMatch = allInGroup.some(g =>
        g.name.toLowerCase().includes(search.toLowerCase())
      );
      if (!anyMatch) return null;
    }

    const allAssigned = allInGroup.every(g => assignedIds.has(g.id));

    return (
      <div key={main.id} className={allAssigned ? 'all-assigned' : ''}>
        <DroppableGuest
          guest={main}
          companions={companions}
          assignedIds={assignedIds}
          onRemoveCompanion={onRemoveCompanion}
          onDeleteGuest={onDeleteGuest}
          onAddCompanion={id => setAddingCompanionTo(id)}
          onRenameGuest={onRenameGuest}
        />
        {addingCompanionTo === main.id && (
          <div className="inline-add-form">
            <AddGuestForm
              onAdd={onAddGuest}
              mainGuestId={main.id}
              onCancel={() => setAddingCompanionTo(null)}
              label={`Acompanhante de ${main.name.split(' ')[0]}...`}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="guest-list">
      <div className="guest-list-header">
        <h2>Convidados</h2>
        <div className="guest-stats">
          <span className="stat unassigned">{unassignedCount} por colocar</span>
          <span className="stat assigned">{assignedCount} colocados</span>
        </div>
        <input
          className="search-input"
          type="text"
          placeholder="Pesquisar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="guest-list-body">
        {mainGuests.map(renderGroup)}
        {showAddMain ? (
          <div className="add-main-form">
            <AddGuestForm onAdd={onAddGuest} onCancel={() => setShowAddMain(false)} />
          </div>
        ) : (
          <button className="add-main-btn" onClick={() => setShowAddMain(true)}>+ Adicionar convidado</button>
        )}
      </div>
    </aside>
  );
}
