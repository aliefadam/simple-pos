import { access, readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { pbkdf2Sync, randomBytes } from "node:crypto";

const PBKDF2_ITERATIONS = 100_000;
const HASH_ALGORITHM = "sha256";
const KEY_LENGTH = 32;

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
  const args = process.argv.slice(2);
  const envFileIndex = args.findIndex((arg) => arg === "--env-file");
  const modeIndex = args.findIndex((arg) => arg === "--mode");

  if (envFileIndex !== -1 && args[envFileIndex + 1]) {
    return loadSingleEnvFile(args[envFileIndex + 1]);
  }

  const baseEnv = await loadEnvFiles([".env", ".env.local"]);
  const mode =
    (modeIndex !== -1 && args[modeIndex + 1]) ||
    process.env.APP_ENV ||
    process.env.NODE_ENV ||
    baseEnv.APP_ENV ||
    "";

  if (!mode || mode === "local") {
    return baseEnv;
  }

  return loadEnvFiles([
    ".env",
    ".env.local",
    `.env.${mode}`,
    `.env.${mode}.local`,
  ]);
}

async function loadSingleEnvFile(fileName) {
  const content = await readFile(new URL(`../${fileName}`, import.meta.url), "utf8");
  return parseEnv(content);
}

async function loadEnvFiles(fileNames) {
  const env = {};

  for (const fileName of fileNames) {
    const fileUrl = new URL(`../${fileName}`, import.meta.url);

    try {
      await access(fileUrl);
    } catch {
      continue;
    }

    const content = await readFile(fileUrl, "utf8");
    Object.assign(env, parseEnv(content));
  }

  return env;
}

function createCredentials(password) {
  const passwordSalt = randomBytes(16).toString("base64");
  const passwordHash = pbkdf2Sync(
    password,
    Buffer.from(passwordSalt, "base64"),
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    HASH_ALGORITHM,
  ).toString("base64");

  return {
    password: passwordHash,
    password_salt: passwordSalt,
  };
}

async function main() {
  const env = await loadEnvFile();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diisi di file environment.\n" +
        "Anda juga bisa memakai file environment lain, misalnya `node scripts/seed-users.mjs --mode production` atau `--env-file .env.production`.",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const now = new Date().toISOString();
  const users = [
    {
      id: "seed-owner-prabowo",
      name: "Prabowo",
      username: "prabowo",
      role: "owner",
      active: true,
      created_at: now,
      ...createCredentials("123123"),
    },
    {
      id: "seed-karyawan-gibran",
      name: "Gibran",
      username: "gibran",
      role: "karyawan",
      active: true,
      created_at: now,
      ...createCredentials("123123"),
    },
  ];

  for (const user of users) {
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("username", user.username)
      .maybeSingle();

    if (findError) {
      throw new Error(
        `Gagal memeriksa user ${user.username}: ${findError.message}`,
      );
    }

    const payload = existingUser ? { ...user, id: existingUser.id } : user;
    const { error } = await supabase.from("users").upsert(payload, {
      onConflict: "id",
    });

    if (error) {
      throw new Error(`Gagal seed user ${user.username}: ${error.message}`);
    }
  }

  console.log("Seeder user berhasil dijalankan.");
  console.log("owner    : prabowo / 123123");
  console.log("karyawan : gibran / 123123");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
