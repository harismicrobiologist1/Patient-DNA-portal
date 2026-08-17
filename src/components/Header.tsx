import React from "react";
import { UserRole, PatientProfile } from "../types";
import {
  Dna,
  ShieldCheck,
  Siren,
  User,
  Stethoscope,
  Building2,
  Lock,
  QrCode,
  Users,
  ChevronDown,
  UserPlus,
  LogOut,
  KeyRound,
} from "lucide-react";

interface HeaderProps {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  patient?: PatientProfile | null;
  isAuthenticated?: boolean;
  onOpenEmergencyModal: () => void;
  onOpenDigitalIdModal: () => void;
  onOpenPatientSwitcher: () => void;
  onOpenAddPatient: () => void;
  onOpenPatientLogin?: () => void;
  onLogout?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  patientCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setRole,
  patient,
  isAuthenticated = false,
  onOpenEmergencyModal,
  onOpenDigitalIdModal,
  onOpenPatientSwitcher,
  onOpenAddPatient,
  onOpenPatientLogin,
  onLogout,
  activeTab,
  setActiveTab,
  patientCount = 3,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-xl">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Identity Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab("patient-dash")}
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-lg shadow-blue-500/20 text-white font-bold">
              <Dna className="w-7 h-7 animate-pulse text-cyan-200" />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  PATIENT DNA
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30">
                  HEALTH PASSPORT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Universal Health Identity & Records
              </p>
            </div>
          </div>

          {/* Patient Selection & Quick Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && patient ? (
              <>
                {/* Active Patient Switcher Button */}
                <button
                  onClick={onOpenPatientSwitcher}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-100 border border-slate-700/80 hover:border-cyan-500/50 transition-all text-xs font-semibold shadow-sm group cursor-pointer"
                  title="Click to Switch Patient or Search Network Records"
                >
                  <img
                    src={patient.avatarUrl}
                    alt={patient.fullName}
                    className="w-7 h-7 rounded-xl object-cover ring-2 ring-cyan-500/50"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-white text-xs group-hover:text-cyan-300 transition-colors">
                        {patient.fullName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                        {patient.dnaId}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Active Vault • Verified
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-cyan-300" />
                </button>

                {/* Digital Card Button */}
                <button
                  onClick={onOpenDigitalIdModal}
                  className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all text-xs font-semibold group shadow-sm cursor-pointer"
                  title="Open Digital Patient ID Card"
                >
                  <QrCode className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-xs">{patient.dnaId}</span>
                </button>

                {/* Log Out Button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shadow-sm group cursor-pointer"
                    title={`Log out of ${patient.fullName}'s account`}
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Log Out</span>
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Unauthenticated / Session Locked Indicator */}
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 font-mono">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vaults Encrypted</span>
                </div>

                <button
                  onClick={onOpenPatientLogin}
                  className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/40 text-xs font-black transition-all shadow-lg shadow-blue-500/25 group cursor-pointer"
                  title="Sign in to your Health DNA record"
                >
                  <KeyRound className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition-transform" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={onOpenAddPatient}
                  className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all cursor-pointer"
                  title="Register a new patient account"
                >
                  <UserPlus className="w-3.5 h-3.5 text-cyan-300" />
                  <span>+ Register</span>
                </button>
              </>
            )}
          </div>

          {/* Action Buttons & Emergency Bar */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenEmergencyModal}
              className="relative inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-600/30 border border-red-500/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              title="Emergency Paramedic Access"
            >
              <Siren className="w-4 h-4 text-white animate-bounce" />
              <span className="tracking-wide hidden sm:inline">EMERGENCY ACCESS</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="hidden xl:flex items-center p-1 rounded-xl bg-slate-800 border border-slate-700/70 text-xs">
              <button
                onClick={() => {
                  setRole("patient");
                  setActiveTab("patient-dash");
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  currentRole === "patient"
                    ? "bg-blue-600 text-white shadow-md font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient</span>
              </button>

              <button
                onClick={() => {
                  setRole("doctor");
                  setActiveTab("doctor-dash");
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  currentRole === "doctor"
                    ? "bg-indigo-600 text-white shadow-md font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor</span>
              </button>

              <button
                onClick={() => {
                  setRole("admin");
                  setActiveTab("hospital-dash");
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  currentRole === "admin"
                    ? "bg-purple-600 text-white shadow-md font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospital Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
