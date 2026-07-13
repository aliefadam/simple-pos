import { v4 as uuid } from "uuid";
import { DB_TABLES } from "../constants";
import { storageService } from "./storageService";
import type { User } from "../types";

function normalizeUser(user: User & { email?: string }): User {
  return {
    ...user,
    username: user.username || user.email?.split("@")[0] || "",
  };
}

export const userService = {
  async getAll(): Promise<User[]> {
    return (await storageService
      .getAll<User & { email?: string }>(DB_TABLES.USERS))
      .map(normalizeUser)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string): Promise<User | undefined> {
    const user = await storageService.getOne<User & { email?: string }>(DB_TABLES.USERS, id);
    return user ? normalizeUser(user) : undefined;
  },

  async create(data: Omit<User, "id" | "createdAt">): Promise<User> {
    const user: User = { ...data, username: data.username.trim(), id: uuid(), createdAt: new Date().toISOString() };
    return storageService.insert(DB_TABLES.USERS, user);
  },

  async update(id: string, patch: Partial<User>): Promise<User | undefined> {
    const nextPatch = patch.username ? { ...patch, username: patch.username.trim() } : patch;
    return storageService.update<User>(DB_TABLES.USERS, id, nextPatch);
  },

  async remove(id: string): Promise<void> {
    await storageService.remove(DB_TABLES.USERS, id);
  },
};
