import React, { useState } from "react";
import { PatientProfile, MedicalHistory } from "../types";
import { QRCodeGenerator } from "./QRCodeGenerator";
import {
  Siren,
  Heart,
  AlertTriangle,
  PhoneCall,
  ShieldCheck,
  X,
  Pill,
  Radio,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface EmergencyAccessModalProps {
  patient?: PatientProfile | null;
  history?: MedicalHistory | null;
  allPatients?: PatientProfile[];
  isOpen: boolean;
  onClose: () => void;
  onSelectEmergencyPatient?: (patient: PatientProfile) => void;
}

export const EmergencyAccessModal: React.FC<EmergencyAccessModalProps> = ({
  patient: initialPatient,
  history: initialHistory,
  allPatients = [],
  isOpen,
  onClose,
  onSelectEmergencyPatient,
}) => {
  const [dispatchAlertSent, setDispatchAlertSent] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(initialPatient || null);
  const [searchDnaId, setSearchDnaId] = useState("");

  // Sync selected patient if initialPatient changes
  React.useEffect(() => {
    if (initialPatient) {
      setSelectedPatient(initialPatient);
    }
  }, [initialPatient]);

  if (!isOpen) return null;

  const currentPatient = selectedPatient || (allPatients.length > 0 ? allPatients[0] : null);

  const handleSimulateDispatch = () => {
    setDispatchAlertSent(true);
    setTimeout(() => setDispatchAlertSent(false), 4000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchDnaId.trim()) return;
    const found = allPatients.find(
      (p) =>
        p.dnaId.toLowerCase() === searchDnaId.trim().toLowerCase() ||
        p.dnaId.toLowerCase().replace(/[^a-z0-9]/g, "") === searchDnaId.trim().toLowerCase().replace(/[^a-z0-9]/g, "") ||
        p.fullName.toLowerCase().includes(searchDnaId.trim().toLowerCase())
    );
    if (found) {
      setSelectedPatient(found);
      if (onSelectEmergencyPatient) onSelectEmergencyPatient(found);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-red-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl max-w-3xl w-full border-2 border-red-600 text-white shadow-2xl relative overflow-hidden my-8 animate-fadeIn">
        {/* Top Emergency Siren Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-4 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white text-red-600 rounded-2xl animate-bounce shadow-md">
              <Siren className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded-md text-red-100">
                  CRITICAL MODE
                </span>
                <span className="text-xs text-red-100">PARAMEDIC / ER PROTOCOL</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                EMERGENCY MEDICAL PASSPORT
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dispatch Alert Confirmation Bar */}
        {dispatchAlertSent && (
          <div className="bg-emerald-500 text-slate-950 px-6 py-2.5 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                EMERGENCY DISPATCH SIGNAL BROADCASTED • GPS Coordinates sent to Trauma Center
              </span>
            </span>
            <span className="font-mono text-[10px]">ETA 4 Mins</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Lookup Bar if multi-patients available */}
          {allPatients.length > 0 && (
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Search patient by DNA ID or Name (e.g., DNA-8924-9012)..."
                value={searchDnaId}
                onChange={(e) => setSearchDnaId(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
              >
                Search
              </button>
            </form>
          )}

          {currentPatient ? (
            <>
              {/* Patient Header Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={currentPatient.avatarUrl}
                    alt={currentPatient.fullName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-red-500 shadow-md"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">{currentPatient.fullName}</h3>
                    <p className="text-xs font-mono font-bold text-cyan-300">
                      {currentPatient.dnaId} • DOB: {currentPatient.dob}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Registered: {currentPatient.registeredHospital}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-red-600/20 border border-red-500/40 text-center min-w-[120px] self-end sm:self-auto">
                  <span className="text-[10px] text-red-300 font-bold uppercase block">
                    Blood Group
                  </span>
                  <span className="text-2xl font-black text-red-400 block flex items-center justify-center space-x-1 mt-0.5">
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    <span>{currentPatient.bloodGroup}</span>
                  </span>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Critical Allergies & Meds */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 space-y-2">
                    <span className="text-xs font-extrabold uppercase text-rose-300 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>CRITICAL ALLERGIES & WARNINGS</span>
                    </span>
                    <div className="space-y-1 text-xs">
                      {currentPatient.chronicConditions && currentPatient.chronicConditions.length > 0 ? (
                        currentPatient.chronicConditions.map((cond, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-rose-900/40 border border-rose-800/80 text-rose-100 flex items-center justify-between">
                            <span className="font-bold">{cond}</span>
                            <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-extrabold">
                              CRITICAL
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 text-xs">No known chronic allergies recorded.</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wider block flex items-center space-x-1.5">
                      <Pill className="w-4 h-4 text-cyan-400" />
                      <span>Paramedic Notes</span>
                    </span>
                    <p className="text-slate-300">
                      Donor Status: {currentPatient.organDonorStatus ? "Registered Organ Donor" : "Standard"}
                    </p>
                    <p className="text-slate-400">
                      National ID: {currentPatient.nationalId}
                    </p>
                  </div>
                </div>

                {/* Right: Emergency Contacts & Dispatch */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wider block flex items-center space-x-1.5">
                      <PhoneCall className="w-4 h-4 text-red-400" />
                      <span>Immediate Emergency Contacts</span>
                    </span>
                    {currentPatient.emergencyContacts && currentPatient.emergencyContacts.length > 0 ? (
                      currentPatient.emergencyContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-white">
                              {contact.name} ({contact.relationship})
                            </p>
                            <p className="font-mono text-cyan-300 font-bold mt-0.5">
                              {contact.phone}
                            </p>
                          </div>
                          <a
                            href={`tel:${contact.phone}`}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No emergency contacts listed.</p>
                    )}
                  </div>

                  <button
                    onClick={handleSimulateDispatch}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] cursor-pointer"
                  >
                    <Radio className="w-4 h-4 animate-ping" />
                    <span>DISPATCH EMERGENCY RESPONSE TEAM</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p>No patient record selected for emergency triage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
