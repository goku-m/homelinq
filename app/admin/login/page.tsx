import { Suspense } from "react";
import { AdminLoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--theme-surface)]" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
