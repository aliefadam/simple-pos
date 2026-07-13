import { v4 as uuid } from "uuid";
import { STORAGE_KEYS } from "../constants";
import { storageService } from "./storageService";
import type { User } from "../types";

function normalizeUser(user: User & { email?: string }): User {
  return {
    ...user,
    username: user.username || user.email?.split("@")[0] || "",
  };
}

export const userService = {
  getAll(): User[] {
    return storageService
      .getAll<User & { email?: string }>(STORAGE_KEYS.USERS)
      .map(normalizeUser)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getById(id: string): User | undefined {
    const user = storageService.getOne<User & { email?: string }>(STORAGE_KEYS.USERS, id);
    return user ? normalizeUser(user) : undefined;
  },

  create(data: Omit<User, "id" | "createdAt">): User {
    const user: User = { ...data, username: data.username.trim(), id: uuid(), createdAt: new Date().toISOString() };
    return storageService.insert(STORAGE_KEYS.USERS, user);
  },

  update(id: string, patch: Partial<User>): User | undefined {
    const nextPatch = patch.username ? { ...patch, username: patch.username.trim() } : patch;
    return storageService.update<User>(STORAGE_KEYS.USERS, id, nextPatch);
  },

  remove(id: string): void {
    storageService.remove<User>(STORAGE_KEYS.USERS, id);
  },
};
