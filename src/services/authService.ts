import { STORAGE_KEYS } from "../constants";
import { storageService } from "./storageService";
import type { Session, User } from "../types";

function getLegacyUsername(user: User & { email?: string }): string {
  return user.username || user.email?.split("@")[0] || "";
}

export const authService = {
  login(username: string, password: string, rememberMe: boolean): User {
    const users = storageService.getAll<(User & { email?: string })>(STORAGE_KEYS.USERS);
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
    storageService.setObject(STORAGE_KEYS.SESSION, session);
    return user;
  },

  logout(): void {
    storageService.clearKey(STORAGE_KEYS.SESSION);
  },

  getSession(): Session | null {
    return storageService.getObject<Session | null>(STORAGE_KEYS.SESSION, null);
  },

  getCurrentUser(): User | null {
    const session = this.getSession();
    if (!session) return null;
    const user = storageService.getOne<User & { email?: string }>(STORAGE_KEYS.USERS, session.userId);
    if (!user) return null;
    return { ...user, username: getLegacyUsername(user) };
  },
};
