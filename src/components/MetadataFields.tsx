import { Info, Calendar } from 'lucide-react';

interface MetadataFieldsProps {
  weight: number;
  diameter: number;
  minTemp: number;
  maxTemp: number;
  productionDate: string;
  modifier: string;
  onChange: (field: string, value: number | string) => void;
}

export function MetadataFields({
  weight,
  diameter,
  minTemp,
  maxTemp,
  productionDate,
  modifier,
  onChange,
}: MetadataFieldsProps) {
  const setCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear() - 2000;
    const month = now.getMonth() + 1;
    const dateStr = `${year.toString().padStart(2, '0')}${month.toString().padStart(2, '0')}`;
    onChange('productionDate', dateStr);
  };

  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-[11px] text-amber-800">
        <div className="flex items-center gap-1.5">
          <Info size={12} className="flex-shrink-0" />
          <span>Metadata only — not used by the printer.</span>
        </div>
      </div>

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
            Diameter (×100)
          </label>
          <input
            type="number"
            value={diameter}
            onChange={(e) => onChange('diameter', parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            min="100"
            max="500"
            placeholder="175"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-500 italic mb-1">
            <Info size={12} />
            Prod Date (YYMM)
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={productionDate}
              onChange={(e) => onChange('productionDate', e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent font-mono"
              maxLength={4}
              placeholder="2602"
            />
            <button
              onClick={setCurrentDate}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors flex-shrink-0"
              title="Set to current month"
            >
              <Calendar size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-500 italic mb-1">
            <Info size={12} />
            Modifier
          </label>
          <input
            type="text"
            value={modifier}
            onChange={(e) => onChange('modifier', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent font-mono"
            maxLength={1}
            placeholder="M"
          />
        </div>
      </div>
    </div>
  );
}
