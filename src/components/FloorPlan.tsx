import type { Table } from '../store';
import type { Guest } from '../data/guests';
import TableCard from './TableCard';

interface Props {
  tables: Table[];
  guests: Guest[];
  onAddTable: () => void;
  onRemoveTable: (id: string) => void;
  onRenameTable: (id: string, label: string) => void;
  onUnassign: (guestId: string) => void;
  onSeatTap?: (tableId: string, seatIndex: number) => void;
}

export default function FloorPlan({ tables, guests, onAddTable, onRemoveTable, onRenameTable, onUnassign, onSeatTap }: Props) {
  return (
    <main className="floor-plan">
      <h1 className="print-title">Casamento — Seating Plan</h1>
      <div className="floor-plan-header">
        <h2>Sala</h2>
        <button className="add-table-btn" onClick={onAddTable}>+ Mesa</button>
      </div>
      <div className="tables-grid">
        {[...tables].reverse().map(table => (
          <TableCard
            key={table.id}
            table={table}
            guests={guests}
            onRemove={onRemoveTable}
            onRename={onRenameTable}
            onUnassign={onUnassign}
            onSeatTap={onSeatTap}
          />
        ))}
      </div>
    </main>
  );
}
