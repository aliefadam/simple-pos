import { requireSupabase, supabase } from "../lib/supabase";

interface TableRecord<T> {
  id: string;
  payload: T;
  created_at?: string;
  updated_at?: string;
}

function mapRows<T>(rows: TableRecord<T>[] | null | undefined): T[] {
  return (rows ?? []).map((row) => row.payload);
}

export const storageService = {
  async getAll<T>(table: string): Promise<T[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from(table).select("payload");
    if (error) throw new Error(error.message);
    return mapRows<T>(data as TableRecord<T>[]);
  },

  async getOne<T extends { id: string }>(table: string, id: string): Promise<T | undefined> {
    if (!supabase) return undefined;
    const { data, error } = await supabase
      .from(table)
      .select("payload")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as TableRecord<T> | null)?.payload;
  },

  async insert<T extends { id: string }>(table: string, item: T): Promise<T> {
    const client = requireSupabase();
    const { data, error } = await client
      .from(table)
      .insert({ id: item.id, payload: item })
      .select("payload")
      .single();
    if (error) throw new Error(error.message);
    return (data as TableRecord<T>).payload;
  },

  async update<T extends { id: string }>(table: string, id: string, patch: Partial<T>): Promise<T | undefined> {
    const current = await this.getOne<T>(table, id);
    if (!current) return undefined;
    const next = { ...current, ...patch };
    const client = requireSupabase();
    const { data, error } = await client
      .from(table)
      .update({ payload: next })
      .eq("id", id)
      .select("payload")
      .single();
    if (error) throw new Error(error.message);
    return (data as TableRecord<T>).payload;
  },

  async remove(table: string, id: string): Promise<void> {
    const client = requireSupabase();
    const { error } = await client.from(table).delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async replaceAll<T extends { id: string }>(table: string, data: T[]): Promise<void> {
    const client = requireSupabase();
    const { error: deleteError } = await client.from(table).delete().not("id", "is", null);
    if (deleteError) throw new Error(deleteError.message);
    if (data.length === 0) return;
    const rows = data.map((item) => ({ id: item.id, payload: item }));
    const { error: insertError } = await client.from(table).insert(rows);
    if (insertError) throw new Error(insertError.message);
  },

  async getObject<T>(table: string, id: string, fallback: T): Promise<T> {
    if (!supabase) return fallback;
    const { data, error } = await supabase
      .from(table)
      .select("payload")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return ((data as TableRecord<T> | null)?.payload ?? fallback);
  },

  async setObject<T>(table: string, id: string, value: T): Promise<T> {
    const client = requireSupabase();
    const { data, error } = await client
      .from(table)
      .upsert({ id, payload: value })
      .select("payload")
      .single();
    if (error) throw new Error(error.message);
    return (data as TableRecord<T>).payload;
  },

  async exportAll(tables: string[]): Promise<Record<string, unknown>> {
    const dump: Record<string, unknown> = {};
    for (const table of tables) {
      dump[table] = await this.getAll(table);
    }
    return dump;
  },

  async importAll(dump: Record<string, unknown>): Promise<void> {
    for (const [table, value] of Object.entries(dump)) {
      if (Array.isArray(value)) {
        await this.replaceAll(table, value as { id: string }[]);
      }
    }
  },
};
