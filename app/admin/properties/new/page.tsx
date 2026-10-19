import Link from "next/link";
import { AddPropertyForm } from "./add-property-form";

export default function NewPropertyPage() {
  return (
    <main className="min-h-screen bg-[#eef2f7] px-4 py-6 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-normal text-blue-700">
              Admin
            </p>
            <h1 className="text-2xl font-black tracking-normal text-slate-950">
              Add Property
            </h1>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"
            href="/admin"
          >
            Back to dashboard
          </Link>
        </header>
        <AddPropertyForm />
      </div>
    </main>
  );
}
