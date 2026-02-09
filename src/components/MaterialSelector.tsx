import { getAllMaterials } from '../lib/materials';
import { CheckCircle2 } from 'lucide-react';

interface MaterialSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MaterialSelector({ value, onChange }: MaterialSelectorProps) {
  const materials = getAllMaterials();

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <CheckCircle2 size={16} className="text-green-600" />
        Material
        <span className="text-xs text-green-600">(Used by printer)</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elegoo-orange focus:border-transparent"
      >
        {materials.map((material) => (
          <option key={material} value={material}>
            {material}
          </option>
        ))}
      </select>
    </div>
  );
}
