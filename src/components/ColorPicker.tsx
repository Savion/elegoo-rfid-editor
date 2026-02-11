import { useState, useEffect } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { getManufacturerNames, getMaterialsForManufacturer, getColorsForMaterial } from '../lib/manufacturerColors';

// Centauri Carbon 2 Combo preset colors (4 rows x 6 columns)
const PRESET_COLORS: { name: string; hex: string }[][] = [
  // Row 1: Mixed
  [
    { name: 'Light Gray', hex: '#D3D3D3' },
    { name: 'Yellow Green', hex: '#CCCC00' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Lime', hex: '#AAFF00' },
    { name: 'Forest Green', hex: '#228B22' },
    { name: 'Royal Blue', hex: '#2979FF' },
  ],
  // Row 2: Cool tones
  [
    { name: 'Green', hex: '#00CC00' },
    { name: 'Teal', hex: '#00CCAA' },
    { name: 'Sky Blue', hex: '#3399FF' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Purple', hex: '#7B2FBE' },
  ],
  // Row 3: Warm tones
  [
    { name: 'Magenta', hex: '#CC00CC' },
    { name: 'Lavender', hex: '#D8AAEE' },
    { name: 'Coral', hex: '#FF8080' },
    { name: 'Red Orange', hex: '#FF6633' },
    { name: 'Amber', hex: '#CC9900' },
    { name: 'Orange', hex: '#FFA500' },
  ],
  // Row 4: Neutrals
  [
    { name: 'Snow', hex: '#F0F0F0' },
    { name: 'Ivory', hex: '#F5F5DC' },
    { name: 'Gold', hex: '#DAA520' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#000000' },
  ],
];

interface ColorPickerProps {
  value: { r: number; g: number; b: number };
  onChange: (color: { r: number; g: number; b: number }) => void;
  onCatalogSelect?: (catalogMaterial: string) => void;
}

export function ColorPicker({ value, onChange, onCatalogSelect }: ColorPickerProps) {
  const hexColor = `#${value.r.toString(16).padStart(2, '0')}${value.g.toString(16).padStart(2, '0')}${value.b.toString(16).padStart(2, '0')}`;
  const [hexInput, setHexInput] = useState(hexColor.toUpperCase());
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState(getManufacturerNames()[0]);
  const [selectedMaterial, setSelectedMaterial] = useState(getMaterialsForManufacturer(getManufacturerNames()[0])[0]);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

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
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
        <CheckCircle2 size={12} className="text-green-600" />
        Filament Color
        <span className="text-[10px] text-green-600">(Used by printer)</span>
      </label>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="color"
          value={hexColor}
          onChange={(e) => handleHexChange(e.target.value)}
          className="w-16 h-8 rounded-md cursor-pointer border-2 border-gray-300"
        />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#FF0000"
          className="flex-1 min-w-[100px] px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-elegoo-orange focus:border-transparent font-mono uppercase"
          maxLength={7}
        />
        <div className="flex gap-1.5 text-[11px] text-gray-500 whitespace-nowrap">
          <span>R:{value.r}</span>
          <span>G:{value.g}</span>
          <span>B:{value.b}</span>
        </div>
      </div>
      {/* Preset color swatches */}
      <div className="mt-2 border border-gray-200 rounded-md">
        <button
          onClick={() => setPresetsOpen(!presetsOpen)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] text-gray-500 hover:text-gray-700"
        >
          <span>Printer Presets</span>
          {presetsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {presetsOpen && (
          <div className="px-2 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.flat().map((preset) => (
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
          </div>
        )}
      </div>
      {/* Manufacturer color catalog */}
      <div className="mt-2 border border-gray-200 rounded-md">
        <button
          onClick={() => setCatalogOpen(!catalogOpen)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] text-gray-500 hover:text-gray-700"
        >
          <span>Filament Color Catalog</span>
          {catalogOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {catalogOpen && (
          <div className="px-2 pb-2 space-y-1.5">
            <div className="flex gap-1.5">
              <select
                value={selectedManufacturer}
                onChange={(e) => {
                  setSelectedManufacturer(e.target.value);
                  setSelectedMaterial(getMaterialsForManufacturer(e.target.value)[0]);
                }}
                className="flex-1 text-xs px-1.5 py-1 border border-gray-300 rounded-md"
              >
                {getManufacturerNames().map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="flex-1 text-xs px-1.5 py-1 border border-gray-300 rounded-md"
              >
                {getMaterialsForManufacturer(selectedManufacturer).map((mat) => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {getColorsForMaterial(selectedManufacturer, selectedMaterial).map((color) => (
                <button
                  key={color.hex + color.name}
                  title={`${color.name} (${color.hex})`}
                  onClick={() => {
                    handlePresetClick(color.hex);
                    onCatalogSelect?.(selectedMaterial);
                  }}
                  onMouseEnter={() => setHoveredColor(color.name)}
                  onMouseLeave={() => setHoveredColor(null)}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    isSelected(color.hex)
                      ? 'border-elegoo-orange ring-2 ring-elegoo-orange ring-offset-1'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 h-4">
              {hoveredColor ?? '\u00A0'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
