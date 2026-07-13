export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin ${className}`}></div>
  );
}

export function CenteredSpinner({ message }: { message?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Spinner className="w-12 h-12 border-4" />
      {message && <p className="text-on-surface-variant font-medium animate-pulse">{message}</p>}
    </div>
  );
}
