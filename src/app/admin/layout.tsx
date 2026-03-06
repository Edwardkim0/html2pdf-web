import { auth } from "@/lib/auth/config";
import Sidebar from "@/components/admin/Sidebar";

export const metadata = {
  title: "Admin - HTML→PDF",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If no session, render children only (login page will be shown).
  // Middleware handles redirecting non-login admin pages to /admin/login.
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8" style={{ backgroundColor: "#f9fafb" }}>
        {children}
      </main>
    </div>
  );
}
