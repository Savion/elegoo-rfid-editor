import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ColorPickerProps {
  value: { r: number; g: number; b: number };
  onChange: (color: { r: number; g: number; b: number }) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const hexColor = `#${value.r.toString(16).padStart(2, '0')}${value.g.toString(16).padStart(2, '0')}${value.b.toString(16).padStart(2, '0')}`;
  const [hexInput, setHexInput] = useState(hexColor.toUpperCase());

  // Update local input when parent value changes (e.g., from color picker)
  useEffect(() => {
    setHexInput(hexColor.toUpperCase());
  }, [hexColor]);

  const handleHexChange = (hex: string) => {
    // Allow user to type freely
    setHexInput(hex.toUpperCase());

    // Only update parent when we have a valid 6-character hex code
    const cleaned = hex.replace('#', '');
    if (cleaned.length === 6 && /^[0-9A-Fa-f]{6}$/.test(cleaned)) {
      const r = parseInt(cleaned.substring(0, 2), 16);
      const g = parseInt(cleaned.substring(2, 4), 16);
      const b = parseInt(cleaned.substring(4, 6), 16);
      onChange({ r, g, b });
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
          value={hexInput}
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
