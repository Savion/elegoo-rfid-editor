interface StatusBarProps {
  message: string;
}

export function StatusBar({ message }: StatusBarProps) {
  return (
    <footer className="bg-gray-800 text-gray-200 py-2 px-4 fixed bottom-0 left-0 right-0">
      <div className="container mx-auto max-w-6xl">
        <p className="text-sm">{message}</p>
      </div>
    </footer>
  );
}
