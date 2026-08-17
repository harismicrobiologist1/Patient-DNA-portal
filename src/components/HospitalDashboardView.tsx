import React, { useState } from "react";
import { DoctorProfile, AuditLog, PatientProfile } from "../types";
import {
  Building2,
  Users,
  Stethoscope,
  Pill,
  FlaskConical,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Search,
  CheckCircle2,
  Activity,
  Lock,
  UserPlus,
  ArrowRight,
  Heart,
} from "lucide-react";

interface HospitalDashboardViewProps {
  doctors: DoctorProfile[];
  auditLogs: AuditLog[];
  allPatients?: PatientProfile[];
  onSelectPatient?: (dnaId: string) => void;
  onOpenAddPatient?: () => void;
}

export const HospitalDashboardView: React.FC<HospitalDashboardViewProps> = ({
  doctors,
  auditLogs,
  allPatients = [],
  onSelectPatient,
  onOpenAddPatient,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "patients" | "doctors" | "audit">("overview");
  const [patientFilter, setPatientFilter] = useState("");

  const filteredPatients = allPatients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(patientFilter.toLowerCase()) ||
      p.dnaId.toLowerCase().includes(patientFilter.toLowerCase()) ||
      p.registeredHospital.toLowerCase().includes(patientFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title & Stats Overview Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
              <Building2 className="w-7 h-7 text-purple-600" />
              <span>HOSPITAL & SYSTEM ADMIN COMMAND</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Apex National Medical Network • Real-time clinical facility metrics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "overview", label: "Overview & Stats" },
              { id: "patients", label: `Patient Registry (${allPatients.length})` },
              { id: "doctors", label: "Doctors Directory" },
              { id: "audit", label: "Security Audit Logs" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
            <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider block">
              Active Doctors
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">248</p>
            <p className="text-[10px] text-purple-700 font-semibold mt-1">Across 12 Departments</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">
              Registered Patients
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">42,890</p>
            <p className="text-[10px] text-blue-700 font-semibold mt-1">100% DNA ID Linked</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">
              Lab Tests Completed Today
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">1,140</p>
            <p className="text-[10px] text-emerald-700 font-semibold mt-1">Avg 18m turnaround</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block">
              Pharmacy Refill Rate
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">99.4%</p>
            <p className="text-[10px] text-amber-700 font-semibold mt-1">0 Critical shortages</p>
          </div>
        </div>
      </div>

      {/* Overview Module Cards */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pharmacy & Supply */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Pill className="w-5 h-5 text-emerald-600" />
              <span>Pharmacy & Inventory</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <span className="font-semibold text-slate-800">Telmisartan 40mg</span>
                <span className="font-bold text-emerald-700">In Stock (14,200 units)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <span className="font-semibold text-slate-800">Albuterol Inhalers</span>
                <span className="font-bold text-emerald-700">In Stock (840 units)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="font-semibold text-amber-900">Amoxicillin 500mg</span>
                <span className="font-bold text-amber-800">Re-order Warning</span>
              </div>
            </div>
          </div>

          {/* Laboratory & Diagnostics */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FlaskConical className="w-5 h-5 text-cyan-600" />
              <span>Laboratory Queues</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <span className="font-semibold text-slate-800">Blood Chemistry</span>
                <span className="font-bold text-blue-700">12 Pending Review</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <span className="font-semibold text-slate-800">MRI / CT Scans</span>
                <span className="font-bold text-blue-700">4 Active Sessions</span>
              </div>
            </div>
          </div>

          {/* Billing & Insurance Claims */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Billing & Claims</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <span className="font-semibold text-slate-800">Claims Auto-cleared Today</span>
                <span className="font-bold text-emerald-700">$184,200</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <span className="font-semibold text-slate-800">Rejection Rate</span>
                <span className="font-bold text-slate-900">0.02% (Ultra Low)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Directory Tab */}
      {activeTab === "patients" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>UNIVERSAL PATIENT NETWORK REGISTRY</span>
              </h2>
              <p className="text-xs text-slate-500">
                Centralized Electronic Patient Index across hospitals & clinics ({allPatients.length} Active Profiles)
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter by name, DNA ID, or hospital..."
                  value={patientFilter}
                  onChange={(e) => setPatientFilter(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {onOpenAddPatient && (
                <button
                  onClick={onOpenAddPatient}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Register Patient</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatients.map((p) => (
              <div
                key={p.dnaId}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={p.avatarUrl}
                      alt={p.fullName}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-100 border border-slate-200"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-extrabold text-slate-900">{p.fullName}</h3>
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                          {p.dnaId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{p.registeredHospital}</p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-600 font-medium pt-0.5">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span>{p.bloodGroup}</span>
                        </span>
                        <span>•</span>
                        <span>{p.gender}</span>
                        <span>•</span>
                        <span>DOB: {p.dob}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Phone: <strong className="text-slate-700">{p.phone}</strong>
                  </span>
                  {onSelectPatient && (
                    <button
                      onClick={() => onSelectPatient(p.dnaId)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-all"
                    >
                      <span>Open Medical Chart</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctors Directory Tab */}
      {activeTab === "doctors" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-start space-x-4"
            >
              <img
                src={doc.avatarUrl}
                alt={doc.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-100"
              />
              <div className="space-y-1 text-xs">
                <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                <p className="text-purple-700 font-bold">{doc.specialty}</p>
                <p className="text-slate-500">
                  License: <strong className="font-mono text-slate-700">{doc.licenseNumber}</strong> • {doc.experienceYears} Yrs Exp
                </p>
                <p className="text-slate-600 mt-2">
                  Available: <span className="font-bold text-slate-800">{doc.availableDays.join(", ")}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Audit Logs Tab */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <Lock className="w-6 h-6 text-emerald-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  REAL-TIME SECURITY & AUDIT TRAIL
                </h2>
                <p className="text-xs text-slate-500">
                  Cryptographically verified system logs • Cloud Firestore immutable audit ledger
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Breaches Detected</span>
            </span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-mono text-[10px]">
                      {log.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                  <p className="text-[11px] text-slate-400">
                    Actor: <strong className="text-slate-700">{log.actor}</strong> • IP: {log.ipAddress}
                  </p>
                </div>

                <div className="text-right self-end sm:self-auto">
                  <span className="font-mono text-[11px] text-slate-400 block">{log.timestamp}</span>
                  <span className="font-mono text-[10px] text-emerald-700 font-bold block mt-0.5">
                    {log.securityHash}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
