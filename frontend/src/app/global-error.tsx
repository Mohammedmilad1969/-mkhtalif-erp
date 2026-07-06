'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p className="text-muted-foreground text-sm max-w-md text-center">
            {error.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
