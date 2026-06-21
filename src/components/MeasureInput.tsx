import { useState, useEffect } from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

// Decimal number field in metres. Accepts comma or dot; clamps on blur/Enter.
export default function MeasureInput({ label, value, min, max, onChange }: Props) {
  const [text, setText] = useState(String(value));
  useEffect(() => { setText(String(value)); }, [value]);

  const commit = () => {
    const v = parseFloat(text.replace(',', '.'));
    const clamped = isNaN(v) ? value : Math.max(min, Math.min(max, v));
    onChange(clamped);
    setText(String(clamped));
  };

  return (
    <label className="measure-field">
      <span className="measure-label">{label}</span>
      <span className="measure-input-wrap">
        <input
          className="measure-input"
          inputMode="decimal"
          value={text}
          onChange={e => {
            const raw = e.target.value;
            setText(raw);
            const v = parseFloat(raw.replace(',', '.'));
            // Push live value up (clamped on blur + in the reducer) so confirming
            // without blurring first never reads a stale value.
            if (!isNaN(v)) onChange(v);
          }}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); }}
        />
        <span className="measure-unit">m</span>
      </span>
    </label>
  );
}
