import Link from 'next/link';
import { APP_NAME } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
      <p
        className="text-6xl font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', color: 'var(--foreground)' }}
      >
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
        Page not found
      </h1>
      <p className="mt-3" style={{ color: 'var(--muted)' }}>
        That page is not part of {APP_NAME}, or it may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        Back to home
      </Link>
    </div>
  );
}
