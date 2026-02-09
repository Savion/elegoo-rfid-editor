import { CheckCircle2 } from 'lucide-react';

interface ColorPickerProps {
  value: { r: number; g: number; b: number };
  onChange: (color: { r: number; g: number; b: number }) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const hexColor = `#${value.r.toString(16).padStart(2, '0')}${value.g.toString(16).padStart(2, '0')}${value.b.toString(16).padStart(2, '0')}`;

  const handleHexChange = (hex: string) => {
    const cleaned = hex.replace('#', '');
    if (cleaned.length === 6) {
      const r = parseInt(cleaned.substring(0, 2), 16);
      const g = parseInt(cleaned.substring(2, 4), 16);
      const b = parseInt(cleaned.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        onChange({ r, g, b });
      }
    }
  };

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <CheckCircle2 size={16} className="text-green-600" />
        Filament Color
        <span className="text-xs text-green-600">(Used by printer)</span>
      </label>
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="color"
          value={hexColor}
          onChange={(e) => handleHexChange(e.target.value)}
          className="w-20 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
        />
        <input
          type="text"
          value={hexColor.toUpperCase()}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#FF0000"
          className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elegoo-orange focus:border-transparent font-mono uppercase"
          maxLength={7}
        />
        <div className="flex gap-2 text-sm text-gray-600 whitespace-nowrap">
          <span>R: {value.r}</span>
          <span>G: {value.g}</span>
          <span>B: {value.b}</span>
        </div>
      </div>
    </div>
  );
}
