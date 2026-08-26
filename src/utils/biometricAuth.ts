/**
 * WebAuthn & Biometric Sensor Integration Helper
 * Provides real platform authenticator invocation (FaceID, TouchID, Windows Hello, Android Biometrics)
 * with tactile Web Audio feedback and haptic vibration.
 */

// Play realistic biometric scanner sound effects using Web Audio API
export function playBiometricSound(type: "scan_start" | "scanning" | "success" | "denied"): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === "scan_start") {
      // Gentle dual-frequency chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "success") {
      // Harmonic success chime (A5 -> C#6 -> E6)
      const frequencies = [880, 1108.73, 1318.51];
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.06);
        gain.gain.setValueAtTime(0.1, now + index * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.25);
      });
    } else if (type === "denied") {
      // Low buzz tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // AudioContext may be blocked before first user gesture, fail silently
  }
}

// Trigger device haptic vibration
export function triggerHaptic(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Silently continue if vibration is unsupported or disabled
  }
}

// Check if device supports hardware platform biometrics (FaceID / TouchID / Windows Hello)
export async function checkPlatformAuthenticatorAvailability(): Promise<{
  isAvailable: boolean;
  type: string;
}> {
  try {
    if (
      typeof window !== "undefined" &&
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
    ) {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) {
        // Detect likely platform
        const ua = navigator.userAgent.toLowerCase();
        let name = "Biometric Sensor";
        if (ua.includes("iphone") || ua.includes("ipad")) {
          name = "Apple FaceID / TouchID";
        } else if (ua.includes("mac")) {
          name = "Touch ID / Apple Biometrics";
        } else if (ua.includes("windows")) {
          name = "Windows Hello Fingerprint / Face";
        } else if (ua.includes("android")) {
          name = "Android Biometric Prompt";
        }
        return { isAvailable: true, type: name };
      }
    }
  } catch (e) {
    console.debug("WebAuthn check not available in iframe sandbox:", e);
  }
  return { isAvailable: false, type: "Simulated Optical Biometric Sensor" };
}

// Attempt real WebAuthn hardware biometric authentication
export async function requestHardwareBiometricAuth(
  patientDnaId: string,
  patientName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (
      typeof window !== "undefined" &&
      window.PublicKeyCredential &&
      navigator.credentials &&
      navigator.credentials.get
    ) {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userId = new Uint8Array(Array.from(patientDnaId).map((c) => c.charCodeAt(0)));

      // Note: In an iframe or standard sandbox, credentials.create/get might throw NotAllowedError.
      // We catch this gracefully and fallback to simulated optical scan.
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: "preferred",
        rpId: window.location.hostname || "localhost",
      };

      try {
        const assertion = await navigator.credentials.get({
          publicKey: publicKeyOptions,
        });

        if (assertion) {
          playBiometricSound("success");
          triggerHaptic([40, 60, 40]);
          return { success: true };
        }
      } catch (authErr: unknown) {
        console.debug("Native WebAuthn prompt completed/skipped:", authErr);
      }
    }
  } catch (err: unknown) {
    console.debug("WebAuthn API unavailable or sandboxed:", err);
  }

  return { success: false, error: "Native prompt skipped or unavailable" };
}
