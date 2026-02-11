import { useState, useEffect } from 'react';
import { ElegooSpool } from './lib/ElegooSpool';
import { getSubtypesForMaterial, getMaterialForSubtype } from './lib/materials';
import { FileUpload } from './components/FileUpload';
import { MaterialSelector } from './components/MaterialSelector';
import { SubtypeSelector } from './components/SubtypeSelector';
import { ColorPicker } from './components/ColorPicker';
import { MetadataFields } from './components/MetadataFields';
import { ExportButtons } from './components/ExportButtons';
import { StatusBar } from './components/StatusBar';
import { Header } from './components/Header';
import { HexEditor } from './components/HexEditor';
import { NfcReaderWriter, isWebNfcSupported } from './components/NfcReaderWriter';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function App() {
  const [spool, setSpool] = useState<ElegooSpool | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Ready - No file loaded');
  const [showHexEditor, setShowHexEditor] = useState(false);
  const [nfcSupported] = useState(() => isWebNfcSupported());

  // Generate default filename based on subtype and color
  const generateDefaultFileName = (spoolData: ElegooSpool): string => {
    const subtype = spoolData.subtype;
    const color = spoolData.color;
    const hexColor = `${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`.toUpperCase();
    return `${subtype}_${hexColor}.bin`;
  };

  // Initialize with empty spool on first load
  useEffect(() => {
    const newSpool = new ElegooSpool();
    setSpool(newSpool);
    setStatusMessage('Ready - Use Generate New or Load File to begin');
  }, []);

  const handleFileLoad = (file: File, data: Uint8Array) => {
    const newSpool = new ElegooSpool(data);
    setSpool(newSpool);
    setFileName(file.name.replace('.bin', ''));
    setStatusMessage(`Loaded: ${file.name} (${data.length} bytes)`);
  };

  const handleGenerateNew = () => {
    const newSpool = new ElegooSpool();
    newSpool.generateNewIdentity();
    setSpool(newSpool);
    setFileName(generateDefaultFileName(newSpool).replace('.bin', ''));
    setStatusMessage('Generated new tag with random UID');
  };

  const handleSave = () => {
    if (!spool) return;

    const blob = spool.toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const saveName = fileName ? `${fileName}.bin` : generateDefaultFileName(spool);
    a.download = saveName;
    a.click();
    URL.revokeObjectURL(url);

    setStatusMessage(`Saved: ${saveName} (180 bytes)`);
  };

  const handleMaterialChange = (material: string) => {
    if (!spool) return;
    spool.material = material;

    // Set subtype to the base material type (first in the family)
    // This ensures the subtype code matches the new material family
    const subtypes = getSubtypesForMaterial(material);
    if (subtypes.length > 0) {
      spool.subtype = subtypes[0];
    }

    const newSpool = new ElegooSpool(spool.getRawData());
    setSpool(newSpool);
    setFileName(generateDefaultFileName(newSpool).replace('.bin', ''));
  };

  const handleSubtypeChange = (subtype: string) => {
    if (!spool) return;
    spool.subtype = subtype;
    const newSpool = new ElegooSpool(spool.getRawData());
    setSpool(newSpool);
    setFileName(generateDefaultFileName(newSpool).replace('.bin', ''));
  };

  const handleColorChange = (color: { r: number; g: number; b: number }) => {
    if (!spool) return;
    spool.color = color;
    const newSpool = new ElegooSpool(spool.getRawData());
    setSpool(newSpool);
    setFileName(generateDefaultFileName(newSpool).replace('.bin', ''));
  };

  const handleCatalogSelect = (catalogMaterial: string) => {
    if (!spool) return;

    // Map catalog material name (e.g. "PLA Matte") to parent material family (e.g. "PLA")
    const parentMaterial = getMaterialForSubtype(catalogMaterial);
    if (!parentMaterial) return;

    // Set material family
    spool.material = parentMaterial;
    // Set subtype to match the catalog material
    spool.subtype = catalogMaterial;

    const newSpool = new ElegooSpool(spool.getRawData());
    setSpool(newSpool);
    setFileName(generateDefaultFileName(newSpool).replace('.bin', ''));
  };

  const handleMetadataChange = (field: string, value: number | string) => {
    if (!spool) return;

    switch (field) {
      case 'weight':
        spool.weight = value as number;
        break;
      case 'diameter':
        spool.diameter = value as number;
        break;
      case 'minTemp':
        spool.minTemp = value as number;
        break;
      case 'maxTemp':
        spool.maxTemp = value as number;
        break;
      case 'productionDate':
        spool.productionDate = value as string;
        break;
      case 'modifier':
        spool.colorModifier = value as string;
        break;
    }

    setSpool(new ElegooSpool(spool.getRawData()));
  };

  const handleNfcTagRead = (data: Uint8Array) => {
    const newSpool = new ElegooSpool(data);
    setSpool(newSpool);
    setFileName(generateDefaultFileName(newSpool).replace('.bin', ''));
    setStatusMessage(`NFC: Loaded tag data (${data.length} bytes)`);
  };

  const validation = spool?.validate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-4">
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <button
              onClick={handleGenerateNew}
              className="px-3 py-1.5 text-xs bg-elegoo-orange text-white rounded-md hover:bg-orange-600 transition-colors font-medium"
            >
              Generate New
            </button>

            <FileUpload onFileLoad={handleFileLoad} />

            <button
              onClick={handleSave}
              disabled={!spool}
              className="px-3 py-1.5 text-xs bg-elegoo-blue text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save .BIN
            </button>

            <button
              onClick={() => setShowHexEditor(!showHexEditor)}
              className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              {showHexEditor ? 'Hide' : 'Show'} Hex Editor
            </button>
          </div>

          {/* Filename Input */}
          <div className="flex items-center gap-2">
            <label htmlFor="filename" className="text-xs font-medium text-gray-700 whitespace-nowrap">
              Filename:
            </label>
            <input
              id="filename"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={spool ? generateDefaultFileName(spool).replace('.bin', '') : 'spool'}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-elegoo-orange focus:border-transparent text-xs font-mono"
            />
            <span className="text-xs text-gray-500">.bin</span>
          </div>

          {/* Validation Status */}
          {validation && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              {validation.valid ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 size={14} />
                  <span>Tag valid</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle size={14} />
                  <span>{validation.errors[0]}</span>
                </div>
              )}
              {validation.warnings.length > 0 && (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertCircle size={14} />
                  <span>{validation.warnings[0]}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spool Configuration */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-gray-800">
              Spool Configuration
              <span className="text-xs font-normal text-gray-500 ml-2">
                ✓ = Used by printer, ⓘ = Metadata only
              </span>
            </h2>
            {spool && (
              <p className="text-xs text-gray-600 mt-0.5">
                Manufacturer: <span className="font-medium">{spool.manufacturer}</span>
              </p>
            )}
          </div>

          {spool && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <MaterialSelector
                  value={spool.material}
                  onChange={handleMaterialChange}
                />

                <SubtypeSelector
                  material={spool.material}
                  value={spool.subtype}
                  onChange={handleSubtypeChange}
                />

                <ColorPicker
                  value={spool.color}
                  onChange={handleColorChange}
                  onCatalogSelect={handleCatalogSelect}
                />
              </div>

              <MetadataFields
                weight={spool.weight}
                diameter={spool.diameter}
                minTemp={spool.minTemp}
                maxTemp={spool.maxTemp}
                onChange={handleMetadataChange}
              />
            </div>
          )}
        </div>

        {/* Export Buttons */}
        {spool && (
          <ExportButtons
            spool={spool}
            onStatusUpdate={setStatusMessage}
            filename={fileName || generateDefaultFileName(spool).replace('.bin', '')}
          />
        )}

        {/* NFC Reader/Writer - only visible on devices with Web NFC (Chrome Android) */}
        {nfcSupported && spool && (
          <NfcReaderWriter
            spool={spool}
            onTagRead={handleNfcTagRead}
            onStatusUpdate={setStatusMessage}
          />
        )}

        {/* Hex Editor */}
        {showHexEditor && spool && (
          <HexEditor data={spool.getRawData()} />
        )}
      </main>

      <StatusBar message={statusMessage} />
    </div>
  );
}

export default App;
