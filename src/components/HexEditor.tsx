interface HexEditorProps {
  data: Uint8Array;
}

export function HexEditor({ data }: HexEditorProps) {
  const getFieldDescription = (offset: number): string => {
    if (offset < 0x09) return 'UID / Serial';
    if (offset === 0x09) return 'BCC1 Checksum';
    if (offset >= 0x1C && offset <= 0x25) return 'Marketing URL';
    if (offset === 0x40) return 'Header (EPC-256)';
    if (offset >= 0x41 && offset <= 0x44) return 'Manufacturer Code';
    if (offset >= 0x48 && offset <= 0x4B) return 'Material (Main)';
    if (offset >= 0x4C && offset <= 0x4D) return 'Material (Subtype)';
    if (offset >= 0x50 && offset <= 0x52) return 'Color Code (RGB)';
    if (offset === 0x53) return 'Color Modifier';
    if (offset === 0x54 || offset === 0x55) return 'Min Temp';
    if (offset === 0x56 || offset === 0x57) return 'Max Temp';
    if (offset === 0x5C || offset === 0x5D) return 'Diameter';
    if (offset === 0x5E || offset === 0x5F) return 'Weight (g)';
    if (offset === 0x60 || offset === 0x61) return 'Production Date';
    if (offset >= 0xA0 && offset <= 0xAF) return 'Config/Password';
    return '';
  };

  const getRowColor = (offset: number): string => {
    if (offset >= 0x48 && offset <= 0x4B) return 'bg-orange-50';
    if (offset >= 0x4C && offset <= 0x4D) return 'bg-amber-50';
    if (offset >= 0x50 && offset <= 0x52) return 'bg-green-50';
    if (
      (offset >= 0x54 && offset <= 0x57) ||
      (offset >= 0x5C && offset <= 0x5F)
    )
      return 'bg-blue-50';
    if (offset >= 0x60 && offset <= 0x61) return 'bg-purple-50';
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-20">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Hex Editor (Read-Only)</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-3 py-2 text-left">Offset</th>
              <th className="px-3 py-2 text-left">Hex</th>
              <th className="px-3 py-2 text-left">Dec</th>
              <th className="px-3 py-2 text-left">ASCII</th>
              <th className="px-3 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(data).map((byte, index) => {
              const desc = getFieldDescription(index);
              const rowColor = getRowColor(index);
              const ascii =
                byte > 31 && byte < 127 ? String.fromCharCode(byte) : '.';

              return (
                <tr
                  key={index}
                  className={`border-b hover:bg-gray-50 ${rowColor}`}
                >
                  <td className="px-3 py-1 text-gray-600">
                    0x{index.toString(16).padStart(2, '0').toUpperCase()}
                  </td>
                  <td className="px-3 py-1 font-bold">
                    {byte.toString(16).padStart(2, '0').toUpperCase()}
                  </td>
                  <td className="px-3 py-1">{byte}</td>
                  <td className="px-3 py-1 text-gray-600">{ascii}</td>
                  <td className="px-3 py-1 text-gray-700 italic">{desc}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-50 border border-orange-200"></div>
          <span>Material</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-50 border border-amber-200"></div>
          <span>Subtype</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200"></div>
          <span>Color</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border border-blue-200"></div>
          <span>Physical Properties</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-50 border border-purple-200"></div>
          <span>Production Date</span>
        </div>
      </div>
    </div>
  );
}
