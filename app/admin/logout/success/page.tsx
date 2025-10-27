import Link from "next/link";

export default function LogoutSuccessPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="mx-auto size-14 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
        ✓
      </div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">You have been logged out</h1>
      <p className="mt-2 text-gray-600">Thanks for visiting. Come back soon!</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link href="/" className="inline-flex items-center rounded-md bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">Go home</Link>
        <Link href="/admin/login" className="inline-flex items-center rounded-md border px-4 py-2">Sign in again</Link>
      </div>
    </div>
  );
}


