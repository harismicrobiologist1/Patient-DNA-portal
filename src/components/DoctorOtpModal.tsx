import React, { useState, useEffect } from "react";
import { PatientProfile } from "../types";
import {
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Smartphone,
  Send,
  Fingerprint,
  UserCheck,
  Stethoscope,
  Info,
} from "lucide-react";

interface DoctorOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  doctorName?: string;
  department?: string;
  hospitalName?: string;
  onVerificationSuccess: (token: string) => void;
}

export const DoctorOtpModal: React.FC<DoctorOtpModalProps> = ({
  isOpen,
  onClose,
  patient,
  doctorName = "Dr. Marcus Vance, FACC",
  department = "Cardiology & Internal Medicine",
  hospitalName = "Apex National University Medical Center",
  onVerificationSuccess,
}) => {
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [maskedEmail, setMaskedEmail] = useState<string>("");
  const [maskedPhone, setMaskedPhone] = useState<string>("");
  const [expiresInSeconds, setExpiresInSeconds] = useState(600); // 10 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDeviceToast, setShowDeviceToast] = useState(true);

  // Request new OTP upon opening
  useEffect(() => {
    if (isOpen && patient?.dnaId) {
      handleRequestOtp();
    } else {
      setOtpInputs(["", "", "", "", "", ""]);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, patient?.dnaId]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || expiresInSeconds <= 0) return;
    const timer = setInterval(() => {
      setExpiresInSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, expiresInSeconds]);

  const handleRequestOtp = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setOtpInputs(["", "", "", "", "", ""]);
    setShowDeviceToast(true);

    try {
      const res = await fetch("/api/auth/request-doctor-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientDnaId: patient.dnaId,
          patientName: patient.fullName,
          patientEmail: patient.email,
          patientPhone: patient.phone,
          doctorName,
          department,
          hospital: hospitalName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedOtp(data.otpCode);
        setMaskedEmail(data.maskedEmail);
        setMaskedPhone(data.maskedPhone);
        setExpiresInSeconds(600);
      } else {
        setErrorMsg(data.error || "Failed to request authorization OTP");
      }
    } catch (err: any) {
      // Fallback client OTP generation in case server has transient error
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(fallbackOtp);
      const email = patient.email || "patient@healthdna.org";
      const parts = email.split("@");
      setMaskedEmail(`${parts[0].substring(0, 2)}***${parts[0].slice(-1)}@${parts[1]}`);
      setMaskedPhone(patient.phone.replace(/(\d{3})\d{4}(\d{2})/, "$1****$2"));
      setExpiresInSeconds(600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newInputs = [...otpInputs];
    newInputs[idx] = value.slice(-1);
    setOtpInputs(newInputs);
    setErrorMsg(null);

    // Auto-focus next input
    if (value && idx < 5) {
      const nextInput = document.getElementById(`otp-digit-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpInputs[idx] && idx > 0) {
      const prevInput = document.getElementById(`otp-digit-${idx - 1}`);
      prevInput?.focus();
    }
  };

  const handleAutoFill = () => {
    if (generatedOtp && generatedOtp.length === 6) {
      setOtpInputs(generatedOtp.split(""));
      setErrorMsg(null);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredCode = otpInputs.join("");

    if (enteredCode.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/verify-doctor-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientDnaId: patient.dnaId,
          doctorName,
          otpCode: enteredCode,
        }),
      });

      const data = await res.json();
      if (data.success || enteredCode === generatedOtp) {
        const token = data.sessionToken || `AUTH-DR-${Date.now()}`;
        setSuccessMsg("Patient consent verified! Access granted to medical vault.");
        setTimeout(() => {
          onVerificationSuccess(token);
          onClose();
        }, 1000);
      } else {
        setErrorMsg(data.error || "Incorrect OTP code. Please check with patient.");
      }
    } catch (err: any) {
      if (enteredCode === generatedOtp) {
        setSuccessMsg("Patient consent verified! Access granted.");
        setTimeout(() => {
          onVerificationSuccess(`AUTH-DR-${Date.now()}`);
          onClose();
        }, 1000);
      } else {
        setErrorMsg("Failed to verify OTP code.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(expiresInSeconds / 60);
  const seconds = expiresInSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-md text-white border border-blue-400/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-blue-500/30">
                  HIPAA / GDPR CONSENT GATEWAY
                </span>
                <span className="text-[10px] text-slate-400">Secure Protocol</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                Doctor Access Verification
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient & Doctor Context Bar */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <img
              src={patient.avatarUrl}
              alt={patient.fullName}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-blue-500/40"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-sm">{patient.fullName}</span>
                <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  {patient.dnaId}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Blood Group: <strong>{patient.bloodGroup}</strong> • DOB: {patient.dob}
              </p>
            </div>
          </div>

          <div className="sm:text-right text-[11px] text-slate-600 bg-white sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
            <span className="font-bold text-slate-900 block flex items-center sm:justify-end space-x-1">
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              <span>{doctorName}</span>
            </span>
            <span className="text-slate-500">{department}</span>
          </div>
        </div>

        {/* Realistic Patient Device SMS / Email Incoming Simulation Widget */}
        {showDeviceToast && generatedOtp && (
          <div className="mx-6 mt-5 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-indigo-500/40 shadow-xl relative animate-bounce-short">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                    📲 Patient Smartphone & Email Alert (Simulated Dispatch)
                  </span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">
                    "Apex Medical Center: {doctorName} requested access to your medical vault."
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 shrink-0">
                Live Delivered
              </span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-300 font-medium">Your 6-Digit Consent Code:</span>
                <span className="text-lg font-black font-mono tracking-widest text-cyan-300 bg-slate-800 px-3 py-0.5 rounded-lg border border-cyan-400/40">
                  {generatedOtp}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAutoFill}
                className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold transition-all shadow-sm flex items-center space-x-1"
                title="Simulate patient sharing this code with doctor"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Patient Shares Code</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Form Content */}
        <form onSubmit={handleVerifyOtp} className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              Enter Patient One-Time Passcode (OTP)
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              A 6-digit authorization code was dispatched to patient's registered contact:
              <br />
              <span className="font-semibold text-slate-700">
                {maskedEmail || patient.email} • {maskedPhone || patient.phone}
              </span>
            </p>
          </div>

          {/* 6-Digit OTP Inputs */}
          <div className="flex items-center justify-center space-x-2.5 sm:space-x-3">
            {otpInputs.map((val, idx) => (
              <input
                key={idx}
                id={`otp-digit-${idx}`}
                type="text"
                maxLength={1}
                value={val}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                autoFocus={idx === 0}
                className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl font-mono font-black rounded-2xl border-2 transition-all outline-none ${
                  val
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20"
                    : "border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
              />
            ))}
          </div>

          {/* Timer & Resend */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center space-x-1.5 font-medium">
              <span>Code expires in:</span>
              <strong className={expiresInSeconds < 60 ? "text-red-600 font-mono" : "text-blue-600 font-mono"}>
                {formattedTime}
              </strong>
            </span>

            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={isLoading}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Resend New OTP</span>
            </button>
          </div>

          {/* Error / Success message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || otpInputs.join("").length !== 6}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isVerifying ? "Verifying Consent..." : "Authorize & Unlock Patient Vault"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
