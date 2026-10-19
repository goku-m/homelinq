import { Suspense } from "react";
import { AdminDashboardClient, type AdminSection } from "./admin-dashboard-client";
import { getAdminDashboardData } from "@/lib/admin-dashboard";

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#eef2f7] lg:pl-64">
      <div className="h-16 border-b border-slate-200 bg-white" />
      <main className="grid gap-6 px-4 py-6 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="h-24 rounded-lg bg-white shadow-sm" key={index} />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-72 rounded-lg bg-white shadow-sm" />
          <div className="h-72 rounded-lg bg-white shadow-sm" />
        </div>
        <div className="h-80 rounded-lg bg-white shadow-sm" />
      </main>
    </div>
  );
}

async function LiveDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sectionValue = Array.isArray(params.section) ? params.section[0] : params.section;
  const initialSection: AdminSection =
    sectionValue === "properties" || sectionValue === "analytics"
      ? sectionValue
      : "overview";
  const dashboard = await getAdminDashboardData();

  return <AdminDashboardClient initialDashboard={dashboard} initialSection={initialSection} />;
}

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <LiveDashboard searchParams={searchParams} />
    </Suspense>
  );
}
