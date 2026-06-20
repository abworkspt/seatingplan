import { useState, useEffect } from 'react';

interface Props {
  onConfirm: (count: number, shape: 'rectangular' | 'circular', seatCount: number) => void;
  onClose: () => void;
}

function Stepper({ value, min, max, onChange }: {
  value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  // Hold the raw text locally so the field can be cleared / multi-digit typed.
  // Commit (clamp) happens on blur or Enter, not on every keystroke.
  const [text, setText] = useState(String(value));
  useEffect(() => { setText(String(value)); }, [value]);

  const commit = () => {
    const v = parseInt(text, 10);
    const clamped = isNaN(v) ? min : Math.max(min, Math.min(max, v));
    onChange(clamped);
    setText(String(clamped));
  };

  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >−</button>
      <input
        className="stepper-value"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={text}
        onChange={e => {
          const raw = e.target.value;
          setText(raw);
          const v = parseInt(raw, 10);
          // Push the live value up (clamped on blur and again in the reducer) so
          // confirming without blurring never reads a stale value.
          if (!isNaN(v)) onChange(v);
        }}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); }}
      />
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >+</button>
    </div>
  );
}

export default function AddTablesModal({ onConfirm, onClose }: Props) {
  const [count, setCount] = useState(1);
  const [shape, setShape] = useState<'rectangular' | 'circular'>('rectangular');
  const [seatCount, setSeatCount] = useState(8);
  const [submitted, setSubmitted] = useState(false);

  const handleConfirm = () => {
    if (submitted) return;
    setSubmitted(true);
    onConfirm(count, shape, seatCount);
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
