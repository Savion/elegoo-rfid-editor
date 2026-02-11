import { getSubtypesForMaterial } from '../lib/materials';

interface SubtypeSelectorProps {
  material: string;
  value: string;
  onChange: (value: string) => void;
}

export function SubtypeSelector({ material, value, onChange }: SubtypeSelectorProps) {
  const subtypes = getSubtypesForMaterial(material);

  return (
    <div>
      <label className="text-xs font-medium text-gray-700 mb-1">
        Supplement
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-elegoo-orange focus:border-transparent"
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
