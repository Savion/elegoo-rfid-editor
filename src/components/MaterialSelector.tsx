import { getAllMaterials } from '../lib/materials';

interface MaterialSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MaterialSelector({ value, onChange }: MaterialSelectorProps) {
  const materials = getAllMaterials();

  return (
    <div>
      <label className="text-xs font-medium text-gray-700 mb-1">
        Material
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-elegoo-orange focus:border-transparent"
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
