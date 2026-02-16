import { useState } from 'react';

interface HexEditorProps {
  data: Uint8Array;
}

export function HexEditor({ data }: HexEditorProps) {
  const [bytesPerPage, setBytesPerPage] = useState<number>(4);

  const getDescriptionForPage = (page: number): string => {
    // Page 3: Capability Container (Capability Container typically at page 3)
    if (page === 3) return 'Capability Container';
    // NDEF / URI pages (4-15)
    if (page === 4) return 'NDEF TLV / Structure';
    if (page === 5) return 'NDEF Message Header';
    if (page === 6) return 'NDEF Record (URI, prefix https://)';
    if (page >= 7 && page <= 9) return 'Marketing URL / URI payload';
    if (page >= 10 && page <= 15) return 'Reserved for URI';

    // Filament / printer section (pages 16+)
    if (page === 16) return 'Header (filament section start)';
    if (page === 17) return 'Manufacturer ID';
    if (page === 18) return 'Material Type';
    if (page === 19) return 'Material Position';
    if (page === 20) return 'Color Code';
    if (page === 21) return 'Extruder Temp Min/Max';
    if (page === 23) return 'Diameter / Weight';
    // Page 24: reserved 64-bit block (starting at offset 0x63) per Elegoo spec
    if (page === 24) return 'Production / Reserved (64-bit block starting at 0x63)';

    // Tag configuration / password pages (common NTAG area)
    if (page === 40) return 'Dynamic Lock Bytes / RFUI';
    if (page === 41) return 'CFG0';
    if (page === 42) return 'CFG1';
    if (page === 43) return 'PWD';
    if (page === 44) return 'PACK / RFUI';

    // Config/password area
    if (page >= 160 && page <= 175) return 'Config/Password';

    // UID / checksums (first pages)
    if (page === 2) return 'UID / BCC1 Checksum';
    if (page >= 0 && page <= 1) return 'UID / Serial';

    return '';
  };

  const getFieldDescriptionByOffset = (offset: number): string => {
    if (offset < 0x09) return 'UID / Serial';
    if (offset === 0x09) return 'BCC1 Checksum';
    if (offset >= 0x1C && offset <= 0x25) return 'Marketing URL';
    if (offset === 0x40) return 'Header';
    if (offset >= 0x41 && offset <= 0x44) return 'Manufacturer Code';
    if (offset >= 0x45 && offset <= 0x46) return 'Filament Code';
    if (offset >= 0x48 && offset <= 0x4B) return 'Material Name';
    if (offset >= 0x4C && offset <= 0x4D) return 'Material Supplement';
    if (offset >= 0x50 && offset <= 0x52) return 'Color Code';
    if (offset === 0x53) return 'Color Modifier';
    if (offset === 0x54 || offset === 0x55) return 'Min Temp';
    if (offset === 0x56 || offset === 0x57) return 'Max Temp';
    if (offset === 0x5C || offset === 0x5D) return 'Filament Diameter';
    if (offset === 0x5E || offset === 0x5F) return 'Filament Weight';
    if (offset === 0x60 || offset === 0x61) return 'Production Date';
    if (offset >= 0xA0 && offset <= 0xAF) return 'Config/Password';
    // Elegoo spec: 64-bit reserved block starting at 0x63 (note: covers offsets 0x63..0x6A)
    if (offset >= 0x63 && offset <= 0x6A) return 'Reserved (64-bit block)';
    return '';
  };

  const getRowColor = (offset: number): string => {
    // More distinct colors to avoid overlap
    if (offset < 0x09) return 'bg-gray-100'; // UID
    if (offset === 0x09) return 'bg-stone-100'; // BCC
    if (offset >= 0x1C && offset <= 0x25) return 'bg-rose-50'; // Marketing URL
    if (offset === 0x40) return 'bg-cyan-200'; // Header (more visible)
    if (offset >= 0x41 && offset <= 0x44) return 'bg-indigo-100'; // Manufacturer
    if (offset >= 0x45 && offset <= 0x46) return 'bg-yellow-50'; // Filament Code
    if (offset >= 0x48 && offset <= 0x4B) return 'bg-orange-50'; // Material Name
    if (offset >= 0x4C && offset <= 0x4D) return 'bg-amber-50'; // Material Supplement
    if (offset >= 0x50 && offset <= 0x52) return 'bg-green-50'; // Color Code
    if (offset === 0x53) return 'bg-lime-50'; // Color Modifier
    if (offset === 0x54 || offset === 0x55) return 'bg-sky-50'; // Min Temp
    if (offset === 0x56 || offset === 0x57) return 'bg-blue-100'; // Max Temp
    if (offset === 0x5C || offset === 0x5D) return 'bg-rose-100'; // Filament Diameter (distinct)
    if (offset === 0x5E || offset === 0x5F) return 'bg-fuchsia-100'; // Filament Weight (distinct)
    if (offset === 0x60 || offset === 0x61) return 'bg-purple-100'; // Production Date
    if (offset >= 0x63 && offset <= 0x6A) return 'bg-red-50'; // Reserved block
    if (offset >= 0xA0 && offset <= 0xAF) return 'bg-fuchsia-50'; // Config/Password
    return '';
  };

  const totalPages = Math.ceil(data.length / bytesPerPage);

  const renderPageRow = (pageIndex: number) => {
    const start = pageIndex * bytesPerPage;
    const end = Math.min(start + bytesPerPage, data.length);
    const bytes = Array.from(data.slice(start, end));

    const hexBytes = bytes.map((b) => b.toString(16).padStart(2, '0').toUpperCase());
    const decBytes = bytes.map((b) => b.toString(10));
    const asciiChars = bytes.map((b) => (b > 31 && b < 127 ? String.fromCharCode(b) : '.'));

    // Also show per-byte descriptions grouped within the page
    const groups: Record<string, number[]> = {};
    for (let i = start; i < end; i++) {
      const d = getFieldDescriptionByOffset(i);
      if (d) {
        if (!groups[d]) groups[d] = [];
        groups[d].push(i);
      }
    }

    const formatOffsetsForDesc = (offsets: number[]) => {
      if (!offsets || offsets.length === 0) return '';
      offsets.sort((a, b) => a - b);
      const ranges: string[] = [];
      let rangeStart = offsets[0];
      let prev = offsets[0];
      for (let j = 1; j < offsets.length; j++) {
        const cur = offsets[j];
        if (cur === prev + 1) {
          prev = cur;
        } else {
          if (rangeStart === prev) {
            ranges.push(`0x${rangeStart.toString(16).padStart(2, '0').toUpperCase()}`);
          } else {
            ranges.push(
              `0x${rangeStart.toString(16).padStart(2, '0').toUpperCase()}-0x${prev
                .toString(16)
                .padStart(2, '0')
                .toUpperCase()}`
            );
          }
          rangeStart = cur;
          prev = cur;
        }
      }
      // push last
      if (rangeStart === prev) {
        ranges.push(`0x${rangeStart.toString(16).padStart(2, '0').toUpperCase()}`);
      } else {
        ranges.push(
          `0x${rangeStart.toString(16).padStart(2, '0').toUpperCase()}-0x${prev
            .toString(16)
            .padStart(2, '0')
            .toUpperCase()}`
        );
      }
      return ranges.join(', ');
    };

    const perByteDescriptions = Object.entries(groups).map(([desc, offs]) => `${desc} (${formatOffsetsForDesc(offs)})`);

    // Description logic: prefer per-byte grouped descriptions when available to avoid
    // repeating a generic page-level description (prevents duplicates like
    // "Color Code; Color Code (0x50-0x52)"). If no per-byte groups exist, fall back
    // to the page-level description.
    const pageNumber = pageIndex;
    const pageDesc = getDescriptionForPage(pageNumber);
    const descriptions = perByteDescriptions.length > 0 ? perByteDescriptions : pageDesc ? [pageDesc] : [];

    // helper stub retained for future use (re-mapping removed per request)

    // build a map of offset -> color class for bytes that belong to a named group
    const offsetColorMap: Record<number, string> = {};
    Object.entries(groups).forEach(([_, offs]) => {
      const cls = getRowColor(offs[0]) || '';
      offs.forEach((o) => (offsetColorMap[o] = cls));
    });

    return (
      <tr key={pageIndex} className={`border-b hover:bg-gray-50`}>
        <td className="px-3 py-1 text-gray-600">Page {pageIndex}</td>
        <td className="px-3 py-1 text-gray-600">0x{start.toString(16).padStart(2, '0').toUpperCase()}</td>
        <td className="px-3 py-1 font-bold whitespace-nowrap">
          {hexBytes.map((hb, i) => {
            const off = start + i;
            const baseCls = offsetColorMap[off] || '';
            const extra = '';
            return (
              <span
                key={i}
                title={`0x${off.toString(16).padStart(2, '0').toUpperCase()}: ${getFieldDescriptionByOffset(off) || (pageDesc || '')}`}
                className={`inline-block w-8 text-center ${baseCls} ${extra}`}
              >
                {hb}
              </span>
            );
          })}
        </td>
        <td className="px-3 py-1 whitespace-nowrap">
          {decBytes.map((db, i) => {
            const off = start + i;
            const baseCls = offsetColorMap[off] || '';
            const extra = '';
            return (
              <span
                key={i}
                title={`0x${off.toString(16).padStart(2, '0').toUpperCase()}: ${getFieldDescriptionByOffset(off) || (pageDesc || '')}`}
                className={`inline-block w-8 text-center ${baseCls} ${extra}`}
              >
                {db.padStart(3, ' ')}
              </span>
            );
          })}
        </td>
        <td className="px-3 py-1 text-gray-600 whitespace-nowrap">
          {asciiChars.map((ch, i) => {
            const off = start + i;
            const baseCls = offsetColorMap[off] || '';
            const extra = '';
            return (
              <span
                key={i}
                title={`0x${off.toString(16).padStart(2, '0').toUpperCase()}: ${getFieldDescriptionByOffset(off) || (pageDesc || '')}`}
                className={`inline-block w-6 text-center ${baseCls} ${extra}`}
              >
                {ch}
              </span>
            );
          })}
        </td>
        <td className="px-3 py-1 text-gray-700 italic">
          {/* Render per-byte groups with their corresponding color, or fallback to page description */}
          {perByteDescriptions.length > 0 ? (
            Object.entries(groups).map(([desc, offs], idx) => {
              const cls = getRowColor(offs[0]) || '';
              const label = `${desc} (${formatOffsetsForDesc(offs)})`;
              return (
                <span key={idx} className={`${cls} px-1 inline-block mr-2`} title={label}>
                  {label}
                </span>
              );
            })
          ) : pageDesc ? (
            <span className={`${getRowColor(start) || ''} px-1 inline-block`}>{pageDesc}</span>
          ) : null}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-20">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Hex Editor (Read-Only)</h2>

      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-2 text-sm">
          <label>Bytes per page:</label>
          <select
            value={bytesPerPage}
            onChange={(e) => setBytesPerPage(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={16}>16</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span>Pages: {totalPages}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-3 py-2 text-left">Page</th>
              <th className="px-3 py-2 text-left">Offset</th>
              <th className="px-3 py-2 text-left">Hex</th>
              <th className="px-3 py-2 text-left">Dec</th>
              <th className="px-3 py-2 text-left">ASCII</th>
              <th className="px-3 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: totalPages }).map((_, pageIndex) => renderPageRow(pageIndex))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-50 border border-yellow-200"></div>
          <span>Filament Code</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-50 border border-orange-200"></div>
          <span>Material Name</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-50 border border-amber-200"></div>
          <span>Material Supplement</span>
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
