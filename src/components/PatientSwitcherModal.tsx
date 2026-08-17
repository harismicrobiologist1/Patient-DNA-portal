import React, { useState } from "react";
import { PatientProfile, UserRole } from "../types";
import {
  Users,
  Search,
  Check,
  UserPlus,
  X,
  QrCode,
  ShieldCheck,
  Building,
  Heart,
  Calendar,
  Phone,
  Lock,
  KeyRound,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface PatientSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: PatientProfile[];
  activePatientId: string;
  currentRole?: UserRole;
  onSelectPatient: (dnaId: string) => void;
  onOpenAddPatient: () => void;
  onViewPublicCard?: (patient: PatientProfile) => void;
  onRequestUnlockPatient?: (patient: PatientProfile) => void;
}

export const PatientSwitcherModal: React.FC<PatientSwitcherModalProps> = ({
  isOpen,
  onClose,
  patients,
  activePatientId,
  currentRole = "patient",
  onSelectPatient,
  onOpenAddPatient,
  onViewPublicCard,
  onRequestUnlockPatient,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.dnaId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.registeredHospital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePatientCardClick = (p: PatientProfile) => {
    if (p.dnaId === activePatientId) {
      onClose();
      return;
    }

    if (currentRole === "patient") {
      // Patient trying to switch to another patient's account MUST provide valid strong password
      if (onRequestUnlockPatient) {
        onClose();
        onRequestUnlockPatient(p);
      } else {
        onSelectPatient(p.dnaId);
        onClose();
      }
    } else {
      // Doctor or Admin
      onSelectPatient(p.dnaId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black tracking-tight">Patient Directory & Switcher</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                  {patients.length} REGISTERED FOR LIFE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentRole === "patient"
                  ? "Direct switching is protected • Account password required to switch"
                  : "Select active patient record for clinical consultation"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onOpenAddPatient();
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register New</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Policy Reminder Banner */}
        {currentRole === "patient" && (
          <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200/80 flex items-center space-x-2 text-[11px] text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Zero Direct Switching Policy:</strong> You must know and enter the account password to switch between patient vaults.
            </span>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search patients by name, DNA ID (e.g. DNA-8924), blood group, phone, or hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Patient Cards List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No patient profiles found</p>
              <p className="text-xs text-slate-400">Try searching with a different name or DNA ID</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddPatient();
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs inline-flex items-center space-x-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Patient Profile Now</span>
              </button>
            </div>
          ) : (
            filteredPatients.map((p) => {
              const isSelected = p.dnaId === activePatientId;
              return (
                <div
                  key={p.dnaId}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? "bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500"
                      : "bg-white border-slate-200/90 hover:border-blue-300 hover:bg-slate-50/70"
                  }`}
                >
                  <div
                    onClick={() => handlePatientCardClick(p)}
                    className="flex items-center space-x-4 cursor-pointer flex-1"
                  >
                    <div className="relative">
                      <img
                        src={p.avatarUrl}
                        alt={p.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                      />
                      {!isSelected && currentRole === "patient" && (
                        <div
                          className="absolute -top-1 -right-1 p-1 bg-amber-500 text-white rounded-full shadow-sm"
                          title="Password Protected Private Vault"
                        >
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-extrabold text-slate-900">{p.fullName}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                          {p.dnaId}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider">
                            CURRENT ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
                        <span className="flex items-center space-x-1 font-semibold text-slate-700">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span>{p.bloodGroup}</span>
                        </span>
                        <span>•</span>
                        <span>{p.gender}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{p.registeredHospital}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this patient card */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {/* View Public Digital Card button */}
                    {onViewPublicCard && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onViewPublicCard(p);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
                        title="View Public Digital Emergency Card"
                      >
                        <QrCode className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Public Card</span>
                      </button>
                    )}

                    {isSelected ? (
                      <div className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center space-x-1 shadow-sm">
                        <Check className="w-4 h-4" />
                        <span>Active</span>
                      </div>
                    ) : currentRole === "patient" ? (
                      <button
                        type="button"
                        onClick={() => handlePatientCardClick(p)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                        title="Enter Account Password to Switch"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Verify Password</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePatientCardClick(p)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center space-x-1 shadow-sm cursor-pointer"
                      >
                        <span>Select Patient</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total Registered Lifetime Profiles: <strong>{patients.length}</strong>
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenAddPatient();
            }}
            className="text-blue-600 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Register New Patient Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
