import { GlobalNavBar } from "@/components/GlobalNavBar";
import { StudentSidebar } from "@/components/StudentSidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <GlobalNavBar />
      <div className="flex w-full flex-1 overflow-hidden">
        <StudentSidebar />
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
