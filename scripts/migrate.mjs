import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

function parseEnv(content) {
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function loadEnvFile() {
  const content = await readFile(new URL("../.env", import.meta.url), "utf8");
  return parseEnv(content);
}

async function main() {
  const env = await loadEnvFile();
  const connectionString = env.SUPABASE_DB_URL;

  if (!connectionString) {
    throw new Error(
      "SUPABASE_DB_URL belum diisi di file .env.\n" +
        "Ambil dari Supabase Dashboard > Project Settings > Database > Connection string (URI, mode: Session pooler).\n" +
        'Contoh: SUPABASE_DB_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-xx.pooler.supabase.com:5432/postgres"',
    );
  }

  const schemaPath = fileURLToPath(
    new URL("../supabase/schema.sql", import.meta.url),
  );
  const sql = await readFile(schemaPath, "utf8");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    console.log("Menjalankan migrasi dari supabase/schema.sql ...");
    await client.query(sql);
    console.log("Migrasi berhasil dijalankan.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
