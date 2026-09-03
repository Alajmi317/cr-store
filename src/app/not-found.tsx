import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container-cr py-24 text-center">
      <h1 className="display text-7xl">404</h1>
      <p className="mt-3 text-zinc-400">This page does not exist.</p>
      <Link href="/" className="btn-primary mt-6 inline-block rounded-full px-6 py-3">Home</Link>
    </div>
  );
}
