"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

import { useSidebar } from "./SidebarContext";

export function GlobalNavBar() {
  const pathname = usePathname();
  const { user, logout, isStudent, isStaff, isAdmin } = useAuth();
  const isLoggedIn = !!user;
  const { toggleSidebar } = useSidebar();

  const navItem = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    const activeClass = active ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant hover:text-primary";
    return (
      <Link href={href} className={`font-label-md text-label-md transition-all duration-200 px-1 py-1 ${activeClass}`}>
        {label}
      </Link>
    );
  };

  return (
    <>
      <header className="w-full bg-surface shadow-sm sticky top-0 z-40 border-b border-border-light">
        <div className="container mx-auto max-w-[1440px] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-2 md:gap-4 -ml-2 md:-ml-4">
            {isLoggedIn && (
              <button 
                onClick={toggleSidebar}
                className="flex items-center p-2 hover:bg-primary/10 rounded-lg transition-all duration-300 text-on-surface hover:text-primary focus:outline-none cursor-pointer group"
                aria-label="Open menu"
              >
                <span className="material-symbols-outlined text-[64px] md:text-[80px] transition-transform duration-300 group-hover:scale-110">menu</span>
              </button>
            )}
            
            <Link href="/" className="flex items-center group py-1 ml-2">
              <img 
                alt="KICD Logo" 
                className="h-12 md:h-16 lg:h-20 w-auto object-contain transition-transform group-hover:scale-105" 
                src="/kicd-logo.png" 
              />
            </Link>
          </div>

          {/* Right: Actions & Auth */}
          <div className="flex items-center gap-sm md:gap-md">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link 
                  href={user.role === 'STUDENT' ? '/profile' : '/reviewer/settings'} 
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  title="Profile Settings"
                >
                  <span className="material-symbols-outlined">person</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-5 py-2 rounded-lg font-label-md text-label-md text-primary border border-primary hover:bg-primary-fixed-dim transition-all duration-200">
                  Login
                </Link>
                <Link href="/register" className="px-5 py-2 rounded-lg font-label-md text-label-md bg-primary text-white hover:bg-primary-container transition-all duration-200 shadow-md hover:shadow-lg">
                  Apply Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

    </>
  );
}
