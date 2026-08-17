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
  X,
  Lock,
  Building,
  User,
  Activity,
} from "lucide-react";

interface PublicDigitalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onRequestUnlock?: (patient: PatientProfile) => void;
}

export const PublicDigitalCardModal: React.FC<PublicDigitalCardModalProps> = ({
  isOpen,
  onClose,
  patient,
  onRequestUnlock,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !patient) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(patient.dnaId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emergencyQrPayload = JSON.stringify({
    dnaId: patient.dnaId,
    name: patient.fullName,
    bloodGroup: patient.bloodGroup,
    dob: patient.dob,
    gender: patient.gender,
    allergies: ["Penicillin (Emergency Alert)"],
    emergencyContact: patient.emergencyContacts?.[0]
      ? `${patient.emergencyContacts[0].name} (${patient.emergencyContacts[0].phone})`
      : "Not specified",
    organDonor: patient.organDonorStatus,
    insurance: patient.insurance ? `${patient.insurance.provider} - ${patient.insurance.policyNumber}` : "Self-pay / N/A",
    registeredHospital: patient.registeredHospital,
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fadeIn">
        {/* Top Banner Accent */}
        <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Dna className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  PUBLIC EMERGENCY DIGITAL ID
                </h2>
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>VERIFIED</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Universal Health Emergency Identity • Apex Health Network
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
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
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Privacy Notice Banner */}
        <div className="bg-amber-50/70 px-6 py-2.5 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Public Emergency Card View:</strong> Confidential clinical history, lab files, and prescriptions are hidden.
            </span>
          </div>

          {onRequestUnlock && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestUnlock(patient);
              }}
              className="font-bold text-blue-700 hover:underline shrink-0 ml-2"
            >
              Unlock Full Profile →
            </button>
          )}
        </div>

        {/* Digital Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Patient Profile Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50/70 p-6 rounded-3xl border border-slate-100">
            <img
              src={patient.avatarUrl}
              alt={patient.fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white shadow-md"
            />
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-extrabold text-slate-900">{patient.fullName}</h3>
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-mono text-xs font-bold">
                  {patient.dnaId}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                National ID: <span className="font-mono text-slate-700">{patient.nationalId}</span>
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-xl bg-red-100 text-red-800 font-black text-xs">
                  🩸 {patient.bloodGroup}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-200 text-slate-800 font-semibold text-xs">
                  DOB: {patient.dob} ({patient.gender})
                </span>
                {patient.organDonorStatus && (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                    🫀 Organ Donor
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Core Emergency Data & Dynamic QR Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: Emergency Information */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1.5">
                <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>CRITICAL EMERGENCY ALLERGIES</span>
                </div>
                <p className="text-xs font-semibold text-rose-950">
                  Penicillin, NSAIDs (Severe Hypersensitivity)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Primary Emergency Contact
                </span>
                {patient.emergencyContacts[0] ? (
                  <div>
                    <p className="font-bold text-slate-800">
                      {patient.emergencyContacts[0].name} ({patient.emergencyContacts[0].relationship})
                    </p>
                    <p className="font-mono text-blue-700 font-semibold">
                      {patient.emergencyContacts[0].phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500">None registered</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Registered Base Hospital
                </span>
                <p className="font-bold text-slate-800">{patient.registeredHospital}</p>
              </div>
            </div>

            {/* Right: Real-time Emergency QR Code */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center text-center space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
                Paramedic & First Responder QR
              </span>
              <div className="p-2.5 bg-white rounded-2xl shadow-inner">
                <QRCodeGenerator value={emergencyQrPayload} size={130} />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Scan for Instant Triage Data
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Lifetime DNA Identity Record • {patient.fullName}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Close Card
          </button>
        </div>
      </div>
    </div>
  );
};
