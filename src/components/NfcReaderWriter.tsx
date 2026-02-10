import { useState, useCallback, useRef, useEffect } from 'react';
import { Nfc } from 'lucide-react';
import { ElegooSpool } from '../lib/ElegooSpool';

interface NfcReaderWriterProps {
  spool: ElegooSpool;
  onTagRead: (data: Uint8Array) => void;
  onStatusUpdate: (message: string) => void;
}

type NfcState = 'idle' | 'scanning-read' | 'scanning-write' | 'success' | 'error';

/**
 * Check if Web NFC is available (Chrome on Android only).
 * Returns false on desktop, iOS, and non-Chrome browsers.
 */
export function isWebNfcSupported(): boolean {
  return 'NDEFReader' in window;
}

/**
 * NTAG213 Memory Layout (180 bytes = 45 pages × 4 bytes):
 *
 *   Pages 0-3   (0x00-0x0F): UID, BCC, internal, lock, CC  — read-only via NFC
 *   Pages 4-39  (0x10-0x9F): User data area (144 bytes)     — writable via NDEF
 *   Pages 40-44 (0xA0-0xB3): Dynamic lock, CFG, PWD/PACK    — config area
 *
 * Web NFC writes an NDEF TLV into the user data area starting at page 4 (0x10).
 * The Elegoo printer reads spool data from fixed offsets starting at 0x40 (page 16).
 *
 * To achieve exact byte alignment we write a single "unknown" type NDEF record.
 * The NDEF framing consumes exactly 5 bytes of preamble:
 *   0x10: 03        — NDEF TLV type
 *   0x11: 8B        — TLV length (139)
 *   0x12: D5        — NDEF record header (MB=1,ME=1,SR=1,TNF=5=unknown)
 *   0x13: 00        — Type length (0, no type field)
 *   0x14: 87        — Payload length (135)
 *
 * Payload starts at 0x15 and contains:
 *   0x15-0x3F: 43 bytes of padding (original URL/NDEF area content from template)
 *   0x40-0x9F: 96 bytes of spool data (header, material, color, metadata)
 *
 * This places spool data at exactly offset 0x40 where the printer expects it.
 * TLV terminator FE lands at 0x9E (within user data), followed by zero padding.
 */

export function NfcReaderWriter({ spool, onTagRead, onStatusUpdate }: NfcReaderWriterProps) {
  const [state, setState] = useState<NfcState>('idle');
  const [message, setMessage] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const cancelOperation = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState('idle');
    setMessage('');
    onStatusUpdate('NFC operation cancelled');
  }, [onStatusUpdate]);

  const handleWrite = useCallback(async () => {
    if (!('NDEFReader' in window)) {
      setMessage('Web NFC not supported on this device');
      setState('error');
      return;
    }

    try {
      setState('scanning-write');
      setMessage('Hold your phone near the NFC tag...');
      onStatusUpdate('NFC: Waiting for tag to write...');

      const ndef = new NDEFReader();
      abortControllerRef.current = new AbortController();

      const rawData = spool.getRawData();

      // Build the payload for a single "unknown" NDEF record.
      // The NDEF preamble (TLV header + record header) consumes 5 bytes,
      // placing the payload start at offset 0x15 in tag memory.
      // We need spool data at offset 0x40, so we prepend 43 bytes of padding
      // (the original NDEF URL area content) before the 96-byte spool payload.
      //
      // Payload layout (135 bytes total):
      //   [0..42]   = padding from template (offsets 0x15-0x3F)
      //   [43..138] = spool data (offsets 0x40-0x9F)

      // Padding: use the original template bytes from 0x15-0x3F
      // This preserves the elegoo.com URL area content in the padding region
      const padding = rawData.slice(0x15, 0x40); // 43 bytes
      const spoolPayload = rawData.slice(0x40, 0xA0); // 96 bytes

      const fullPayload = new Uint8Array(padding.length + spoolPayload.length);
      fullPayload.set(padding, 0);
      fullPayload.set(spoolPayload, padding.length);

      await ndef.write(
        {
          records: [
            {
              recordType: 'unknown',
              data: fullPayload,
            },
          ],
        },
        { overwrite: true, signal: abortControllerRef.current.signal },
      );

      setState('success');
      setMessage('Tag written successfully!');
      onStatusUpdate('NFC: Tag written successfully');

      // Reset state after a delay
      setTimeout(() => {
        setState('idle');
        setMessage('');
      }, 3000);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        setState('idle');
        setMessage('');
        return;
      }
      console.error('NFC write error:', error);
      setState('error');
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Write failed: ${errMsg}`);
      onStatusUpdate(`NFC write error: ${errMsg}`);
    } finally {
      abortControllerRef.current = null;
    }
  }, [spool, onStatusUpdate]);

  const handleRead = useCallback(async () => {
    if (!('NDEFReader' in window)) {
      setMessage('Web NFC not supported on this device');
      setState('error');
      return;
    }

    try {
      setState('scanning-read');
      setMessage('Hold your phone near the NFC tag...');
      onStatusUpdate('NFC: Waiting for tag to read...');

      const ndef = new NDEFReader();
      abortControllerRef.current = new AbortController();

      const readPromise = new Promise<Uint8Array>((resolve, reject) => {
        const onReading = (event: NDEFReadingEvent) => {
          ndef.removeEventListener('reading', onReading);
          ndef.removeEventListener('readingerror', onError);

          try {
            const tagData = parseNdefToSpoolData(event);
            resolve(tagData);
          } catch (err) {
            reject(err);
          }
        };

        const onError = () => {
          ndef.removeEventListener('reading', onReading);
          ndef.removeEventListener('readingerror', onError);
          reject(new Error('Error reading NFC tag'));
        };

        ndef.addEventListener('reading', onReading);
        ndef.addEventListener('readingerror', onError);

        // Also handle abort
        abortControllerRef.current?.signal.addEventListener('abort', () => {
          ndef.removeEventListener('reading', onReading);
          ndef.removeEventListener('readingerror', onError);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });

      await ndef.scan({ signal: abortControllerRef.current.signal });
      const tagData = await readPromise;

      onTagRead(tagData);
      setState('success');
      setMessage('Tag read successfully!');
      onStatusUpdate(`NFC: Tag read (${tagData.length} bytes)`);

      setTimeout(() => {
        setState('idle');
        setMessage('');
      }, 3000);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        setState('idle');
        setMessage('');
        return;
      }
      console.error('NFC read error:', error);
      setState('error');
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Read failed: ${errMsg}`);
      onStatusUpdate(`NFC read error: ${errMsg}`);
    } finally {
      abortControllerRef.current = null;
    }
  }, [onTagRead, onStatusUpdate]);

  const isScanning = state === 'scanning-read' || state === 'scanning-write';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
        <Nfc size={16} className="text-emerald-600" />
        NFC Tag Reader / Writer
      </h2>

      <div className="grid sm:grid-cols-2 gap-2">
        <button
          onClick={isScanning ? cancelOperation : handleRead}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-md font-medium transition-colors ${
            state === 'scanning-read'
              ? 'bg-amber-500 text-white hover:bg-amber-600 animate-pulse'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          <Nfc size={14} />
          {state === 'scanning-read' ? 'Cancel Read' : 'Read Tag'}
        </button>

        <button
          onClick={isScanning ? cancelOperation : handleWrite}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-md font-medium transition-colors ${
            state === 'scanning-write'
              ? 'bg-amber-500 text-white hover:bg-amber-600 animate-pulse'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Nfc size={14} />
          {state === 'scanning-write' ? 'Cancel Write' : 'Write Tag'}
        </button>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`mt-2 px-3 py-2 rounded-md text-xs font-medium ${
            state === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : state === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {message}
        </div>
      )}

      <p className="mt-2 text-[11px] text-amber-500">
        ⚠ Web NFC may not be compatible with all printers. For guaranteed compatibility, use Export options with a dedicated NFC app.
      </p>
    </div>
  );
}

/**
 * Parse an NDEF reading event into a 180-byte spool data array.
 *
 * When this app writes a tag, it uses a single "unknown" type NDEF record
 * containing 135 bytes: 43 bytes of padding + 96 bytes of spool data.
 * The spool data corresponds to offsets 0x40-0x9F of the 180-byte tag dump.
 */
function parseNdefToSpoolData(event: NDEFReadingEvent): Uint8Array {
  // Start with a blank spool template
  const template = new ElegooSpool();
  const data = new Uint8Array(template.getRawData());

  // Look for our unknown-type record with the expected payload size
  for (const record of event.message.records) {
    if (record.recordType === 'unknown' && record.data) {
      const payload = new Uint8Array(
        record.data.buffer,
        record.data.byteOffset,
        record.data.byteLength,
      );

      // Expected layout: 43 bytes padding + 96 bytes spool data = 135 bytes
      if (payload.length >= 43 + 1) {
        // Extract spool data from after the 43-byte padding
        const spoolBytes = payload.subarray(43);
        const maxLen = Math.min(spoolBytes.length, 0xA0 - 0x40);
        data.set(spoolBytes.subarray(0, maxLen), 0x40);
        return data;
      }
    }
  }

  // No compatible record found
  throw new Error(
    'Could not read spool data from this tag. ' +
      'Web NFC can only read tags written by this app. ' +
      'Use a dedicated NFC app to read original Elegoo tags.',
  );
}
