import Cookies from "js-cookie";

const TOKEN_KEY = "kicd_token";
const USER_KEY = "kicd_user";

export interface User {
  userId: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export function saveSession(authResponse: { accessToken: string; userId: number; email: string; role: string }) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions: Cookies.CookieAttributes = { 
    expires: 7, 
    sameSite: 'strict', 
    secure: isProduction 
  };
  
  Cookies.set(TOKEN_KEY, authResponse.accessToken, cookieOptions);
  Cookies.set(
    USER_KEY,
    JSON.stringify({
      userId: authResponse.userId,
      email: authResponse.email,
      role: authResponse.role,
    }),
    cookieOptions
  );
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getCurrentUser(): User | null {
  const raw = Cookies.get(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getCurrentUser();
}

export function hasRole(...roles: string[]): boolean {
  const user = getCurrentUser();
  return !!user && roles.includes(user.role);
}

export function clearSession() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
}
