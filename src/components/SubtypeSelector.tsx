import { getSubtypesForMaterial } from '../lib/materials';
import { CheckCircle2 } from 'lucide-react';

interface SubtypeSelectorProps {
  material: string;
  value: string;
  onChange: (value: string) => void;
}

export function SubtypeSelector({ material, value, onChange }: SubtypeSelectorProps) {
  const subtypes = getSubtypesForMaterial(material);

  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
        <CheckCircle2 size={12} className="text-green-600" />
        Supplement
        <span className="text-[10px] text-green-600">(Used by printer)</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-elegoo-orange focus:border-transparent"
      >
        {subtypes.map((subtype) => (
          <option key={subtype} value={subtype}>
            {subtype}
          </option>
        ))}
      </select>
    </div>
  );
}
