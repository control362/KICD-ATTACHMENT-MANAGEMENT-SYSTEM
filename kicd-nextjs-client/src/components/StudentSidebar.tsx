"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Application } from "@/types";
import { useEffect, useState } from "react";

export function StudentSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const { data: applications } = useSWR<Application[]>(user ? "/api/applications/me" : null, fetcher);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const calculateUnread = () => {
      if (!applications) return;
      const notifications = applications.filter(app => app.status === 'APPROVED' || app.status === 'REJECTED');
      const readIds = JSON.parse(localStorage.getItem('readNotificationIds') || '[]');
      const unread = notifications.filter(n => !readIds.includes(n.applicationId)).length;
      setUnreadCount(unread);
    };

    calculateUnread();
    
    // Listen for custom event from Notifications page to clear badge immediately
    window.addEventListener('notificationsRead', calculateUnread);
    return () => window.removeEventListener('notificationsRead', calculateUnread);
  }, [applications]);

  const navItem = (href: string, icon: string, label: string, badge?: number) => {
    const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
    
    return (
      <Link 
        href={href}
        className={`flex items-center justify-between gap-3 px-4 py-3 transition-all duration-150 ${
          isActive 
            ? "bg-white/10 text-white font-bold border border-white rounded-[16px] shadow-sm" 
            : "text-white/80 hover:bg-white/5 hover:text-white rounded-lg border border-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
            {icon}
          </span>
          <span className="text-[15px]">{label}</span>
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-64 py-8 px-4 bg-[#1a4b8c] text-white h-full overflow-y-auto shadow-xl rounded-r-3xl my-0 shrink-0">
      <nav className="flex flex-col gap-2">
        {navItem("/dashboard", "grid_view", "Dashboard")}
        {navItem("/applications", "description", "My Applications")}
        {navItem("/", "work", "Open Opportunities")}
        {navItem("/documents", "folder", "Documents")}
        {navItem("/notifications", "notifications", "Notifications", unreadCount)}
        {navItem("/profile", "settings", "Settings")}
      </nav>
      
      <div className="mt-auto pt-6">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-white/30 text-white/90 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-150 font-medium"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
