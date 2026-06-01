import { useDroppable } from '@dnd-kit/core';
import type { Guest } from '../data/guests';
import GuestCard from './GuestCard';

interface Props {
  tableId: string;
  seatIndex: number;
  guest: Guest | null;
  onUnassign: (guestId: string) => void;
}

export default function SeatSlot({ tableId, seatIndex, guest, onUnassign }: Props) {
  const droppableId = `${tableId}::${seatIndex}`;
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      className={`seat-slot ${isOver ? 'over' : ''} ${guest ? 'occupied' : 'empty'}`}
    >
      {guest ? (
        <div className="seat-guest">
          <GuestCard guest={guest} compact />
          <button
            className="unassign-btn"
            onClick={() => onUnassign(guest.id)}
            title="Remover do lugar"
          >×</button>
        </div>
      ) : (
        <span className="seat-empty-label">Lugar {seatIndex + 1}</span>
      )}
    </div>
  );
}
