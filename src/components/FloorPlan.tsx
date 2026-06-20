import { useRef, useState, useEffect } from 'react';
import type { Table } from '../store';
import type { Guest } from '../data/guests';
import TableCard from './TableCard';
import AddTablesModal from './AddTablesModal';

interface Props {
  tables: Table[];
  guests: Guest[];
  canvas?: boolean; // desktop canvas mode
  onAddTables: (count: number, shape: 'rectangular' | 'circular', seatCount: number) => void;
  onRemoveTable: (id: string) => void;
  onUnassign: (guestId: string) => void;
  onMoveTable: (id: string, x: number, y: number) => void;
  onEditTable: (id: string, label: string, shape: 'rectangular' | 'circular', seatCount: number) => void;
  onSeatTap?: (tableId: string, seatIndex: number) => void;
}

export default function FloorPlan({
  tables, guests, canvas,
  onAddTables, onRemoveTable, onUnassign,
  onMoveTable, onEditTable, onSeatTap,
}: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const dragRef = useRef<{
    tableId: string;
    startX: number; startY: number;
    origX: number; origY: number;
  } | null>(null);
  const [dragging, setDragging] = useState<{ tableId: string; x: number; y: number } | null>(null);
  const onMoveTableRef = useRef(onMoveTable);
  onMoveTableRef.current = onMoveTable;

  useEffect(() => {
    if (!canvas) return;
    const handleMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const x = Math.max(0, d.origX + e.clientX - d.startX);
      const y = Math.max(0, d.origY + e.clientY - d.startY);
      setDragging({ tableId: d.tableId, x, y });
    };
    const handleUp = () => {
      const d = dragRef.current;
      if (!d) return;
      setDragging(prev => {
        if (prev) onMoveTableRef.current(d.tableId, prev.x, prev.y);
        return null;
      });
      dragRef.current = null;
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [canvas]);

  const handleTableDragStart = (e: React.PointerEvent, table: Table) => {
    e.stopPropagation();
    dragRef.current = {
      tableId: table.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: table.x,
      origY: table.y,
    };
    setDragging({ tableId: table.id, x: table.x, y: table.y });
  };

  const sortedTables = [...tables].sort((a, b) => {
    const na = parseInt(a.label.replace(/\D/g, '')) || 0;
    const nb = parseInt(b.label.replace(/\D/g, '')) || 0;
    return na - nb;
  });

  const modal = showAddModal && (
    <AddTablesModal
      onConfirm={onAddTables}
      onClose={() => setShowAddModal(false)}
    />
  );

  // ── MOBILE: simple vertical list ──
  if (!canvas) {
    return (
      <main className="floor-plan">
        {modal}
        <h1 className="print-title">Casamento — Seating Plan</h1>
        <div className="floor-plan-header">
          <h2>Sala</h2>
          <button className="add-table-btn" onClick={() => setShowAddModal(true)}>+ Mesa</button>
        </div>
        <div className="tables-grid">
          {[...sortedTables].reverse().map(table => (
            <TableCard
              key={table.id}
              table={table}
              guests={guests}
              onRemove={onRemoveTable}
              onUnassign={onUnassign}
              onEditTable={(label, shape, seatCount) => onEditTable(table.id, label, shape, seatCount)}
              onSeatTap={onSeatTap}
            />
          ))}
        </div>
      </main>
    );
  }

  // ── DESKTOP: free canvas ──
  return (
    <main className="floor-plan canvas-mode">
      {modal}
      <h1 className="print-title">Casamento — Seating Plan</h1>
      <div className="floor-plan-header">
        <h2>Sala</h2>
        <button className="add-table-btn" onClick={() => setShowAddModal(true)}>+ Mesa</button>
      </div>
      <div className="floor-plan-canvas">
        {tables.map(table => {
          const isDraggingThis = dragging?.tableId === table.id;
          const x = isDraggingThis ? dragging!.x : table.x;
          const y = isDraggingThis ? dragging!.y : table.y;
          return (
            <div
              key={table.id}
              className={`canvas-table-wrapper${isDraggingThis ? ' is-dragging' : ''}`}
              style={{ left: x, top: y }}
            >
              <TableCard
                table={table}
                guests={guests}
                onRemove={onRemoveTable}
                  onUnassign={onUnassign}
                onEditTable={(label, shape, seatCount) => onEditTable(table.id, label, shape, seatCount)}
                onDragHandlePointerDown={e => handleTableDragStart(e, table)}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}
