import { GlobalNavBar } from "@/components/GlobalNavBar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GlobalNavBar />
      <main className="flex-1 w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
