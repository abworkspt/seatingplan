import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Stepper from './Stepper';
import TableSizeFields from './TableSizeFields';
import type { Table, TableDims } from '../store';

interface Props {
  table: Table;
  anchorEl: HTMLElement | null; // when set, render as a popover next to this table element
  onSave: (label: string, shape: 'rectangular' | 'circular', seatCount: number, dims: TableDims) => void;
  onClose: () => void;
}

export default function EditTableModal({ table, anchorEl, onSave, onClose }: Props) {
  const [label, setLabel] = useState(table.label);
  const [shape, setShape] = useState<'rectangular' | 'circular'>(table.shape);
  const [seatCount, setSeatCount] = useState(table.seats.length);
  const [dims, setDims] = useState<TableDims>({
    lengthM: table.lengthM,
    widthM: table.widthM,
    diameterM: table.diameterM,
  });
  const [saved, setSaved] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Place the popover beside the live table element, clamped to the viewport.
  // Reads the element fresh each time so a resize/reflow re-anchors correctly.
  const reposition = useCallback(() => {
    const el = cardRef.current;
    if (!anchorEl || !el) return;
    const a = anchorEl.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const gap = 12;
    const m = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = a.right + gap;                  // prefer to the right of the table
    if (left + w > vw - m) left = a.left - gap - w; // otherwise to the left
    left = Math.max(m, Math.min(left, vw - w - m));
    const top = Math.max(m, Math.min(a.top, vh - h - m));
    setPos({ top, left });
  }, [anchorEl]);

  useLayoutEffect(() => { reposition(); }, [reposition, shape, seatCount]);

  // Keep the popover anchored when the viewport changes while it is open.
  useEffect(() => {
    if (!anchorEl) return;
    const onResize = () => reposition();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [anchorEl, reposition]);

  // How many seated guests would be removed if the table shrinks
  const removedOccupied = table.seats.slice(seatCount).filter(Boolean).length;

  const handleSave = () => {
    if (saved) return;
    setSaved(true);
    onSave(label.trim() || table.label, shape, seatCount, dims);
    onClose();
  };

  const body = (
    <>
      <div className="modal-header">
        <span className="modal-title">Editar mesa</span>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>

      <div className="modal-body">
        <div className="modal-field">
          <label className="modal-label">Nome</label>
          <input
            className="modal-text-input"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            placeholder="Nome da mesa"
            autoFocus
          />
        </div>

        <div className="modal-field">
          <label className="modal-label">Formato</label>
          <div className="shape-options">
            <button
              type="button"
              className={`shape-option ${shape === 'rectangular' ? 'active' : ''}`}
              onClick={() => setShape('rectangular')}
            >
              <span className="shape-icon rect-icon" />
              Rectangular
            </button>
            <button
              type="button"
              className={`shape-option ${shape === 'circular' ? 'active' : ''}`}
              onClick={() => setShape('circular')}
            >
              <span className="shape-icon circ-icon" />
              Redonda
            </button>
          </div>
        </div>

        <div className="modal-field">
          <label className="modal-label">Lugares</label>
          <Stepper value={seatCount} min={1} max={20} onChange={setSeatCount} />
          {removedOccupied > 0 && (
            <span className="modal-warning">
              ⚠ {removedOccupied} convidado{removedOccupied > 1 ? 's serão retirados' : ' será retirado'} dos lugares removidos
            </span>
          )}
        </div>

        <TableSizeFields shape={shape} dims={dims} onChange={p => setDims(d => ({ ...d, ...p }))} />
      </div>

      <div className="modal-footer">
        <button className="modal-btn cancel" onClick={onClose}>Cancelar</button>
        <button className="modal-btn confirm" onClick={handleSave}>Guardar</button>
      </div>
    </>
  );

  // Portal to <body> so the popover escapes the canvas's CSS transform
  // (a transformed ancestor would otherwise make position:fixed resolve to it).
  if (anchorEl) {
    // Anchored popover (desktop canvas) — no dimming backdrop, just a click-catcher.
    const a = anchorEl.getBoundingClientRect();
    const style: React.CSSProperties = pos
      ? { top: pos.top, left: pos.left }
      : { top: a.top, left: a.right + 12, visibility: 'hidden' };
    return createPortal(
      <>
        <div className="popover-catcher" onClick={onClose} />
        <div ref={cardRef} className="modal-card popover" style={style} onClick={e => e.stopPropagation()}>
          {body}
        </div>
      </>,
      document.body
    );
  }

  // Centered fallback (mobile)
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {body}
      </div>
    </div>,
    document.body
  );
}
