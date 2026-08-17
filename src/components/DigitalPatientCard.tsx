import React, { useState } from "react";
import { PatientProfile } from "../types";
import { QRCodeGenerator } from "./QRCodeGenerator";
import {
  ShieldCheck,
  Dna,
  Heart,
  AlertTriangle,
  PhoneCall,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  Printer,
  Copy,
  BadgeCheck,
  Edit2,
  Save,
  X,
  Camera,
} from "lucide-react";

interface DigitalPatientCardProps {
  patient: PatientProfile;
  onUpdatePatient?: (updated: PatientProfile) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const DigitalPatientCard: React.FC<DigitalPatientCardProps> = ({
  patient,
  onUpdatePatient,
  isOpen = true,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [cardFormData, setCardFormData] = useState<PatientProfile>(patient);

  const handleCopyId = () => {
    navigator.clipboard.writeText(patient.dnaId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveCardEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePatient) {
      onUpdatePatient(cardFormData);
    }
    setIsEditingCard(false);
  };

  const emergencyQrPayload = JSON.stringify({
    dnaId: patient.dnaId,
    name: patient.fullName,
    bloodGroup: patient.bloodGroup,
    dob: patient.dob,
    gender: patient.gender,
    allergies: ["Penicillin", "NSAIDs"],
    emergencyContact: patient.emergencyContacts?.[0]
      ? `${patient.emergencyContacts[0].name} (${patient.emergencyContacts[0].phone})`
      : "Not specified",
    organDonor: patient.organDonorStatus,
    insurance: patient.insurance ? `${patient.insurance.provider} - ${patient.insurance.policyNumber}` : "Self-pay / N/A",
    registeredHospital: patient.registeredHospital,
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xl max-w-2xl mx-auto overflow-hidden relative">
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <Dna className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                DIGITAL PATIENT ID CARD
              </h2>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>ACTIVE</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Universal Identity Passport • Apex Health Network
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {onUpdatePatient && (
            <button
              onClick={() => {
                setCardFormData(patient);
                setIsEditingCard(!isEditingCard);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingCard ? "Cancel Edit" : "Edit Card Details"}</span>
            </button>
          )}
          <button
            onClick={handleCopyId}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? "Copied!" : "Copy DNA ID"}</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Print ID Card"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit Form Mode */}
      {isEditingCard ? (
        <form onSubmit={handleSaveCardEdits} className="py-6 space-y-4 border-b border-slate-100">
          <div className="bg-cyan-50/60 p-3 rounded-2xl border border-cyan-100 text-xs text-cyan-900 font-medium flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>Editing Digital Card Identity (Changes will update QR Token & Patient Record)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Patient Name</label>
              <input
                type="text"
                value={cardFormData.fullName}
                onChange={(e) => setCardFormData({ ...cardFormData, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">DNA ID Token</label>
              <input
                type="text"
                value={cardFormData.dnaId}
                onChange={(e) => setCardFormData({ ...cardFormData, dnaId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-cyan-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
              <select
                value={cardFormData.bloodGroup}
                onChange={(e) => setCardFormData({ ...cardFormData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                {["O Positive (O+)", "O Negative (O-)", "A Positive (A+)", "A Negative (A-)", "B Positive (B+)", "B Negative (B-)", "AB Positive (AB+)", "AB Negative (AB-)"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={cardFormData.dob}
                onChange={(e) => setCardFormData({ ...cardFormData, dob: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={cardFormData.gender}
                onChange={(e) => setCardFormData({ ...cardFormData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Biometric Status</label>
              <select
                value={cardFormData.biometricStatus}
                onChange={(e) => setCardFormData({ ...cardFormData, biometricStatus: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value="Verified">Verified</option>
                <option value="Pending Verification">Pending Verification</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Insurance Provider</label>
              <input
                type="text"
                value={cardFormData.insurance.provider}
                onChange={(e) =>
                  setCardFormData({
                    ...cardFormData,
                    insurance: { ...cardFormData.insurance, provider: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Insurance Policy No.</label>
              <input
                type="text"
                value={cardFormData.insurance.policyNumber}
                onChange={(e) =>
                  setCardFormData({
                    ...cardFormData,
                    insurance: { ...cardFormData.insurance, policyNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="organDonorCheckCard"
              checked={cardFormData.organDonorStatus}
              onChange={(e) => setCardFormData({ ...cardFormData, organDonorStatus: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500"
            />
            <label htmlFor="organDonorCheckCard" className="text-xs font-bold text-slate-800 cursor-pointer">
              Registered Organ Donor
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={() => setIsEditingCard(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>Update Card & QR Token</span>
            </button>
          </div>
        </form>
      ) : null}

      {/* Main Card Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-center">
        {/* Left Column: Avatar & Personal Info */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={patient.avatarUrl}
                alt={patient.fullName}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-50 shadow-md border border-slate-200"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white ring-2 ring-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-snug">
                {patient.fullName}
              </h3>
              <p className="text-xs font-mono font-bold text-blue-600 tracking-wider">
                {patient.dnaId}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                DOB: {patient.dob} ({patient.gender})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Blood Group
              </span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="text-sm font-bold text-slate-900">
                  {patient.bloodGroup}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Biometric Status
              </span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">
                  {patient.biometricStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-rose-800">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Critical Allergies</span>
            </div>
            <p className="text-rose-900 mt-1 font-medium">
              Penicillin Derivatives (Critical), NSAIDs (Severe)
            </p>
          </div>

          <div className="text-xs text-slate-500 space-y-1 pt-1">
            <p>
              <strong className="text-slate-700">Primary Contact:</strong>{" "}
              {patient.emergencyContacts[0]?.name || "Not set"} (
              {patient.emergencyContacts[0]?.relationship || "N/A"}) -{" "}
              {patient.emergencyContacts[0]?.phone || "N/A"}
            </p>
            <p>
              <strong className="text-slate-700">Insurance:</strong>{" "}
              {patient.insurance.provider} ({patient.insurance.policyNumber})
            </p>
            <p>
              <strong className="text-slate-700">Organ Donor:</strong>{" "}
              {patient.organDonorStatus ? "Yes (Registered)" : "No"}
            </p>
          </div>
        </div>

        {/* Right Column: QR Code & Scan Instructions */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-inner">
          <QRCodeGenerator
            value={emergencyQrPayload}
            size={160}
            fgColor="#0f172a"
            logoText="DNA"
          />
          <p className="text-[11px] text-slate-300 font-semibold mt-3 text-center">
            SCAN TO ACCESS EMERGENCY RECORD
          </p>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">
            Encrypted TLS v1.3 • AES-256
          </span>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span className="flex items-center space-x-1 text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Issued by National Health Identity Registry</span>
        </span>
        <span className="font-mono text-[11px]">Valid Worldwide • ISO-27001</span>
      </div>
    </div>
  );
};
