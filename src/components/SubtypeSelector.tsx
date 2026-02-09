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
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <CheckCircle2 size={16} className="text-green-600" />
        Supplement
        <span className="text-xs text-green-600">(Used by printer)</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elegoo-orange focus:border-transparent"
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
