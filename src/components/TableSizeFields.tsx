import MeasureInput from './MeasureInput';
import type { TableDims } from '../store';

interface Props {
  shape: 'rectangular' | 'circular';
  dims: TableDims;
  onChange: (partial: Partial<TableDims>) => void;
}

export default function TableSizeFields({ shape, dims, onChange }: Props) {
  return (
    <div className="modal-field">
      <label className="modal-label">Tamanho</label>
      {shape === 'rectangular' ? (
        <div className="measure-row">
          <MeasureInput label="Comprimento" value={dims.lengthM} min={0.5} max={12} onChange={v => onChange({ lengthM: v })} />
          <MeasureInput label="Largura" value={dims.widthM} min={0.5} max={12} onChange={v => onChange({ widthM: v })} />
        </div>
      ) : (
        <MeasureInput label="Diâmetro" value={dims.diameterM} min={0.5} max={12} onChange={v => onChange({ diameterM: v })} />
      )}
    </div>
  );
}
