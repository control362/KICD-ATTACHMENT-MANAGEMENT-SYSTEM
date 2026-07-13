import { GlobalNavBar } from "@/components/GlobalNavBar";
import { Footer } from "@/components/Footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background ambient-bg">
      <GlobalNavBar />
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
