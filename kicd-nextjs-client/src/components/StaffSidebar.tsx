"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useSidebar } from "./SidebarContext";
import { useEffect } from "react";

export function StaffSidebar() {
  const { user, logout, isStaff, isAdmin } = useAuth();
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const isHomePage = pathname === "/";
  const isHr = user?.role === "HR_OFFICER";

  // When navigating, if it's the home page, auto-close the drawer.
  useEffect(() => {
    if (isHomePage) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navItem = (href: string, icon: string, label: string) => {
    const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
    const hideText = !isSidebarOpen && !isHomePage;
    
    return (
      <Link 
        href={href}
        className={`flex items-center ${hideText ? 'justify-center' : 'justify-between'} gap-3 px-4 py-3 transition-all duration-150 ${
          isActive 
            ? "bg-white/10 text-white font-bold border border-white rounded-[16px] shadow-sm" 
            : "text-white/80 hover:bg-white/5 hover:text-white rounded-lg border border-transparent"
        }`}
        title={hideText ? label : undefined}
      >
        <div className={`flex items-center ${hideText ? 'justify-center' : 'gap-3'}`}>
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
            {icon}
          </span>
          {!hideText && <span className="text-[15px] whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}
        </div>
      </Link>
    );
  };

  if (!user || !isStaff) return null;

  if (isHomePage) {
    // DRAWER MODE (for Home Page)
    return (
      <>
        <div 
          className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsSidebarOpen(false)}
        />
        <aside 
          className={`fixed top-0 left-0 h-full w-80 md:w-96 bg-[#1a4b8c] text-white z-[70] shadow-2xl flex flex-col py-8 px-4 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex justify-between items-center mb-6 px-2 border-b border-white/10 pb-4">
            <div className="font-headline-sm font-bold flex items-center gap-3">
               <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                 <span className="material-symbols-outlined text-white">person</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[14px] truncate max-w-[150px]">{user.email}</span>
                 <span className="text-[10px] uppercase opacity-70 font-normal">{user.role?.replace('_', ' ')}</span>
               </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="text-white/70 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center"
              title="Close menu"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="flex flex-col gap-2 relative flex-1 overflow-y-auto">
            {isAdmin && navItem("/reviewer/sysadmin", "dashboard", "Dashboard")}
            {isHr && navItem("/reviewer/dashboard", "dashboard", "Dashboard")}
            {isHr && navItem("/", "home", "Home")}
            {isHr && navItem("/reviewer/applications", "description", "Applications")}
            {isHr && navItem("/reviewer/opportunities", "work", "Opportunities")}
            {navItem("/reviewer/departments", "domain", "Departments")}
            {isHr && navItem("/reviewer/reports", "bar_chart", "Reports")}
            {isAdmin && navItem("/reviewer/sysadmin/reports", "print", "Reports")}
            {isAdmin && navItem("/reviewer/staff", "group", "Staff Management")}
            {navItem("/reviewer/settings", "settings", "Settings")}
          </nav>
          <div className="mt-auto pt-6 px-1">
            <button 
              onClick={() => { logout(); setIsSidebarOpen(false); }}
              className="w-full flex items-center justify-center gap-3 py-2.5 border border-white/30 text-white/90 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 font-medium px-4"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </>
    );
  }

  // FLEX MODE (for Dashboard screens)
  const isCollapsed = !isSidebarOpen;
  return (
    <aside className={`hidden md:flex flex-col py-8 px-3 bg-[#1a4b8c] text-white h-full overflow-y-auto overflow-x-hidden shadow-xl rounded-r-3xl my-0 shrink-0 transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-72'}`}>
      
      {!isCollapsed ? (
        <div className="flex items-center gap-3 mb-6 px-4 border-b border-white/10 pb-4 shrink-0 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 shrink-0">
            <span className="material-symbols-outlined text-white">person</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[14px] truncate">{user.email}</span>
            <span className="text-[10px] uppercase opacity-70 font-normal">{user.role?.replace('_', ' ')}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center mb-6 px-2 border-b border-white/10 pb-4 shrink-0">
           <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20" title={user.email}>
            <span className="material-symbols-outlined text-white">person</span>
          </div>
        </div>
      )}

      <nav className="flex flex-col gap-2 relative flex-1">
        {isAdmin && navItem("/reviewer/sysadmin", "dashboard", "Dashboard")}
        {isHr && navItem("/reviewer/dashboard", "dashboard", "Dashboard")}
        {isHr && navItem("/", "home", "Home")}
        {isHr && navItem("/reviewer/applications", "description", "Applications")}
        {isHr && navItem("/reviewer/opportunities", "work", "Opportunities")}
        {navItem("/reviewer/departments", "domain", "Departments")}
        {isHr && navItem("/reviewer/reports", "bar_chart", "Reports")}
        {isAdmin && navItem("/reviewer/sysadmin/reports", "print", "Reports")}
        {isAdmin && navItem("/reviewer/staff", "group", "Staff Management")}
        {navItem("/reviewer/settings", "settings", "Settings")}
      </nav>
      <div className="mt-auto pt-6 px-1">
        <button 
          onClick={logout}
          className={`w-full flex items-center justify-center gap-3 py-2.5 border border-white/30 text-white/90 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 font-medium ${isCollapsed ? 'px-0' : 'px-4'}`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
