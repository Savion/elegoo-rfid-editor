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
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
        <CheckCircle2 size={12} className="text-green-600" />
        Material
        <span className="text-[10px] text-green-600">(Used by printer)</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-elegoo-orange focus:border-transparent"
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
