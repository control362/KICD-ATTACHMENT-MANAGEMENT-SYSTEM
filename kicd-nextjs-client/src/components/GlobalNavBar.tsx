"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function GlobalNavBar() {
  const pathname = usePathname();
  const { user, logout, isStudent, isStaff, isAdmin } = useAuth();
  const isLoggedIn = !!user;

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
    <header className="w-full bg-surface shadow-sm sticky top-0 z-50 border-b border-border-light">
      <div className="container mx-auto max-w-[1440px] px-6 py-3 md:py-4 flex items-center justify-between">
        {/* Left: Logo & Branding */}
        <Link href="/" className="flex items-center group py-1">
          <img 
            alt="KICD Logo" 
            className="h-16 md:h-20 lg:h-24 w-auto object-contain transition-transform group-hover:scale-105" 
            src="/kicd-logo.png" 
          />
        </Link>

        {/* Middle: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {!isLoggedIn && navItem("/", "Home")}
          {isLoggedIn && isStudent && (
            <>
              {navItem("/", "Home")}
              {navItem("/dashboard", "Dashboard")}
              {navItem("/profile", "Profile")}
            </>
          )}
          {isLoggedIn && isStaff && (
            <>
              {navItem("/reviewer/dashboard", "Dashboard")}
              {navItem("/reviewer/applications", "Applications")}
              {navItem("/reviewer/opportunities", "Opportunities")}
              {navItem("/reviewer/departments", "Departments")}
              {navItem("/reviewer/reports", "Reports")}
              {isAdmin && navItem("/reviewer/staff", "Staff")}
              {navItem("/reviewer/settings", "Settings")}
            </>
          )}
        </nav>

        {/* Right: Actions & Auth */}
        <div className="flex items-center gap-sm md:gap-md">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-primary leading-tight">{user.email}</span>
                <span className="text-xs text-text-secondary uppercase tracking-wider">{user.role.replace('_', ' ')}</span>
              </div>
              <button 
                onClick={logout} 
                className="px-5 py-2 rounded-lg font-label-md text-label-md bg-error-container text-on-error-container hover:bg-error hover:text-white transition-all duration-200 shadow-sm hover:shadow"
              >
                Logout
              </button>
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
      
      {/* Mobile Navigation */}
      <nav className="lg:hidden w-full bg-surface-subtle border-t border-border-light flex overflow-x-auto px-4 py-2 gap-4">
        {!isLoggedIn && navItem("/", "Home")}
        {isLoggedIn && isStudent && (
          <>
            {navItem("/", "Home")}
            {navItem("/dashboard", "Dashboard")}
            {navItem("/profile", "Profile")}
          </>
        )}
        {isLoggedIn && isStaff && (
          <>
            {navItem("/reviewer/dashboard", "Dashboard")}
            {navItem("/reviewer/applications", "Applications")}
            {navItem("/reviewer/opportunities", "Opportunities")}
            {navItem("/reviewer/departments", "Departments")}
            {navItem("/reviewer/reports", "Reports")}
            {isAdmin && navItem("/reviewer/staff", "Staff")}
            {navItem("/reviewer/settings", "Settings")}
          </>
        )}
      </nav>
    </header>
  );
}
