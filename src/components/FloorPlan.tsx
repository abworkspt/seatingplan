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

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export default function FloorPlan({
  tables, guests, canvas,
  onAddTables, onRemoveTable, onUnassign,
  onMoveTable, onEditTable, onSeatTap,
}: Props) {
  const [showAddModal, setShowAddModal] = useState(false);

  // ── table drag ──
  const dragRef = useRef<{ tableId: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [dragging, setDragging] = useState<{ tableId: string; x: number; y: number } | null>(null);
  const onMoveTableRef = useRef(onMoveTable);
  onMoveTableRef.current = onMoveTable;

  // ── pan & zoom (single atomic view state so rapid updates compose correctly) ──
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const viewRef = useRef(view); viewRef.current = view;
  const viewportRef = useRef<HTMLDivElement>(null);
  const panDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Pointer move/up for both table-dragging and canvas-panning
  useEffect(() => {
    if (!canvas) return;
    const handleMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (d) {
        const z = viewRef.current.zoom;
        const x = Math.max(0, d.origX + (e.clientX - d.startX) / z);
        const y = Math.max(0, d.origY + (e.clientY - d.startY) / z);
        setDragging({ tableId: d.tableId, x, y });
        return;
      }
      const p = panDragRef.current;
      if (p) {
        setView(v => ({ ...v, x: p.origX + (e.clientX - p.startX), y: p.origY + (e.clientY - p.startY) }));
      }
    };
    const handleUp = () => {
      const d = dragRef.current;
      if (d) {
        setDragging(prev => {
          if (prev) onMoveTableRef.current(d.tableId, prev.x, prev.y);
          return null;
        });
        dragRef.current = null;
      }
      if (panDragRef.current) {
        panDragRef.current = null;
        setPanning(false);
      }
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [canvas]);

  // Wheel: ctrl/cmd+wheel (or pinch) zooms toward cursor; plain wheel pans.
  useEffect(() => {
    if (!canvas) return;
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const rect = vp.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        setView(v => {
          const nz = clampZoom(v.zoom * factor);
          const px = (cx - v.x) / v.zoom;
          const py = (cy - v.y) / v.zoom;
          return { zoom: nz, x: cx - px * nz, y: cy - py * nz };
        });
      } else {
        setView(v => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
      }
    };
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
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

  // Pan only when grabbing empty background (not a table / seat / guest)
  const handleViewportPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target === viewportRef.current || target.classList.contains('floor-plan-canvas')) {
      panDragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: viewRef.current.x,
        origY: viewRef.current.y,
      };
      setPanning(true);
    }
  };

  const zoomBy = (factor: number) => {
    const vp = viewportRef.current;
    const rect = vp?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 0;
    const cy = rect ? rect.height / 2 : 0;
    setView(v => {
      const nz = clampZoom(v.zoom * factor);
      const px = (cx - v.x) / v.zoom;
      const py = (cy - v.y) / v.zoom;
      return { zoom: nz, x: cx - px * nz, y: cy - py * nz };
    });
  };

  const resetView = () => setView({ zoom: 1, x: 0, y: 0 });

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

  // ── DESKTOP: free canvas with pan & zoom ──
  return (
    <main className="floor-plan canvas-mode">
      {modal}
      <h1 className="print-title">Casamento — Seating Plan</h1>
      <div className="floor-plan-header">
        <h2>Sala</h2>
        <div className="floor-plan-tools">
          <div className="zoom-controls">
            <button className="zoom-btn" onClick={() => zoomBy(1 / 1.2)} title="Reduzir">−</button>
            <button className="zoom-level" onClick={resetView} title="Repor vista">{Math.round(view.zoom * 100)}%</button>
            <button className="zoom-btn" onClick={() => zoomBy(1.2)} title="Ampliar">+</button>
          </div>
          <button className="add-table-btn" onClick={() => setShowAddModal(true)}>+ Mesa</button>
        </div>
      </div>
      <div
        ref={viewportRef}
        className={`floor-plan-viewport${panning ? ' panning' : ''}`}
        onPointerDown={handleViewportPointerDown}
      >
        <div
          className="floor-plan-canvas"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
        >
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
      </div>
    </main>
  );
}
