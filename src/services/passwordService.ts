const encoder = new TextEncoder();
const PBKDF2_ITERATIONS = 100_000;
const HASH_ALGORITHM = "SHA-256";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function deriveHash(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: base64ToBytes(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    key,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

export const passwordService = {
  generateSalt(): string {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return bytesToBase64(salt);
  },

  async hashPassword(password: string, salt: string): Promise<string> {
    return deriveHash(password, salt);
  },

  async createCredentials(password: string): Promise<{
    password: string;
    passwordSalt: string;
  }> {
    const passwordSalt = this.generateSalt();
    const hashedPassword = await this.hashPassword(password, passwordSalt);
    return {
      password: hashedPassword,
      passwordSalt,
    };
  },

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
    passwordSalt?: string,
  ): Promise<boolean> {
    if (!passwordSalt) {
      return plainPassword === hashedPassword;
    }
    const computedHash = await this.hashPassword(plainPassword, passwordSalt);
    return computedHash === hashedPassword;
  },
};
