import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-16">
      <Link href="/" className="mb-10 font-serif text-3xl italic tracking-wide text-burgundy">
        PAEGE
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
