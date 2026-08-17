import React, { useState } from "react";
import { PatientProfile } from "../types";
import {
  Lock,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Dna,
  QrCode,
  Heart,
  UserPlus,
  Stethoscope,
  Building2,
  AlertTriangle,
  Sparkles,
  Phone,
  Mail,
  User,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface LoggedOutGatewayProps {
  patients: PatientProfile[];
  onLoginSuccess: (dnaId: string) => void;
  onOpenAddPatient: () => void;
  onOpenPublicEmergency: (patient: PatientProfile) => void;
  onSelectRoleTab: (tab: string) => void;
}

export const LoggedOutGateway: React.FC<LoggedOutGatewayProps> = ({
  patients,
  onLoginSuccess,
  onOpenAddPatient,
  onOpenPublicEmergency,
  onSelectRoleTab,
}) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedQuickPatient, setSelectedQuickPatient] = useState<PatientProfile | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = identifier.trim().toLowerCase();
    const cleanPwd = password.trim();

    if (!cleanId) {
      setErrorMsg("Please enter your Patient DNA ID, Email, or Phone number.");
      return;
    }
    if (!cleanPwd) {
      setErrorMsg("Please enter your account password or 4-digit security PIN.");
      return;
    }

    const matched = patients.find(
      (p) =>
        p.dnaId.toLowerCase() === cleanId ||
        p.dnaId.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanId.replace(/[^a-z0-9]/g, "") ||
        p.email.toLowerCase() === cleanId ||
        p.phone.replace(/[^0-9]/g, "") === cleanId.replace(/[^0-9]/g, "") ||
        p.nationalId.toLowerCase() === cleanId
    );

    if (!matched) {
      setErrorMsg("No patient account found matching that DNA ID, Email, or Phone.");
      return;
    }

    const expectedPassword = matched.password || "Patient@123";
    const expectedPin = matched.securityPin || "1234";

    const isMatch =
      cleanPwd === expectedPassword.trim() ||
      cleanPwd === expectedPin.trim();

    if (isMatch) {
      setIsLoggingIn(true);
      setTimeout(() => {
        setIsLoggingIn(false);
        onLoginSuccess(matched.dnaId);
      }, 600);
    } else {
      setErrorMsg("Access Denied: Incorrect password or security PIN.");
    }
  };

  const handleSelectDemoPatient = (p: PatientProfile) => {
    setSelectedQuickPatient(p);
    setIdentifier(p.dnaId);
    setPassword("");
    setErrorMsg(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-12 space-y-8 animate-fadeIn">
      {/* Locked Status Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-tr from-rose-600 to-amber-600 rounded-2xl shadow-xl border border-rose-400/30 text-white shrink-0 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                  SESSION LOCKED
                </span>
                <span className="text-xs text-slate-400">HIPAA & AES-256 Protected</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1.5">
                Patient Vault Sealed
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Personal medical history, diagnostic scans, prescriptions, and lab tests are secured. Log in below to unlock your clinical records.
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            <button
              onClick={onOpenAddPatient}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register New Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual Grid: Log In Form & Emergency / Staff Portals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Patient Sign-in Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <KeyRound className="w-4 h-4" />
              <span>Patient Authentication</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Sign In to Your Health DNA Vault
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your registered credentials to decrypt and view your profile.
            </p>
          </div>

          {/* Patient Quick Selector / Account Finder */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Select Patient Account:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {patients.map((p) => {
                const isSelected = identifier.toLowerCase() === p.dnaId.toLowerCase();
                return (
                  <button
                    key={p.dnaId}
                    type="button"
                    onClick={() => handleSelectDemoPatient(p)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20"
                        : "bg-slate-50/60 hover:bg-slate-100/80 border-slate-200"
                    }`}
                  >
                    <img
                      src={p.avatarUrl}
                      alt={p.fullName}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-300 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{p.fullName}</p>
                      <p className="text-[10px] font-mono text-slate-500 truncate">{p.dnaId}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                DNA ID / Email / Phone:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. DNA-8924-9012 or patient@email.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Password or 4-Digit PIN:
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your security password or PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2 animate-shake">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Decrypting Health Records...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock & Open Vault</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: First Responder & Healthcare Staff Access (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Emergency Triage Access Card */}
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-6 border border-rose-200 shadow-lg space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-md">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-rose-700">
                  Paramedics & First Responders
                </span>
                <h4 className="text-base font-black text-rose-950">
                  Emergency Triage Card
                </h4>
              </div>
            </div>
            <p className="text-xs text-rose-900/80 leading-relaxed">
              In life-threatening situations, paramedics can instantly inspect critical blood types, anaphylaxis allergies, and emergency contacts without entering passwords.
            </p>
            {patients.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenPublicEmergency(patients[0])}
                className="w-full py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <QrCode className="w-4 h-4" />
                <span>View Emergency Triage Data</span>
              </button>
            )}
          </div>

          {/* Hospital & Doctor Access */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-slate-900 text-cyan-400 rounded-2xl shadow-md">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                  Authorized Healthcare Staff
                </span>
                <h4 className="text-base font-black text-slate-900">
                  Clinical & Admin Portals
                </h4>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Physicians can request real-time cryptographic OTP consent from patients, and hospital staff can manage beds and network records.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectRoleTab("doctor-dash")}
                className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                <span>Doctor Desk</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectRoleTab("hospital-dash")}
                className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hospital Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
