/**
 * Session Security & Inactivity Timeout Manager
 * Compliant with HIPAA & Healthcare EHR Electronic Security Protocols:
 * - Auto-locks after configured minutes of inactivity
 * - Requires re-authentication when freshly opening the app / new session
 * - Displays a live warning countdown before auto-locking
 * - Provides instant one-click manual vault locking
 */

export const SESSION_ACTIVE_KEY = "health_dna_active_session_v3";
export const REMEMBERED_PATIENT_KEY = "health_dna_remembered_patient_v3";
export const TIMEOUT_CONFIG_KEY = "health_dna_inactivity_timeout_seconds";
export const SESSION_EXPIRED_REASON_KEY = "health_dna_session_expired_reason";

// Standard healthcare clinical inactivity timeout options (in seconds)
export const INACTIVITY_TIMEOUT_OPTIONS = [
  { label: "2 Minutes (Maximum Security / Public Kiosk)", seconds: 120 },
  { label: "5 Minutes (Clinical Standard - HIPAA)", seconds: 300, default: true },
  { label: "10 Minutes (Extended Consultation)", seconds: 600 },
  { label: "15 Minutes (Hospital Ward Access)", seconds: 900 },
];

export const DEFAULT_INACTIVITY_TIMEOUT_SECONDS = 300; // 5 minutes
export const WARNING_DURATION_SECONDS = 30; // 30 seconds countdown before auto-lock

export interface SessionData {
  dnaId: string;
  patientName?: string;
  loggedInAt: number;
  lastActiveAt: number;
  isRemembered?: boolean;
  timeoutSeconds: number;
}

/**
 * Retrieves the preferred inactivity timeout setting (in seconds)
 */
export function getStoredInactivityTimeout(): number {
  try {
    const stored = localStorage.getItem(TIMEOUT_CONFIG_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 60) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read timeout setting:", e);
  }
  return DEFAULT_INACTIVITY_TIMEOUT_SECONDS;
}

/**
 * Saves user's preferred inactivity timeout setting
 */
export function setStoredInactivityTimeout(seconds: number): void {
  try {
    localStorage.setItem(TIMEOUT_CONFIG_KEY, seconds.toString());
  } catch (e) {
    console.warn("Could not save timeout setting:", e);
  }
}

/**
 * Initializes a new active session upon successful authentication
 */
export function createActiveSession(dnaId: string, patientName?: string, remember = false): SessionData {
  const now = Date.now();
  const timeoutSeconds = getStoredInactivityTimeout();
  
  const session: SessionData = {
    dnaId,
    patientName,
    loggedInAt: now,
    lastActiveAt: now,
    isRemembered: remember,
    timeoutSeconds,
  };

  try {
    // Write to sessionStorage (transient per browser tab/session)
    sessionStorage.setItem(SESSION_ACTIVE_KEY, JSON.stringify(session));

    if (remember) {
      // Remember only the identifier for pre-filling, not an automatic bypass
      localStorage.setItem(
        REMEMBERED_PATIENT_KEY,
        JSON.stringify({ dnaId, patientName, lastRememberedAt: now })
      );
    } else {
      localStorage.removeItem(REMEMBERED_PATIENT_KEY);
    }

    // Clear any previous session expiration notification
    sessionStorage.removeItem(SESSION_EXPIRED_REASON_KEY);
  } catch (e) {
    console.warn("Could not write active session:", e);
  }

  return session;
}

/**
 * Updates the last active timestamp for the session
 */
export function touchActiveSession(): void {
  try {
    const raw = sessionStorage.getItem(SESSION_ACTIVE_KEY);
    if (!raw) return;
    const session: SessionData = JSON.parse(raw);
    session.lastActiveAt = Date.now();
    sessionStorage.setItem(SESSION_ACTIVE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn("Could not touch session:", e);
  }
}

/**
 * Validates whether the active session is still valid or has expired due to inactivity
 */
export function validateCurrentSession(): { isValid: boolean; session: SessionData | null; reason?: string } {
  try {
    const raw = sessionStorage.getItem(SESSION_ACTIVE_KEY);
    if (!raw) {
      return { isValid: false, session: null };
    }

    const session: SessionData = JSON.parse(raw);
    if (!session || !session.dnaId) {
      return { isValid: false, session: null };
    }

    const now = Date.now();
    const timeoutMs = (session.timeoutSeconds || DEFAULT_INACTIVITY_TIMEOUT_SECONDS) * 1000;
    const elapsedInactive = now - session.lastActiveAt;

    if (elapsedInactive > timeoutMs) {
      // Session has expired due to inactivity
      sessionStorage.removeItem(SESSION_ACTIVE_KEY);
      sessionStorage.setItem(
        SESSION_EXPIRED_REASON_KEY,
        "Your session expired after several minutes of inactivity for HIPAA patient data security. Please sign in again."
      );
      return {
        isValid: false,
        session: null,
        reason: "Inactivity timeout reached.",
      };
    }

    return { isValid: true, session };
  } catch (e) {
    console.warn("Could not validate session:", e);
    return { isValid: false, session: null };
  }
}

/**
 * Terminates and clears the current active session
 */
export function terminateActiveSession(reason?: string): void {
  try {
    sessionStorage.removeItem(SESSION_ACTIVE_KEY);
    if (reason) {
      sessionStorage.setItem(SESSION_EXPIRED_REASON_KEY, reason);
    }
  } catch (e) {
    console.warn("Could not terminate session:", e);
  }
}

/**
 * Checks for a pending expiration notice message to display on the login page
 */
export function getAndClearExpirationNotice(): string | null {
  try {
    const reason = sessionStorage.getItem(SESSION_EXPIRED_REASON_KEY);
    if (reason) {
      sessionStorage.removeItem(SESSION_EXPIRED_REASON_KEY);
      return reason;
    }
  } catch (e) {
    console.warn("Could not read expiration notice:", e);
  }
  return null;
}

/**
 * Retrieves the remembered patient identifier if previously saved
 */
export function getRememberedPatient(): { dnaId: string; patientName?: string } | null {
  try {
    const raw = localStorage.getItem(REMEMBERED_PATIENT_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not read remembered patient:", e);
  }
  return null;
}
