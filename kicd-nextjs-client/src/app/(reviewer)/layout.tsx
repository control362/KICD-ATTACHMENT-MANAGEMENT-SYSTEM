import { GlobalNavBar } from "@/components/GlobalNavBar";
import { StaffSidebar } from "@/components/StaffSidebar";

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <GlobalNavBar />
      <div className="flex w-full flex-1 overflow-hidden">
        <StaffSidebar />
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
