// Web NFC API type declarations
// Only available in Chrome on Android with secure context (HTTPS)

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: DataView;
  encoding?: string;
  lang?: string;
  toRecords?: () => NDEFRecord[];
}

interface NDEFReadingEvent extends Event {
  serialNumber: string;
  message: NDEFMessage;
}

interface NDEFWriteOptions {
  overwrite?: boolean;
  signal?: AbortSignal;
}

interface NDEFScanOptions {
  signal?: AbortSignal;
}

interface NDEFMakeReadOnlyOptions {
  signal?: AbortSignal;
}

declare class NDEFReader {
  constructor();
  scan(options?: NDEFScanOptions): Promise<void>;
  write(message: NDEFMessageInit, options?: NDEFWriteOptions): Promise<void>;
  makeReadOnly(options?: NDEFMakeReadOnlyOptions): Promise<void>;
  addEventListener(type: 'reading', listener: (event: NDEFReadingEvent) => void): void;
  addEventListener(type: 'readingerror', listener: (event: Event) => void): void;
  removeEventListener(type: 'reading', listener: (event: NDEFReadingEvent) => void): void;
  removeEventListener(type: 'readingerror', listener: (event: Event) => void): void;
}

type NDEFMessageInit = NDEFRecordInit[] | { records: NDEFRecordInit[] };

interface NDEFRecordInit {
  recordType: string;
  mediaType?: string;
  id?: string;
  encoding?: string;
  lang?: string;
  data?: BufferSource | string;
}

interface Window {
  NDEFReader?: typeof NDEFReader;
}
