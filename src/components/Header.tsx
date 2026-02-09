import { Github } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-elegoo-blue text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Elegoo RFID Tag Editor</h1>
            <p className="text-sm text-blue-200 mt-1">
              Edit NTAG213 NFC spool tags - v2.1 Web Edition
            </p>
          </div>

          <a
            href="https://github.com/Savion/elegoo-rfid-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Github size={20} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
