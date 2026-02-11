import { Smartphone, Copy, Share2 } from 'lucide-react';
import type { ElegooSpool } from '../lib/ElegooSpool';

interface ExportButtonsProps {
  spool: ElegooSpool;
  onStatusUpdate: (message: string) => void;
  filename: string;
}

export function ExportButtons({ spool, onStatusUpdate, filename }: ExportButtonsProps) {
  const handleMobileExport = async () => {
    const commands = spool.exportMobileCommands();

    try {
      await navigator.clipboard.writeText(commands);
      onStatusUpdate('Mobile commands copied to clipboard');
      alert(
        'Commands copied to clipboard!\n\n' +
          'Android (RFID Tools):\n' +
          '1. Go to Other → Advanced RFID Commands\n' +
          '2. Paste in Data field\n' +
          '3. Click Send command\n\n' +
          'iOS (NFC Tools):\n' +
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
    const fileName = filename ? `${filename}.bin` : 'spool.bin';
    const file = new File([blob], fileName, { type: 'application/octet-stream' });

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
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    onStatusUpdate('File downloaded (Share not available on desktop)');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 mb-4">
      <div className="flex gap-1.5">
        <button
          onClick={handleMobileExport}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
        >
          <Smartphone size={12} />
          Mobile
        </button>

        <button
          onClick={handleCopyHex}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          <Copy size={12} />
          Hex
        </button>

        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          <Share2 size={12} />
          {'share' in navigator ? 'Share' : 'Download'}
        </button>
      </div>
    </div>
  );
}
