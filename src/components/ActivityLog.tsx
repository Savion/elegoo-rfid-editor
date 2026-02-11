import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';

interface ActivityLogProps {
  log: string[];
}

export function ActivityLog({ log }: ActivityLogProps) {
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries arrive and log is open
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log, open]);

  const latestMessage = log[log.length - 1] || '';

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      {/* Collapsible log panel */}
      {open && (
        <div className="bg-gray-900 border-t border-gray-700">
          <div
            ref={scrollRef}
            className="container mx-auto max-w-6xl px-4 py-2 max-h-40 overflow-y-auto font-mono text-[11px] text-gray-300 space-y-0.5"
          >
            {log.map((entry, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-gray-600 select-none shrink-0">{String(i + 1).padStart(3, ' ')}</span>
                <span>{entry}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status bar / toggle */}
      <div
        className="bg-gray-800 text-gray-200 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <div className="container mx-auto max-w-6xl px-4 py-1.5 flex items-center gap-2">
          <Terminal size={12} className="text-gray-400 shrink-0" />
          <p className="text-xs flex-1 truncate">{latestMessage}</p>
          <span className="text-[10px] text-gray-500 shrink-0">{log.length}</span>
          {open ? (
            <ChevronDown size={12} className="text-gray-400 shrink-0" />
          ) : (
            <ChevronUp size={12} className="text-gray-400 shrink-0" />
          )}
        </div>
      </div>
    </footer>
  );
}
