/**
 * Zero-Knowledge Web Crypto Engine (AES-GCM 256-bit + PBKDF2-SHA256)
 * Native browser-level cryptography using window.crypto.subtle
 * 
 * Guarantees that raw medical records, DNA profiles, and clinical notes
 * are encrypted on the client device before any network or local storage.
 */

export interface EncryptedHealthBlob {
  version: "1.0.0";
  algorithm: "AES-256-GCM";
  kdf: "PBKDF2-SHA256";
  iterations: number;
  salt: string;        // Base64 encoded 16-byte cryptographic salt
  iv: string;          // Base64 encoded 12-byte initialization vector
  ciphertext: string;  // Base64 encoded encrypted payload with 128-bit authentication tag
  checksum: string;    // SHA-256 hash of plaintext for integrity confirmation post-decryption
  timestamp: string;   // ISO-8601 creation timestamp
  metadata: {
    dnaId: string;
    patientNameInitials: string;
    recordTypesIncluded: string[];
    fhirCompatible: boolean;
    encryptedClientPlatform: string;
  };
}

export interface CryptoPerformanceMetrics {
  encryptionTimeMs: number;
  decryptionTimeMs?: number;
  payloadBytes: number;
  ciphertextBytes: number;
}

// Convert ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate random cryptographic bytes
export function getRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
}

// SHA-256 Hex Digest for integrity checks
export async function sha256Hex(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Derives a 256-bit AES-GCM key from a user password using PBKDF2 with SHA-256
 * Standard 100,000 iterations for high brute-force resistance
 */
async function deriveKeyFromPassword(
  password: string,
  saltBytes: Uint8Array,
  iterations = 100000
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts arbitrary JavaScript data objects using AES-GCM 256-bit
 * Returns a self-contained Zero-Knowledge EncryptedHealthBlob
 */
export async function encryptHealthData(
  data: unknown,
  masterPassword: string,
  dnaId: string,
  patientName = "Alex Mercer",
  recordTypes: string[] = ["Profile", "Vitals", "History", "Labs", "Prescriptions"]
): Promise<{ blob: EncryptedHealthBlob; metrics: CryptoPerformanceMetrics }> {
  const startTime = performance.now();

  const jsonString = JSON.stringify(data);
  const plaintextBytes = new TextEncoder().encode(jsonString);
  const checksum = await sha256Hex(jsonString);

  // Generate 16-byte random salt and 12-byte random IV
  const salt = getRandomBytes(16);
  const iv = getRandomBytes(12);

  // Derive AES-GCM-256 key
  const aesKey = await deriveKeyFromPassword(masterPassword, salt, 100000);

  // Encrypt with 128-bit authentication tag (standard in AES-GCM)
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    aesKey,
    plaintextBytes
  );

  const endTime = performance.now();

  // Create initial monogram
  const initials = patientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const blob: EncryptedHealthBlob = {
    version: "1.0.0",
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: 100000,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertextBuffer),
    checksum,
    timestamp: new Date().toISOString(),
    metadata: {
      dnaId,
      patientNameInitials: initials || "PT",
      recordTypesIncluded: recordTypes,
      fhirCompatible: true,
      encryptedClientPlatform: navigator.userAgent.includes("Mac") ? "Client WebKit / Apple Darwin" : "Client Browser WebCrypto",
    },
  };

  const metrics: CryptoPerformanceMetrics = {
    encryptionTimeMs: Math.round((endTime - startTime) * 100) / 100,
    payloadBytes: plaintextBytes.byteLength,
    ciphertextBytes: ciphertextBuffer.byteLength,
  };

  return { blob, metrics };
}

/**
 * Decrypts an EncryptedHealthBlob using the patient's master password
 * Throws a descriptive error if the password is wrong or ciphertext is tampered
 */
export async function decryptHealthData<T = unknown>(
  blob: EncryptedHealthBlob,
  masterPassword: string
): Promise<{ data: T; metrics: CryptoPerformanceMetrics }> {
  const startTime = performance.now();

  try {
    const saltBytes = base64ToBuffer(blob.salt);
    const ivBytes = base64ToBuffer(blob.iv);
    const ciphertextBytes = base64ToBuffer(blob.ciphertext);

    // Derive the exact key
    const aesKey = await deriveKeyFromPassword(masterPassword, saltBytes, blob.iterations || 100000);

    // Decrypt and verify 128-bit GCM tag
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes,
        tagLength: 128,
      },
      aesKey,
      ciphertextBytes
    );

    const decryptedJson = new TextDecoder().decode(decryptedBuffer);

    // Verify SHA-256 integrity checksum
    const computedHash = await sha256Hex(decryptedJson);
    if (blob.checksum && computedHash !== blob.checksum) {
      throw new Error("Integrity verification failed: Ciphertext was tampered or corrupted.");
    }

    const data = JSON.parse(decryptedJson) as T;
    const endTime = performance.now();

    const metrics: CryptoPerformanceMetrics = {
      encryptionTimeMs: 0,
      decryptionTimeMs: Math.round((endTime - startTime) * 100) / 100,
      payloadBytes: decryptedBuffer.byteLength,
      ciphertextBytes: ciphertextBytes.byteLength,
    };

    return { data, metrics };
  } catch (error: any) {
    if (error?.name === "OperationError" || error?.message?.includes("operation failed")) {
      throw new Error("Decryption failed: Invalid master password or authentication tag mismatch.");
    }
    throw error;
  }
}

/**
 * Tests instant string encryption and decryption in memory for interactive sandboxing
 */
export async function testLiveCrypto(
  rawText: string,
  passphrase: string
): Promise<{
  saltHex: string;
  ivHex: string;
  ciphertextBase64: string;
  decryptedText: string;
  timeMs: number;
}> {
  const start = performance.now();
  const salt = getRandomBytes(16);
  const iv = getRandomBytes(12);
  const key = await deriveKeyFromPassword(passphrase, salt, 100000);

  const enc = new TextEncoder();
  const cipher = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    enc.encode(rawText)
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    cipher
  );

  const end = performance.now();
  const decryptedText = new TextDecoder().decode(decrypted);

  const toHex = (buf: Uint8Array) => Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");

  return {
    saltHex: toHex(salt),
    ivHex: toHex(iv),
    ciphertextBase64: bufferToBase64(cipher),
    decryptedText,
    timeMs: Math.round((end - start) * 100) / 100,
  };
}
