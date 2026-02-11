import { Info } from 'lucide-react';

interface MetadataFieldsProps {
  weight: number;
  diameter: number;
  minTemp: number;
  maxTemp: number;
  onChange: (field: string, value: number | string) => void;
}

export function MetadataFields({
  weight,
  diameter,
  minTemp,
  maxTemp,
  onChange,
}: MetadataFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-500 italic mb-1">
            <Info size={12} />
            Weight (g)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => onChange('weight', parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            min="0"
            max="10000"
          />
        </div>

        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-500 italic mb-1">
            <Info size={12} />
            Diameter (mm)
          </label>
          <input
            type="number"
            value={diameter / 100}
            onChange={(e) => onChange('diameter', Math.round((parseFloat(e.target.value) || 0) * 100))}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            min="1.00"
            max="5.00"
            step="0.01"
            placeholder="1.75"
          />
        </div>

        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-500 italic mb-1">
            <Info size={12} />
            Min Temp (°C)
          </label>
          <input
            type="number"
            value={minTemp}
            onChange={(e) => onChange('minTemp', parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            min="0"
            max="400"
          />
        </div>

        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-500 italic mb-1">
            <Info size={12} />
            Max Temp (°C)
          </label>
          <input
            type="number"
            value={maxTemp}
            onChange={(e) => onChange('maxTemp', parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            min="0"
            max="400"
          />
        </div>
      </div>
    </div>
  );
}
