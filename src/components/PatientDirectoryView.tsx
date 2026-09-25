import React, { useState } from "react";
import { PatientProfile, UserRole } from "../types";
import {
  Users,
  Search,
  UserPlus,
  QrCode,
  ShieldCheck,
  Building,
  Heart,
  Calendar,
  Phone,
  Lock,
  Sparkles,
  RefreshCw,
  Database,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Globe,
  Activity,
  BadgeAlert,
  Dna,
  X,
  Fingerprint,
} from "lucide-react";

interface PatientDirectoryViewProps {
  allPatients: PatientProfile[];
  activePatientId?: string;
  currentRole: UserRole;
  onSelectPatient: (dnaId: string) => void;
  onOpenAddPatient: () => void;
  onViewPublicCard: (patient: PatientProfile) => void;
  onRefresh?: () => void;
}

export const PatientDirectoryView: React.FC<PatientDirectoryViewProps> = ({
  allPatients,
  activePatientId,
  currentRole,
  onSelectPatient,
  onOpenAddPatient,
  onViewPublicCard,
  onRefresh,
}) => {
  const [dnaIdSearch, setDnaIdSearch] = useState("");
  const [generalSearch, setGeneralSearch] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Sort patients: Put newly registered ones and active ones first, followed by others
  const sortedPatients = [...allPatients].sort((a, b) => {
    if (a.dnaId === activePatientId) return -1;
    if (b.dnaId === activePatientId) return 1;
    // Newest DNA IDs tend to have larger numbers or were added later
    return b.dnaId.localeCompare(a.dnaId);
  });

  const filtered = sortedPatients.filter((p) => {
    // 1. Dedicated DNA ID Search (case-insensitive, normalized punctuation-agnostic)
    if (dnaIdSearch.trim()) {
      const targetQuery = dnaIdSearch.trim().toLowerCase();
      const cleanTarget = targetQuery.replace(/[^a-z0-9]/g, "");
      const patientDnaLower = p.dnaId.toLowerCase();
      const patientDnaClean = patientDnaLower.replace(/[^a-z0-9]/g, "");

      const matchesDna =
        patientDnaLower.includes(targetQuery) ||
        (cleanTarget.length > 0 && patientDnaClean.includes(cleanTarget));

      if (!matchesDna) return false;
    }

    // 2. Name or General Search
    if (generalSearch.trim()) {
      const kw = generalSearch.trim().toLowerCase();
      const matchesGeneral =
        p.fullName.toLowerCase().includes(kw) ||
        p.phone.includes(kw) ||
        p.registeredHospital.toLowerCase().includes(kw) ||
        p.bloodGroup.toLowerCase().includes(kw) ||
        (p.address && p.address.toLowerCase().includes(kw)) ||
        (p.nationalId && p.nationalId.toLowerCase().includes(kw));

      if (!matchesGeneral) return false;
    }

    // 3. Blood Group Filter
    if (selectedBloodGroup !== "ALL") {
      if (!p.bloodGroup.toUpperCase().includes(selectedBloodGroup.toUpperCase())) {
        return false;
      }
    }

    return true;
  });

  const bloodGroups = ["ALL", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const organDonorsCount = allPatients.filter((p) => p.organDonorStatus).length;
  const verifiedCount = allPatients.filter((p) => p.biometricStatus === "Verified").length;

  // Registered DNA ID suggestions for quick one-click lookup testing
  const quickDnaList = allPatients.slice(0, 6).map((p) => p.dnaId);

  const hasActiveFilters = dnaIdSearch.trim().length > 0 || generalSearch.trim().length > 0 || selectedBloodGroup !== "ALL";

  const handleResetFilters = () => {
    setDnaIdSearch("");
    setGeneralSearch("");
    setSelectedBloodGroup("ALL");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Directory Banner Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
              <Database className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-time Global Cloud Database (Firestore Live Sync)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Universal Patient Directory
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore and search all registered health identity profiles in the universal network. Every new registration across any phone, tablet, or hospital is instantly synchronized here in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onRefresh && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
                title="Sync from Live Cloud Database"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
                <span>{isRefreshing ? "Syncing..." : "Sync Live Cloud"}</span>
              </button>
            )}

            <button
              onClick={onOpenAddPatient}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register New Patient</span>
            </button>
          </div>
        </div>

        {/* Global Directory Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3.5 border border-slate-700/50">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Registered</span>
            <div className="text-2xl font-black text-white mt-1 flex items-baseline space-x-1.5">
              <span>{allPatients.length}</span>
              <span className="text-xs text-cyan-400 font-normal">Patients</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3.5 border border-slate-700/50">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Biometrics Verified</span>
            <div className="text-2xl font-black text-emerald-400 mt-1 flex items-baseline space-x-1.5">
              <span>{verifiedCount}</span>
              <span className="text-xs text-slate-400 font-normal">/ {allPatients.length}</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3.5 border border-slate-700/50">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Organ Donors</span>
            <div className="text-2xl font-black text-rose-400 mt-1 flex items-baseline space-x-1.5">
              <span>{organDonorsCount}</span>
              <span className="text-xs text-slate-400 font-normal">Pledged</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3.5 border border-slate-700/50">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Cloud Sync Status</span>
            <div className="text-sm font-bold text-emerald-300 mt-2 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live & Persistent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/90 space-y-5">
        {/* 1. Primary Dedicated DNA ID Search Input Field */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Dna className="w-4 h-4 animate-pulse" />
              </div>
              <label htmlFor="dna-id-search-input" className="text-xs sm:text-sm font-extrabold text-white tracking-wide flex items-center space-x-2">
                <span>Search by Unique DNA ID String</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                  Exact & Sequence Search
                </span>
              </label>
            </div>

            {dnaIdSearch.trim() && (
              <div className="flex items-center space-x-2 text-xs">
                {filtered.length > 0 ? (
                  <span className="text-emerald-400 font-bold flex items-center space-x-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{filtered.length} {filtered.length === 1 ? "record" : "records"} matched DNA ID</span>
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center space-x-1 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>No DNA ID matches "{dnaIdSearch}"</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute left-3.5 top-3 text-cyan-400 pointer-events-none">
              <Dna className="w-5 h-5" />
            </div>

            <input
              id="dna-id-search-input"
              type="text"
              placeholder="Enter unique DNA ID string (e.g. DNA-8924-9012, US-9821, PK-8819)..."
              value={dnaIdSearch}
              onChange={(e) => setDnaIdSearch(e.target.value)}
              className="w-full pl-11 pr-24 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 hover:border-cyan-500/60 focus:border-cyan-400 text-cyan-100 placeholder:text-slate-500 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all shadow-inner uppercase tracking-wider"
              autoComplete="off"
              spellCheck="false"
            />

            <div className="absolute right-2.5 top-2.5 flex items-center space-x-1.5">
              {dnaIdSearch ? (
                <button
                  type="button"
                  onClick={() => setDnaIdSearch("")}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  title="Clear DNA ID search"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              ) : (
                <span className="hidden sm:inline-flex px-2 py-1 rounded-lg bg-slate-800/80 text-slate-400 text-[10px] font-mono font-medium border border-slate-700/50">
                  DNA-XXXX-XXXX
                </span>
              )}
            </div>
          </div>

          {/* Quick-Select DNA ID Chips for Rapid One-Click Testing */}
          {quickDnaList.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400 font-medium mr-1 flex items-center space-x-1">
                <Fingerprint className="w-3 h-3 text-cyan-400" />
                <span>Quick DNA ID Chips:</span>
              </span>
              {quickDnaList.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDnaIdSearch(id)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer border ${
                    dnaIdSearch.toUpperCase() === id.toUpperCase()
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm shadow-cyan-500/50"
                      : "bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border-slate-700 hover:border-cyan-500/40"
                  }`}
                  title={`Search for DNA ID: ${id}`}
                >
                  {id}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Secondary General Search & Blood Group Filter Row */}
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between pt-1">
          {/* General Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by patient name, phone, hospital, or address..."
              value={generalSearch}
              onChange={(e) => setGeneralSearch(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white transition-colors"
            />
            {generalSearch && (
              <button
                type="button"
                onClick={() => setGeneralSearch("")}
                className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Blood Group Filter Chips */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <span className="flex items-center space-x-1 text-slate-400 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Blood:</span>
            </span>
            <div className="flex gap-1 shrink-0">
              {bloodGroups.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSelectedBloodGroup(bg)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    selectedBloodGroup === bg
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors shrink-0 ml-1 cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Informative notice for patients */}
        {currentRole === "patient" && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>HIPAA Privacy Protection:</strong> Patient vaults are encrypted. To view another patient's medical history, prescriptions, and lab tests, their account password or PIN is required. Public emergency medical cards remain freely readable.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Directory Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <Users className="w-14 h-14 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No Patient Profiles Match Your Search</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords, clearing blood group filters, or create a new patient account to immediately appear in the registry.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenAddPatient}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register New Patient</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((patient) => {
            const isActive = patient.dnaId === activePatientId;
            const isDemoRoot = patient.dnaId === "DNA-1629-3931";
            const isDnaMatched =
              dnaIdSearch.trim().length > 0 &&
              (patient.dnaId.toLowerCase().includes(dnaIdSearch.toLowerCase().trim()) ||
                patient.dnaId.toLowerCase().replace(/[^a-z0-9]/g, "").includes(dnaIdSearch.toLowerCase().replace(/[^a-z0-9]/g, "")));

            return (
              <div
                key={patient.dnaId}
                className={`bg-white rounded-3xl p-5 border transition-all duration-200 hover:shadow-xl flex flex-col justify-between relative group ${
                  isDnaMatched
                    ? "border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg bg-cyan-50/10"
                    : isActive
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md bg-blue-50/20"
                    : "border-slate-200/90 hover:border-blue-300"
                }`}
              >
                {/* Status Badges */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span
                      className={`px-2.5 py-1 rounded-xl font-mono text-[11px] font-black border transition-all ${
                        isDnaMatched
                          ? "bg-cyan-500 text-slate-950 border-cyan-400 ring-2 ring-cyan-400/40 shadow-sm"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {patient.dnaId}
                    </span>

                    {isDnaMatched && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-800 font-extrabold text-[10px] border border-cyan-500/30 flex items-center space-x-1">
                        <Dna className="w-3 h-3 text-cyan-600 animate-pulse" />
                        <span>DNA MATCH</span>
                      </span>
                    )}

                    {!isDemoRoot && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-bold text-[10px] border border-emerald-500/20 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        <span>REGISTERED</span>
                      </span>
                    )}
                  </div>

                  {isActive ? (
                    <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-extrabold text-[10px] shadow-sm flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>YOUR ACTIVE VAULT</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                      Network Record
                    </span>
                  )}
                </div>

                {/* Profile Main Info */}
                <div className="flex items-start space-x-3.5 mb-4">
                  <img
                    src={patient.avatarUrl}
                    alt={patient.fullName}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate group-hover:text-blue-600 transition-colors">
                      {patient.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1.5">
                      <span>{patient.gender}</span>
                      <span>•</span>
                      <span>DOB: {patient.dob}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 truncate mt-1 flex items-center space-x-1">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{patient.registeredHospital}</span>
                    </p>
                  </div>
                </div>

                {/* Medical Attributes Badges */}
                <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-[11px] mb-4">
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Blood: <strong className="font-bold text-slate-900">{patient.bloodGroup}</strong></span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Bio: <strong className="font-bold text-slate-900">{patient.biometricStatus}</strong></span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate font-mono">{patient.phone}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">{patient.organDonorStatus ? "Organ Donor (Yes)" : "Non-Donor"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onViewPublicCard(patient)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    title="View Paramedic & Emergency Medical Card without password"
                  >
                    <QrCode className="w-3.5 h-3.5 text-slate-500" />
                    <span>Emergency Card</span>
                  </button>

                  <button
                    onClick={() => onSelectPatient(patient.dnaId)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
                      isActive
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active Vault</span>
                      </>
                    ) : (
                      <>
                        <span>Open Vault</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
