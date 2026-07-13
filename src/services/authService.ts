import { DB_TABLES, SESSION_STORAGE_KEY } from "../constants";
import { storageService } from "./storageService";
import type { Session, User } from "../types";

function getLegacyUsername(user: User & { email?: string }): string {
  return user.username || user.email?.split("@")[0] || "";
}

export const authService = {
  async login(username: string, password: string, rememberMe: boolean): Promise<User> {
    const users = await storageService.getAll<(User & { email?: string })>(DB_TABLES.USERS);
    const user = users.find(
      (u) => getLegacyUsername(u).toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (!user) {
      throw new Error("Username atau password salah");
    }
    if (!user.active) {
      throw new Error("Akun ini sudah dinonaktifkan");
    }
    const session: Session = { userId: user.id, rememberMe, loginAt: new Date().toISOString() };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return user;
  },

  logout(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  },

  getSession(): Session | null {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const session = this.getSession();
    if (!session) return null;
    const user = await storageService.getOne<User & { email?: string }>(DB_TABLES.USERS, session.userId);
    if (!user) return null;
    return { ...user, username: getLegacyUsername(user) };
  },
};
