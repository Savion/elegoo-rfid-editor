import { Smartphone, Copy, Share2 } from 'lucide-react';
import type { ElegooSpool } from '../lib/ElegooSpool';

interface ExportButtonsProps {
  spool: ElegooSpool;
  onStatusUpdate: (message: string) => void;
}

export function ExportButtons({ spool, onStatusUpdate }: ExportButtonsProps) {
  const handleMobileExport = async () => {
    const commands = spool.exportMobileCommands();

    try {
      await navigator.clipboard.writeText(commands);
      onStatusUpdate('Mobile commands copied to clipboard');
      alert(
        'Commands copied to clipboard!\n\nIn RFID Tools app:\n' +
          '1. Go to Other → Advanced RFID Commands\n' +
          '2. Paste in Data field\n' +
          '3. Click Send command'
      );
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  const handleCopyHex = async () => {
    const hex = spool.exportHex();

    try {
      await navigator.clipboard.writeText(hex);
      onStatusUpdate(`Clean hex copied to clipboard (${hex.length} characters)`);
      alert('Clean hex copied to clipboard!\n\nUse with mobile NFC apps that support raw hex input.');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  const handleShare = async () => {
    const blob = spool.toBlob();
    const file = new File([blob], 'spool.bin', { type: 'application/octet-stream' });

    // Try native share API (mobile)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'RFID Tag',
          text: 'Elegoo RFID spool tag',
          files: [file],
        });
        onStatusUpdate('Tag shared successfully');
        return;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          // User cancelled, not an error
          return;
        }
        console.error('Share failed:', error);
      }
    }

    // Fallback: download the file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spool.bin';
    a.click();
    URL.revokeObjectURL(url);
    onStatusUpdate('File downloaded (Share not available on desktop)');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Export Options</h2>

      <div className="grid sm:grid-cols-3 gap-4">
        <button
          onClick={handleMobileExport}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Smartphone size={20} />
          Export for Mobile
        </button>

        <button
          onClick={handleCopyHex}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Copy size={20} />
          Copy Clean Hex
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Share2 size={20} />
          {navigator.share ? 'Share / Download' : 'Download File'}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <p>
          <strong>Export for Mobile:</strong> Generates A2 commands for RFID Tools app
        </p>
        <p>
          <strong>Copy Clean Hex:</strong> Copies raw hex string for apps supporting hex input
        </p>
        <p>
          <strong>{navigator.share ? 'Share / Download:' : 'Download File:'}</strong>{' '}
          {navigator.share
            ? 'Uses share sheet on mobile, downloads on desktop'
            : 'Downloads the .bin file to your device'}
        </p>
      </div>
    </div>
  );
}
