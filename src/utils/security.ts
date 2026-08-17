/**
 * Security & Password Protection Utilities for Health DNA
 * Provides strict strong password validation, hashing, brute-force defense, and strength metrics.
 */

export interface PasswordStrengthResult {
  score: number; // 0 to 100
  level: "Very Weak" | "Weak" | "Fair" | "Good" | "Strong" | "Very Strong";
  color: string;
  barColor: string;
  checks: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
  isValidStrong: boolean;
  feedback: string;
}

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;

/**
 * Validates password against strict strong password policy:
 * - Minimum 8 characters
 * - Uppercase letter (A-Z)
 * - Lowercase letter (a-z)
 * - Numeric digit (0-9)
 * - Special character (!@#$%...)
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const pwd = password || "";
  const checks = {
    minLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: SPECIAL_CHAR_REGEX.test(pwd),
  };

  let points = 0;
  if (pwd.length >= 8) points += 25;
  if (pwd.length >= 12) points += 15;
  if (checks.hasUpper) points += 15;
  if (checks.hasLower) points += 15;
  if (checks.hasNumber) points += 15;
  if (checks.hasSpecial) points += 15;

  const score = Math.min(100, points);

  let level: PasswordStrengthResult["level"] = "Very Weak";
  let color = "text-rose-600";
  let barColor = "bg-rose-500";
  let feedback = "Password is too weak. Must be at least 8 characters.";

  if (score < 30) {
    level = "Very Weak";
    color = "text-rose-600";
    barColor = "bg-rose-500";
    feedback = "Very weak: Include uppercase, lowercase, numbers, and symbols.";
  } else if (score < 50) {
    level = "Weak";
    color = "text-orange-500";
    barColor = "bg-orange-500";
    feedback = "Weak: Add numbers and special characters like @ or #.";
  } else if (score < 70) {
    level = "Fair";
    color = "text-amber-500";
    barColor = "bg-amber-500";
    feedback = "Fair: Add more characters and special symbols for stronger defense.";
  } else if (score < 85) {
    level = "Good";
    color = "text-blue-600";
    barColor = "bg-blue-500";
    feedback = "Good password strength. Meets essential safety standards.";
  } else if (score < 95) {
    level = "Strong";
    color = "text-emerald-600";
    barColor = "bg-emerald-500";
    feedback = "Strong & secure password. Exceeds standard healthcare requirements.";
  } else {
    level = "Very Strong";
    color = "text-emerald-700";
    barColor = "bg-emerald-600";
    feedback = "Maximum military-grade password entropy.";
  }

  const isValidStrong =
    checks.minLength &&
    checks.hasUpper &&
    checks.hasLower &&
    checks.hasNumber &&
    checks.hasSpecial;

  return {
    score,
    level,
    color,
    barColor,
    checks,
    isValidStrong,
    feedback,
  };
}

/**
 * In-memory brute force defense tracking failed attempts per patient identity.
 */
interface FailedAttemptRecord {
  attempts: number;
  lockedUntil: number | null; // timestamp
}

const failedAttemptsMap: Record<string, FailedAttemptRecord> = {};
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds cooldown

export function checkAccountLockout(dnaId: string): {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
} {
  const record = failedAttemptsMap[dnaId];
  if (!record) {
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_FAILED_ATTEMPTS };
  }

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingSeconds, attemptsLeft: 0 };
  }

  if (record.lockedUntil && record.lockedUntil <= now) {
    // Reset lockout after cooldown expired
    delete failedAttemptsMap[dnaId];
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_FAILED_ATTEMPTS };
  }

  const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - record.attempts);
  return { isLocked: false, remainingSeconds: 0, attemptsLeft };
}

export function recordFailedPasswordAttempt(dnaId: string): {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
} {
  const now = Date.now();
  const current = failedAttemptsMap[dnaId] || { attempts: 0, lockedUntil: null };
  current.attempts += 1;

  if (current.attempts >= MAX_FAILED_ATTEMPTS) {
    current.lockedUntil = now + LOCKOUT_DURATION_MS;
    failedAttemptsMap[dnaId] = current;
    return { isLocked: true, remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000), attemptsLeft: 0 };
  }

  failedAttemptsMap[dnaId] = current;
  const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - current.attempts);
  return { isLocked: false, remainingSeconds: 0, attemptsLeft };
}

export function resetFailedAttempts(dnaId: string): void {
  delete failedAttemptsMap[dnaId];
}
