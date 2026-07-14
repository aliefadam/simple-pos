import { DB_TABLES, SETTINGS_ROW_ID } from "../constants";
import { requireSupabase, supabase } from "../lib/supabase";
import type {
  AppSettings,
  Category,
  Expense,
  Product,
  Shift,
  StockMovement,
  Transaction,
  User,
} from "../types";

type TableValueMap = {
  [DB_TABLES.USERS]: User;
  [DB_TABLES.CATEGORIES]: Category;
  [DB_TABLES.PRODUCTS]: Product;
  [DB_TABLES.TRANSACTIONS]: Transaction;
  [DB_TABLES.STOCK_MOVEMENTS]: StockMovement;
  [DB_TABLES.EXPENSES]: Expense;
  [DB_TABLES.SETTINGS]: AppSettings;
  [DB_TABLES.SHIFTS]: Shift;
};

type TableName = keyof TableValueMap;

type TableConfig<T> = {
  select: string;
  fromRow: (row: Record<string, unknown>) => T;
  toRow: (item: T | (T & { id?: string })) => Record<string, unknown>;
};

const tableConfigs: Record<TableName, TableConfig<any>> = {
  [DB_TABLES.USERS]: {
    select: "id,name,username,password,password_salt,role,avatar,active,created_at",
    fromRow: (row): User => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      username: String(row.username ?? ""),
      password: String(row.password ?? ""),
      passwordSalt: row.password_salt ? String(row.password_salt) : undefined,
      role: row.role === "karyawan" ? "karyawan" : "owner",
      avatar: row.avatar ? String(row.avatar) : undefined,
      active: Boolean(row.active),
      createdAt: String(row.created_at ?? new Date().toISOString()),
    }),
    toRow: (item: User) => ({
      id: item.id,
      name: item.name,
      username: item.username,
      password: item.password,
      password_salt: item.passwordSalt ?? null,
      role: item.role,
      avatar: item.avatar ?? null,
      active: item.active,
      created_at: item.createdAt,
    }),
  },
  [DB_TABLES.CATEGORIES]: {
    select: "id,name,icon,active,created_at",
    fromRow: (row): Category => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      icon: String(row.icon ?? ""),
      active: Boolean(row.active),
      createdAt: String(row.created_at ?? new Date().toISOString()),
    }),
    toRow: (item: Category) => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      active: item.active,
      created_at: item.createdAt,
    }),
  },
  [DB_TABLES.PRODUCTS]: {
    select:
      "id,name,category_id,price,stock,track_stock,image,active,created_at",
    fromRow: (row): Product => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      categoryId: String(row.category_id ?? ""),
      price: Number(row.price ?? 0),
      stock: Number(row.stock ?? 0),
      trackStock: Boolean(row.track_stock),
      image: String(row.image ?? ""),
      active: Boolean(row.active),
      createdAt: String(row.created_at ?? new Date().toISOString()),
    }),
    toRow: (item: Product) => ({
      id: item.id,
      name: item.name,
      category_id: item.categoryId,
      price: item.price,
      stock: item.stock,
      track_stock: item.trackStock,
      image: item.image,
      active: item.active,
      created_at: item.createdAt,
    }),
  },
  [DB_TABLES.TRANSACTIONS]: {
    select:
      "id,code,date,cashier_id,cashier_name,items,subtotal,extra_charge,total,payment_method,cash_received,change_amount,status",
    fromRow: (row): Transaction => ({
      id: String(row.id),
      code: String(row.code ?? ""),
      date: String(row.date ?? new Date().toISOString()),
      cashierId: String(row.cashier_id ?? ""),
      cashierName: String(row.cashier_name ?? ""),
      items: Array.isArray(row.items) ? (row.items as Transaction["items"]) : [],
      subtotal: Number(row.subtotal ?? 0),
      extraCharge: Number(row.extra_charge ?? 0),
      total: Number(row.total ?? 0),
      paymentMethod: row.payment_method === "qris" ? "qris" : "tunai",
      cashReceived:
        row.cash_received === null || row.cash_received === undefined
          ? undefined
          : Number(row.cash_received),
      change:
        row.change_amount === null || row.change_amount === undefined
          ? undefined
          : Number(row.change_amount),
      status:
        row.status === "ditahan" || row.status === "dibatalkan"
          ? row.status
          : "selesai",
    }),
    toRow: (item: Transaction) => ({
      id: item.id,
      code: item.code,
      date: item.date,
      cashier_id: item.cashierId,
      cashier_name: item.cashierName,
      items: item.items,
      subtotal: item.subtotal,
      extra_charge: item.extraCharge,
      total: item.total,
      payment_method: item.paymentMethod,
      cash_received: item.cashReceived ?? null,
      change_amount: item.change ?? null,
      status: item.status,
    }),
  },
  [DB_TABLES.STOCK_MOVEMENTS]: {
    select:
      "id,product_id,product_name,type,qty,reason,date,user_id,user_name",
    fromRow: (row): StockMovement => ({
      id: String(row.id),
      productId: String(row.product_id ?? ""),
      productName: String(row.product_name ?? ""),
      type:
        row.type === "masuk" || row.type === "keluar-transaksi"
          ? row.type
          : "penyesuaian",
      qty: Number(row.qty ?? 0),
      reason: String(row.reason ?? ""),
      date: String(row.date ?? new Date().toISOString()),
      userId: String(row.user_id ?? ""),
      userName: String(row.user_name ?? ""),
    }),
    toRow: (item: StockMovement) => ({
      id: item.id,
      product_id: item.productId,
      product_name: item.productName,
      type: item.type,
      qty: item.qty,
      reason: item.reason,
      date: item.date,
      user_id: item.userId,
      user_name: item.userName,
    }),
  },
  [DB_TABLES.EXPENSES]: {
    select:
      "id,date,created_at,category,amount,note,created_by_user_id,created_by,created_by_role,receipt_image,receipt_image_name",
    fromRow: (row): Expense => ({
      id: String(row.id),
      date: String(row.date ?? new Date().toISOString()),
      createdAt: String(
        row.created_at ?? row.date ?? new Date().toISOString(),
      ),
      category: String(row.category ?? ""),
      amount: Number(row.amount ?? 0),
      note: String(row.note ?? ""),
      createdByUserId: String(row.created_by_user_id ?? ""),
      createdBy: String(row.created_by ?? ""),
      createdByRole: row.created_by_role === "karyawan" ? "karyawan" : "owner",
      receiptImage: row.receipt_image
        ? String(row.receipt_image)
        : undefined,
      receiptImageName: row.receipt_image_name
        ? String(row.receipt_image_name)
        : undefined,
    }),
    toRow: (item: Expense) => ({
      id: item.id,
      date: item.date,
      created_at: item.createdAt ?? item.date,
      category: item.category,
      amount: item.amount,
      note: item.note,
      created_by_user_id: item.createdByUserId,
      created_by: item.createdBy,
      created_by_role: item.createdByRole,
      receipt_image: item.receiptImage ?? null,
      receipt_image_name: item.receiptImageName ?? null,
    }),
  },
  [DB_TABLES.SHIFTS]: {
    select:
      "id,cashier_id,cashier_name,closed_by_cashier_id,closed_by_cashier_name,opened_at,closed_at,opening_cash,total_cash_sales,total_cash_expenses,expected_cash,actual_cash,difference,notes,status",
    fromRow: (row): Shift => ({
      id: String(row.id),
      cashierId: String(row.cashier_id ?? ""),
      cashierName: String(row.cashier_name ?? ""),
      closedByCashierId: row.closed_by_cashier_id
        ? String(row.closed_by_cashier_id)
        : undefined,
      closedByCashierName: row.closed_by_cashier_name
        ? String(row.closed_by_cashier_name)
        : undefined,
      openedAt: String(row.opened_at ?? new Date().toISOString()),
      closedAt: row.closed_at ? String(row.closed_at) : undefined,
      openingCash: Number(row.opening_cash ?? 0),
      totalCashSales:
        row.total_cash_sales === null || row.total_cash_sales === undefined
          ? undefined
          : Number(row.total_cash_sales),
      totalCashExpenses:
        row.total_cash_expenses === null ||
        row.total_cash_expenses === undefined
          ? undefined
          : Number(row.total_cash_expenses),
      expectedCash:
        row.expected_cash === null || row.expected_cash === undefined
          ? undefined
          : Number(row.expected_cash),
      actualCash:
        row.actual_cash === null || row.actual_cash === undefined
          ? undefined
          : Number(row.actual_cash),
      difference:
        row.difference === null || row.difference === undefined
          ? undefined
          : Number(row.difference),
      notes: row.notes ? String(row.notes) : undefined,
      status: row.status === "tutup" ? "tutup" : "buka",
    }),
    toRow: (item: Shift) => ({
      id: item.id,
      cashier_id: item.cashierId,
      cashier_name: item.cashierName,
      closed_by_cashier_id: item.closedByCashierId ?? null,
      closed_by_cashier_name: item.closedByCashierName ?? null,
      opened_at: item.openedAt,
      closed_at: item.closedAt ?? null,
      opening_cash: item.openingCash,
      total_cash_sales: item.totalCashSales ?? null,
      total_cash_expenses: item.totalCashExpenses ?? null,
      expected_cash: item.expectedCash ?? null,
      actual_cash: item.actualCash ?? null,
      difference: item.difference ?? null,
      notes: item.notes ?? null,
      status: item.status,
    }),
  },
  [DB_TABLES.SETTINGS]: {
    select:
      "id,business_name,business_address,business_phone,business_logo,footer_note",
    fromRow: (row): AppSettings => ({
      businessProfile: {
        name: String(row.business_name ?? ""),
        address: String(row.business_address ?? ""),
        phone: String(row.business_phone ?? ""),
        logo: row.business_logo ? String(row.business_logo) : undefined,
        footerNote: String(row.footer_note ?? ""),
      },
    }),
    toRow: (item: AppSettings & { id?: string }) => ({
      id: item.id ?? SETTINGS_ROW_ID,
      business_name: item.businessProfile.name,
      business_address: item.businessProfile.address,
      business_phone: item.businessProfile.phone,
      business_logo: item.businessProfile.logo ?? null,
      footer_note: item.businessProfile.footerNote,
    }),
  },
};

function getTableConfig<T>(table: TableName): TableConfig<T> {
  return tableConfigs[table] as TableConfig<T>;
}

export const storageService = {
  async getAll<T>(table: TableName): Promise<T[]> {
    if (!supabase) return [];
    const config = getTableConfig<T>(table);
    const { data, error } = await supabase.from(table).select(config.select);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => config.fromRow(row as Record<string, unknown>));
  },

  async getOne<T>(table: TableName, id: string): Promise<T | undefined> {
    if (!supabase) return undefined;
    const config = getTableConfig<T>(table);
    const { data, error } = await supabase
      .from(table)
      .select(config.select)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? config.fromRow(data as Record<string, unknown>) : undefined;
  },

  async insert<T>(table: TableName, item: T): Promise<T> {
    const client = requireSupabase();
    const config = getTableConfig<T>(table);
    const { data, error } = await client
      .from(table)
      .insert(config.toRow(item))
      .select(config.select)
      .single();
    if (error) throw new Error(error.message);
    return config.fromRow(data as Record<string, unknown>);
  },

  async update<T>(
    table: TableName,
    id: string,
    patch: Partial<T>,
  ): Promise<T | undefined> {
    const current = await this.getOne<T>(table, id);
    if (!current) return undefined;
    const next = { ...(current as object), ...(patch as object), id } as T;
    const client = requireSupabase();
    const config = getTableConfig<T>(table);
    const { data, error } = await client
      .from(table)
      .update(config.toRow(next))
      .eq("id", id)
      .select(config.select)
      .single();
    if (error) throw new Error(error.message);
    return config.fromRow(data as Record<string, unknown>);
  },

  async remove(table: TableName, id: string): Promise<void> {
    const client = requireSupabase();
    const { error } = await client.from(table).delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async replaceAll<T>(table: TableName, data: T[]): Promise<void> {
    const client = requireSupabase();
    const { error: deleteError } = await client
      .from(table)
      .delete()
      .not("id", "is", null);
    if (deleteError) throw new Error(deleteError.message);
    if (data.length === 0) return;
    const config = getTableConfig<T>(table);
    const rows = data.map((item) => config.toRow(item));
    const { error: insertError } = await client.from(table).insert(rows);
    if (insertError) throw new Error(insertError.message);
  },

  async getObject<T>(table: TableName, id: string, fallback: T): Promise<T> {
    const data = await this.getOne<T>(table, id);
    return data ?? fallback;
  },

  async setObject<T>(table: TableName, id: string, value: T): Promise<T> {
    const client = requireSupabase();
    const config = getTableConfig<T>(table);
    const { data, error } = await client
      .from(table)
      .upsert(config.toRow({ ...(value as object), id } as T))
      .select(config.select)
      .single();
    if (error) throw new Error(error.message);
    return config.fromRow(data as Record<string, unknown>);
  },

  async exportAll(tables: TableName[]): Promise<Record<string, unknown>> {
    const dump: Record<string, unknown> = {};
    for (const table of tables) {
      dump[table] = await this.getAll(table);
    }
    return dump;
  },

  async importAll(dump: Record<string, unknown>): Promise<void> {
    for (const [table, value] of Object.entries(dump)) {
      if (Array.isArray(value) && table in tableConfigs) {
        await this.replaceAll(table as TableName, value as never[]);
      }
    }
  },
};
