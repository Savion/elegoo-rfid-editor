import { Github } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-elegoo-blue text-white shadow-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold leading-tight">Elegoo RFID Tag Editor</h1>
            <p className="text-[11px] sm:text-xs text-blue-200">
              NTAG213 NFC spool tags - v2.2
            </p>
          </div>

          <a
            href="https://github.com/Savion/elegoo-rfid-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors flex-shrink-0 text-xs"
          >
            <Github size={16} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
