import { DB_TABLES } from "../constants";
import { isSupabaseConfigured, requireSupabase } from "../lib/supabase";

export interface DatabaseStatus {
  connected: boolean;
  message: string;
}

export const databaseStatusService = {
  async check(): Promise<DatabaseStatus> {
    if (!isSupabaseConfigured) {
      return {
        connected: false,
        message: "Environment Supabase belum diisi",
      };
    }

    try {
      const client = requireSupabase();
      const { error } = await client.from(DB_TABLES.SETTINGS).select("id").limit(1);
      if (error) {
        return {
          connected: false,
          message: error.message,
        };
      }
      return {
        connected: true,
        message: "Database terhubung",
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : "Koneksi database gagal",
      };
    }
  },
};
