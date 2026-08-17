import React, { useState } from "react";
import { PatientProfile } from "../types";
import {
  evaluatePasswordStrength,
  checkAccountLockout,
  recordFailedPasswordAttempt,
  resetFailedAttempts,
} from "../utils/security";
import {
  Lock,
  User,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Dna,
  QrCode,
  Heart,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

interface PatientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: PatientProfile[];
  onLoginSuccess: (dnaId: string) => void;
  onOpenAddPatient: () => void;
  onViewPublicCard: (patient: PatientProfile) => void;
}

export const PatientLoginModal: React.FC<PatientLoginModalProps> = ({
  isOpen,
  onClose,
  patients,
  onLoginSuccess,
  onOpenAddPatient,
  onViewPublicCard,
}) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successPatient, setSuccessPatient] = useState<PatientProfile | null>(null);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(password);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = identifier.trim().toLowerCase();
    const cleanPwd = password.trim();

    if (!cleanId) {
      setErrorMsg("Please enter your Patient DNA ID, registered Email, or Phone number.");
      return;
    }
    if (!cleanPwd) {
      setErrorMsg("Please enter your account password.");
      return;
    }

    // Find patient by DNA ID, Email, Phone, or National ID
    const matched = patients.find(
      (p) =>
        p.dnaId.toLowerCase() === cleanId ||
        p.dnaId.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanId.replace(/[^a-z0-9]/g, "") ||
        p.email.toLowerCase() === cleanId ||
        p.phone.replace(/[^0-9]/g, "") === cleanId.replace(/[^0-9]/g, "") ||
        p.nationalId.toLowerCase() === cleanId
    );

    if (!matched) {
      setErrorMsg("No patient account found matching that DNA ID, Email, or Phone number.");
      return;
    }

    // Check account lockout
    const lockStatus = checkAccountLockout(matched.dnaId);
    if (lockStatus.isLocked) {
      setLockoutTimer(lockStatus.remainingSeconds);
      setErrorMsg(
        `Account Temporarily Locked: Too many failed password attempts. Retry in ${lockStatus.remainingSeconds}s.`
      );
      return;
    }

    const expectedPassword = (matched.password || "AlexMercer@2026!").trim();
    const isMatch = cleanPwd === expectedPassword;

    if (isMatch) {
      resetFailedAttempts(matched.dnaId);
      setSuccessPatient(matched);
      setTimeout(() => {
        onLoginSuccess(matched.dnaId);
        onClose();
        setSuccessPatient(null);
        setIdentifier("");
        setPassword("");
      }, 700);
    } else {
      const failStatus = recordFailedPasswordAttempt(matched.dnaId);
      if (failStatus.isLocked) {
        setLockoutTimer(failStatus.remainingSeconds);
        setErrorMsg(
          `Access Denied: Account locked for ${failStatus.remainingSeconds} seconds due to 5 failed attempts.`
        );
      } else {
        setErrorMsg(
          `Incorrect password. Access denied. (${failStatus.attemptsLeft} attempts remaining before lockout)`
        );
      }
    }
  };

  const handleQuickDemo = (demoPatient: PatientProfile) => {
    setIdentifier(demoPatient.dnaId);
    setPassword(demoPatient.password || "AlexMercer@2026!");
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fadeIn">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl shadow-lg text-white border border-cyan-400/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                  PATIENT SELF-LOGIN
                </span>
                <span className="text-[10px] text-slate-400">Strong Password Protected</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                Log In to Your Medical Record
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

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Enter your <strong>Universal DNA ID</strong> (or registered email/phone) along with your secure account password to access your lifetime health records.
          </p>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Identifier Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient DNA ID, Registered Email, or Phone: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. DNA-8924-9012 or alex.mercer@healthdna.org"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Account Password: <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
              </div>

              {/* Password Strength indicator (if typing) */}
              {password.length > 0 && (
                <div className="mt-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Strength:</span>
                    <span className={`font-bold ${strength.color}`}>{strength.level}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.barColor}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Lockout Warning */}
            {lockoutTimer > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2.5">
                <Clock className="w-5 h-5 text-rose-600 shrink-0 animate-spin" />
                <div>
                  <p className="font-bold">Brute-Force Lockout Active</p>
                  <p className="text-[11px] text-rose-700">Please wait {lockoutTimer}s before retrying.</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {errorMsg && lockoutTimer === 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success State */}
            {successPatient && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Welcome back, <strong>{successPatient.fullName}</strong>! Authenticating...
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!!successPatient || lockoutTimer > 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Log In to Patient Account</span>
            </button>
          </form>

          {/* Fast Demo Switcher */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Quick Test Demo Credentials:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {patients.slice(0, 3).map((demo) => (
                <button
                  key={demo.dnaId}
                  type="button"
                  onClick={() => handleQuickDemo(demo)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all flex flex-col space-y-1 group cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={demo.avatarUrl}
                      alt={demo.fullName}
                      className="w-6 h-6 rounded-lg object-cover"
                    />
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                      {demo.fullName.split(" ")[0]}
                    </p>
                  </div>
                  <p className="text-[9px] font-mono text-slate-500 truncate">
                    {demo.password || "AlexMercer@2026!"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* New Patient Registration Prompt */}
          <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200 flex items-center justify-between text-xs text-cyan-950">
            <div>
              <p className="font-bold">New to Health DNA?</p>
              <p className="text-[11px] text-cyan-800 mt-0.5">
                Register a new lifetime identity with strong password protection.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddPatient();
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              + Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
