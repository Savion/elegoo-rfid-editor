import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

// Centauri Carbon 2 Combo preset colors (4 rows x 6 columns)
const PRESET_COLORS: { name: string; hex: string }[][] = [
  // Row 1: Mixed
  [
    { name: 'Royal Blue', hex: '#2979FF' },
    { name: 'Forest Green', hex: '#228B22' },
    { name: 'Lime', hex: '#AAFF00' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Yellow Green', hex: '#CCCC00' },
    { name: 'Light Gray', hex: '#D3D3D3' },
  ],
  // Row 2: Cool tones
  [
    { name: 'Purple', hex: '#7B2FBE' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Sky Blue', hex: '#3399FF' },
    { name: 'Teal', hex: '#00CCAA' },
    { name: 'Green', hex: '#00CC00' },
  ],
  // Row 3: Warm tones
  [
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Amber', hex: '#CC9900' },
    { name: 'Red Orange', hex: '#FF6633' },
    { name: 'Coral', hex: '#FF8080' },
    { name: 'Lavender', hex: '#D8AAEE' },
    { name: 'Magenta', hex: '#CC00CC' },
  ],
  // Row 4: Neutrals
  [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Gold', hex: '#DAA520' },
    { name: 'Ivory', hex: '#F5F5DC' },
    { name: 'Snow', hex: '#F0F0F0' },
  ],
];

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

  const handlePresetClick = (hex: string) => {
    handleHexChange(hex);
  };

  const isSelected = (hex: string) => hexColor.toUpperCase() === hex.toUpperCase();

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
      {/* Preset color swatches */}
      <div className="mt-3">
        <p className="text-xs text-gray-500 mb-2">Printer Presets</p>
        <div className="space-y-1.5">
          {PRESET_COLORS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1.5">
              {row.map((preset) => (
                <button
                  key={preset.hex + preset.name}
                  title={preset.name}
                  onClick={() => handlePresetClick(preset.hex)}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    isSelected(preset.hex)
                      ? 'border-elegoo-orange ring-2 ring-elegoo-orange ring-offset-1'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
