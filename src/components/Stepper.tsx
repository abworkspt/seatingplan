import { useState, useEffect } from 'react';

interface Props {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

// Number input with +/- buttons. Holds raw text locally so the field can be
// cleared / multi-digit typed; clamping happens on blur or Enter, not per keystroke.
export default function Stepper({ value, min, max, onChange }: Props) {
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
