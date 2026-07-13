"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, getCurrentUser, isAuthenticated, hasRole, clearSession, saveSession } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (authResponse: any) => void;
  logout: () => void;
  isStudent: boolean;
  isStaff: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    }
    setIsLoading(false);
  }, []);

  const login = (authResponse: any) => {
    saveSession(authResponse);
    setUser(getCurrentUser());
  };

  const logout = () => {
    clearSession();
    setUser(null);
    window.location.href = "/login";
  };

  const isStudent = user?.role === "STUDENT";
  const isStaff = user?.role === "HR_OFFICER" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isStudent, isStaff, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
