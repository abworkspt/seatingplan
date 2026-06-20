import { useState } from 'react';
import Stepper from './Stepper';
import type { Table } from '../store';

interface Props {
  table: Table;
  onSave: (label: string, shape: 'rectangular' | 'circular', seatCount: number) => void;
  onClose: () => void;
}

export default function EditTableModal({ table, onSave, onClose }: Props) {
  const [label, setLabel] = useState(table.label);
  const [shape, setShape] = useState<'rectangular' | 'circular'>(table.shape);
  const [seatCount, setSeatCount] = useState(table.seats.length);
  const [saved, setSaved] = useState(false);

  // How many seated guests would be removed if the table shrinks
  const removedOccupied = table.seats.slice(seatCount).filter(Boolean).length;

  const handleSave = () => {
    if (saved) return;
    setSaved(true);
    onSave(label.trim() || table.label, shape, seatCount);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
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
        </div>

        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>Cancelar</button>
          <button className="modal-btn confirm" onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}
