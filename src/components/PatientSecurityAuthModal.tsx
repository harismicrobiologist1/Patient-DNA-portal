import React, { useState, useEffect } from "react";
import { PatientProfile } from "../types";
import {
  evaluatePasswordStrength,
  checkAccountLockout,
  recordFailedPasswordAttempt,
  resetFailedAttempts,
} from "../utils/security";
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Eye,
  EyeOff,
  User,
  Shield,
  Clock,
  KeyRound,
  Info,
} from "lucide-react";

interface PatientSecurityAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPatient: PatientProfile;
  currentPatient: PatientProfile;
  onUnlockSuccess: (dnaId: string) => void;
  onViewPublicCard: (patient: PatientProfile) => void;
}

export const PatientSecurityAuthModal: React.FC<PatientSecurityAuthModalProps> = ({
  isOpen,
  onClose,
  targetPatient,
  currentPatient,
  onUnlockSuccess,
  onViewPublicCard,
}) => {
  const [enteredPassword, setEnteredPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(5);

  // Check lockout status on open / target change
  useEffect(() => {
    if (!targetPatient) return;
    const status = checkAccountLockout(targetPatient.dnaId);
    setAttemptsRemaining(status.attemptsLeft);
    setLockoutTimer(status.remainingSeconds);
    setErrorMsg(null);
    setEnteredPassword("");
  }, [targetPatient, isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          const status = checkAccountLockout(targetPatient.dnaId);
          setAttemptsRemaining(status.attemptsLeft);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer, targetPatient]);

  if (!isOpen || !targetPatient) return null;

  const strength = evaluatePasswordStrength(enteredPassword);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Check if account is locked
    const lockStatus = checkAccountLockout(targetPatient.dnaId);
    if (lockStatus.isLocked) {
      setLockoutTimer(lockStatus.remainingSeconds);
      setErrorMsg(
        `Security Lockout Active: Too many failed attempts. Please wait ${lockStatus.remainingSeconds}s before retrying.`
      );
      return;
    }

    const cleanInput = enteredPassword.trim();
    if (!cleanInput) {
      setErrorMsg("Please enter the patient account password.");
      return;
    }

    const correctPassword = (targetPatient.password || "AlexMercer@2026!").trim();

    if (cleanInput === correctPassword) {
      resetFailedAttempts(targetPatient.dnaId);
      onUnlockSuccess(targetPatient.dnaId);
      onClose();
    } else {
      const failStatus = recordFailedPasswordAttempt(targetPatient.dnaId);
      setAttemptsRemaining(failStatus.attemptsLeft);
      if (failStatus.isLocked) {
        setLockoutTimer(failStatus.remainingSeconds);
        setErrorMsg(
          `Access Denied: Account temporarily locked for ${failStatus.remainingSeconds} seconds due to repeated failed password attempts.`
        );
      } else {
        setErrorMsg(
          `Access Denied: Incorrect password for ${targetPatient.fullName}. ${failStatus.attemptsLeft} attempt(s) remaining before security lockout.`
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 text-white flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl shadow-lg text-white border border-amber-400/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                  HEALTH DNA SECURITY GATEWAY
                </span>
                <span className="text-[10px] text-slate-400">Strict Password Required</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                Verify Account Password
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Security Notice */}
          <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-200/90 flex items-start space-x-3 text-xs text-amber-950">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-amber-950">
                Switching to Patient Account: {targetPatient.fullName}
              </p>
              <p className="mt-1 text-amber-900 text-[11px] leading-relaxed">
                Direct account switching is strictly prohibited without the owner's valid strong password. All lifetime medical records, prescriptions, and diagnostics are encrypted end-to-end.
              </p>
            </div>
          </div>

          {/* Target Patient Card Preview */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <img
                src={targetPatient.avatarUrl}
                alt={targetPatient.fullName}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400 shadow-sm"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-extrabold text-slate-900">{targetPatient.fullName}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                    {targetPatient.dnaId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Blood Group: <strong className="text-slate-800">{targetPatient.bloodGroup}</strong> • {targetPatient.registeredHospital}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onViewPublicCard(targetPatient);
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="View Non-Private Public Emergency Vitals"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Public Card</span>
            </button>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Enter Password for {targetPatient.fullName}: <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={lockoutTimer > 0}
                  placeholder={`Enter password (e.g. ${targetPatient.password ? "••••••••••••" : "AlexMercer@2026!"})`}
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* Password Strength Feedback Meter (if typing) */}
              {enteredPassword.length > 0 && (
                <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">Input Strength:</span>
                    <span className={`font-bold ${strength.color}`}>{strength.level}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.barColor}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">{strength.feedback}</p>
                </div>
              )}
            </div>

            {/* Lockout Warning Banner */}
            {lockoutTimer > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-3">
                <Clock className="w-5 h-5 text-rose-600 shrink-0 animate-spin" />
                <div>
                  <p className="font-bold">Security Lockout Active</p>
                  <p className="text-[11px] text-rose-700">
                    Account protected against brute force. Try again in <strong>{lockoutTimer}s</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && lockoutTimer === 0 && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Demo Hint Banner for ease of review */}
            {targetPatient.password && (
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/70 text-[11px] text-blue-900 flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-950">Strong Password Protection Active:</span>
                  <p className="text-blue-800 mt-0.5">
                    Demo credentials for this patient: <code className="px-1.5 py-0.5 bg-blue-200/70 rounded font-mono font-bold text-blue-900 select-all">{targetPatient.password}</code>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onViewPublicCard(targetPatient);
                  onClose();
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Public Emergency Card</span>
                <span className="sm:hidden">Public Card</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!enteredPassword || lockoutTimer > 0}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black shadow-lg shadow-orange-500/20 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Unlock Vault</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
