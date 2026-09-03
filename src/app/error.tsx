"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container-cr py-24 text-center">
      <h1 className="display text-5xl">Something went wrong</h1>
      <button onClick={reset} className="btn-primary mt-6 rounded-full px-6 py-3">Retry</button>
    </div>
  );
}
