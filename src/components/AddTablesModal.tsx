import { useState } from 'react';
import Stepper from './Stepper';
import TableSizeFields from './TableSizeFields';
import { DEFAULT_DIMS, type TableDims } from '../store';

interface Props {
  onConfirm: (count: number, shape: 'rectangular' | 'circular', seatCount: number, dims: TableDims) => void;
  onClose: () => void;
}

export default function AddTablesModal({ onConfirm, onClose }: Props) {
  const [count, setCount] = useState(1);
  const [shape, setShape] = useState<'rectangular' | 'circular'>('rectangular');
  const [seatCount, setSeatCount] = useState(8);
  const [dims, setDims] = useState<TableDims>(DEFAULT_DIMS);
  const [submitted, setSubmitted] = useState(false);

  const handleConfirm = () => {
    if (submitted) return;
    setSubmitted(true);
    onConfirm(count, shape, seatCount, dims);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Adicionar mesas</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label className="modal-label">Quantas mesas</label>
            <Stepper value={count} min={1} max={50} onChange={setCount} />
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
            <label className="modal-label">Lugares por mesa</label>
            <Stepper value={seatCount} min={1} max={20} onChange={setSeatCount} />
          </div>

          <TableSizeFields shape={shape} dims={dims} onChange={p => setDims(d => ({ ...d, ...p }))} />
        </div>

        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>Cancelar</button>
          <button className="modal-btn confirm" onClick={handleConfirm}>
            Adicionar {count > 1 ? `${count} mesas` : 'mesa'}
          </button>
        </div>
      </div>
    </div>
  );
}
