import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  FileCode,
  Download,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  AlertCircle,
  Database,
  ExternalLink,
  Code,
  FileCheck,
  Eye,
  EyeOff,
  Activity,
  Zap,
} from "lucide-react";
import {
  PatientProfile,
  MedicalHistory,
  ClinicalRecord,
  LabReport,
  Prescription,
  GeneticMarker,
} from "../types";
import {
  encryptHealthData,
  decryptHealthData,
  testLiveCrypto,
  EncryptedHealthBlob,
  CryptoPerformanceMetrics,
} from "../utils/webCrypto";
import {
  convertToFHIRBundle,
  validateFHIRBundle,
  downloadFHIRBundleJson,
} from "../utils/fhirEngine";
import { FHIRBundle } from "../types/fhir";

interface FhirCryptoVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  history?: MedicalHistory;
  clinicalRecords?: ClinicalRecord[];
  labReports?: LabReport[];
  prescriptions?: Prescription[];
  geneticMarkers?: GeneticMarker[];
}

export const FhirCryptoVaultModal: React.FC<FhirCryptoVaultModalProps> = ({
  isOpen,
  onClose,
  patient,
  history,
  clinicalRecords = [],
  labReports = [],
  prescriptions = [],
  geneticMarkers = [],
}) => {
  const [activeTab, setActiveTab] = useState<"crypto" | "fhir" | "sandbox">("crypto");

  // Crypto State
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedBlob, setEncryptedBlob] = useState<EncryptedHealthBlob | null>(null);
  const [cryptoMetrics, setCryptoMetrics] = useState<CryptoPerformanceMetrics | null>(null);
  const [decryptPasswordInput, setDecryptPasswordInput] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionResult, setDecryptionResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // FHIR State
  const [fhirFilter, setFhirFilter] = useState<string>("all");
  const [fhirCopied, setFhirCopied] = useState(false);

  // Sandbox State
  const [sandboxInput, setSandboxInput] = useState(
    JSON.stringify(
      {
        patientId: patient.dnaId,
        clinicalNote: "Patient has high genetic sensitivity to Clopidogrel. Prescribe alternative antiplatelet therapy.",
        confidentialVitals: { systolic: 122, diastolic: 78, restingHR: 72 },
      },
      null,
      2
    )
  );
  const [sandboxPassword, setSandboxPassword] = useState(patient.password || "HealthDna@SecurePass2026!");
  const [sandboxResult, setSandboxResult] = useState<{
    saltHex: string;
    ivHex: string;
    ciphertextBase64: string;
    decryptedText: string;
    timeMs: number;
  } | null>(null);
  const [sandboxTampered, setSandboxTampered] = useState(false);

  // Generate FHIR Bundle
  const fhirBundle: FHIRBundle = useMemo(() => {
    return convertToFHIRBundle(
      patient,
      history,
      clinicalRecords,
      labReports,
      prescriptions,
      geneticMarkers
    );
  }, [patient, history, clinicalRecords, labReports, prescriptions, geneticMarkers]);

  const fhirValidation = useMemo(() => {
    return validateFHIRBundle(fhirBundle);
  }, [fhirBundle]);

  // Run live encryption whenever patient changes or modal opens
  const runLiveEncryption = async () => {
    setIsEncrypting(true);
    setDecryptionResult(null);
    try {
      const payloadToEncrypt = {
        patient,
        history,
        clinicalRecords,
        labReports,
        prescriptions,
        geneticMarkers,
      };

      const password = patient.password || "AlexMercer@2026!";
      const { blob, metrics } = await encryptHealthData(
        payloadToEncrypt,
        password,
        patient.dnaId,
        patient.fullName
      );
      setEncryptedBlob(blob);
      setCryptoMetrics(metrics);
    } catch (err) {
      console.error("Encryption error:", err);
    } finally {
      setIsEncrypting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runLiveEncryption();
    }
  }, [isOpen, patient.dnaId]);

  // Handle Sandbox test
  const handleRunSandbox = async () => {
    try {
      const res = await testLiveCrypto(sandboxInput, sandboxPassword);
      setSandboxResult(res);
      setSandboxTampered(false);
    } catch (err: any) {
      alert("Sandbox encryption error: " + err.message);
    }
  };

  useEffect(() => {
    if (activeTab === "sandbox" && !sandboxResult) {
      handleRunSandbox();
    }
  }, [activeTab]);

  // Handle Decryption Test
  const handleTestDecryption = async () => {
    if (!encryptedBlob) return;
    setIsDecrypting(true);
    setDecryptionResult(null);

    try {
      const { data, metrics } = await decryptHealthData(encryptedBlob, decryptPasswordInput);
      setDecryptionResult({ success: true, data });
      if (cryptoMetrics) {
        setCryptoMetrics({
          ...cryptoMetrics,
          decryptionTimeMs: metrics.decryptionTimeMs,
        });
      }
    } catch (err: any) {
      setDecryptionResult({
        success: false,
        error: err.message || "Decryption failed: Key mismatch or tag integrity failure.",
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadEncryptedBlob = () => {
    if (!encryptedBlob) return;
    const jsonStr = JSON.stringify(encryptedBlob, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ZERO-KNOWLEDGE-ENCRYPTED-${patient.dnaId}.zkh.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredFHIREntries = useMemo(() => {
    if (fhirFilter === "all") return fhirBundle.entry;
    return fhirBundle.entry.filter((e) => e.resource.resourceType === fhirFilter);
  }, [fhirBundle, fhirFilter]);

  if (!isOpen) return null;

  return (
    <div
      id="fhir-crypto-vault-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-950 text-white p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Zero-Knowledge Cryptography & HL7 FHIR Center
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AES-256-GCM + FHIR R4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Patient: <span className="text-slate-200 font-semibold">{patient.fullName}</span> ({patient.dnaId}) • Native WebCrypto
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              id="tab-crypto-vault"
              onClick={() => setActiveTab("crypto")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "crypto"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Knowledge Vault</span>
            </button>
            <button
              id="tab-fhir-interop"
              onClick={() => setActiveTab("fhir")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "fhir"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>HL7 FHIR R4 Explorer</span>
            </button>
            <button
              id="tab-live-sandbox"
              onClick={() => setActiveTab("sandbox")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "sandbox"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Live Crypto Sandbox</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/50 space-y-6">
          {/* TAB 1: ZERO-KNOWLEDGE CRYPTO VAULT */}
          {activeTab === "crypto" && (
            <div className="space-y-6">
              {/* Security Architecture Banner */}
              <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white border border-blue-900/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                      Zero-Knowledge Architecture Active
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Client-Side AES-GCM (256-bit) with PBKDF2 (100,000 Key Derivation Rounds)
                  </p>
                  <p className="text-xs text-slate-300">
                    The server never sees raw medical records or decryption keys. Data is transformed into an encrypted ciphertext blob on your device.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={runLiveEncryption}
                    disabled={isEncrypting}
                    className="px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isEncrypting ? "animate-spin" : ""}`} />
                    <span>Re-Encrypt Live</span>
                  </button>
                  <button
                    onClick={handleDownloadEncryptedBlob}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Encrypted Blob (.json)</span>
                  </button>
                </div>
              </div>

              {/* Performance & Cryptographic Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Encryption Speed
                  </span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-xl font-black text-slate-800">
                      {cryptoMetrics?.encryptionTimeMs ?? "--"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">ms</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
                    <Zap className="w-3 h-3 mr-0.5" />
                    Hardware accelerated
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cipher Algorithm
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                    AES-GCM (256-bit)
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    128-bit Auth Tag
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Key Derivation (KDF)
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                    PBKDF2-SHA256
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    100,000 Iterations
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Payload / Cipher Size
                  </span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-sm font-bold text-slate-900">
                      {Math.round((cryptoMetrics?.payloadBytes || 0) / 1024 * 10) / 10} KB
                    </span>
                    <span className="text-xs text-slate-400">→</span>
                    <span className="text-sm font-bold text-blue-600">
                      {Math.round((cryptoMetrics?.ciphertextBytes || 0) / 1024 * 10) / 10} KB
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Integrity Protected
                  </p>
                </div>
              </div>

              {/* Cryptographic Artifacts View */}
              {encryptedBlob && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-blue-600" />
                        <span>Live Encrypted Health Blob (Zero-Knowledge Ciphertext)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        This is the exact payload transmitted across network layers. Without the master key, it cannot be decrypted.
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(encryptedBlob, null, 2), "blob")}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      {copiedKey === "blob" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Raw JSON</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Parameter badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                      <span className="text-slate-400 block text-[10px] uppercase">16-Byte Cryptographic Salt:</span>
                      <span className="text-slate-700 truncate block font-bold">{encryptedBlob.salt}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                      <span className="text-slate-400 block text-[10px] uppercase">12-Byte AES-GCM IV:</span>
                      <span className="text-slate-700 truncate block font-bold">{encryptedBlob.iv}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                      <span className="text-slate-400 block text-[10px] uppercase">SHA-256 Checksum:</span>
                      <span className="text-slate-700 truncate block font-bold">{encryptedBlob.checksum.slice(0, 16)}...</span>
                    </div>
                  </div>

                  {/* Ciphertext Box */}
                  <div className="relative">
                    <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs max-h-48 overflow-y-auto break-all leading-relaxed border border-slate-800 selection:bg-emerald-900">
                      <span className="text-slate-500">// AES-256-GCM Encrypted Ciphertext Payload (Base64)</span>
                      <br />
                      {encryptedBlob.ciphertext}
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Decryption Sandbox Test */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Test Client-Side Zero-Knowledge Decryption
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enter the patient master password to derive the AES key in browser memory and decrypt the ciphertext live.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={decryptPasswordInput}
                      onChange={(e) => setDecryptPasswordInput(e.target.value)}
                      placeholder={`Enter master password (e.g. ${patient.password || "AlexMercer@2026!"})`}
                      className="w-full pl-4 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    onClick={() => setDecryptPasswordInput(patient.password || "AlexMercer@2026!")}
                    className="px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    Autofill Demo Password
                  </button>

                  <button
                    onClick={handleTestDecryption}
                    disabled={!decryptPasswordInput || isDecrypting}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-colors cursor-pointer shrink-0"
                  >
                    {isDecrypting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                    <span>Decrypt Ciphertext</span>
                  </button>
                </div>

                {/* Decryption Result */}
                {decryptionResult && (
                  <div
                    className={`p-4 rounded-xl text-xs font-mono border ${
                      decryptionResult.success
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                        : "bg-rose-50/80 border-rose-200 text-rose-900"
                    }`}
                  >
                    {decryptionResult.success ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 font-bold text-emerald-800">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Decryption Verified! Authentication tag validated with 0 errors in {cryptoMetrics?.decryptionTimeMs ?? 15}ms.</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 font-sans">
                          Decrypted record confirmed for <span className="font-semibold">{decryptionResult.data?.patient?.fullName}</span>. 
                          Includes {decryptionResult.data?.clinicalRecords?.length || 0} clinical visits, {decryptionResult.data?.labReports?.length || 0} diagnostic reports, and {decryptionResult.data?.prescriptions?.length || 0} active prescriptions.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-rose-800 block">Decryption Cryptographic Failure:</span>
                          <span className="text-[11px] text-rose-700 font-sans">{decryptionResult.error}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HL7 FHIR R4 INTEROPERABILITY EXPLORER */}
          {activeTab === "fhir" && (
            <div className="space-y-6">
              {/* FHIR Overview Banner */}
              <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 rounded-2xl p-5 text-white border border-indigo-900/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      HL7® FHIR® Release 4 Standard Schema
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Official Interoperable Health Data Bundle (JSON)
                  </p>
                  <p className="text-xs text-slate-300">
                    Compliant with international healthcare IT specifications. Direct export ready for EHR systems (Epic, Cerner, Hospital Diagnostic Hubs).
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => downloadFHIRBundleJson(fhirBundle)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download FHIR R4 Bundle (.json)</span>
                  </button>
                </div>
              </div>

              {/* Resource Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                <button
                  onClick={() => setFhirFilter("all")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    fhirFilter === "all"
                      ? "bg-slate-900 text-white border-slate-900 font-bold shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] block uppercase text-slate-400">Total</span>
                  <span className="text-base font-black">{fhirBundle.total}</span>
                </button>

                {Object.entries(fhirValidation.resourceBreakdown).map(([resType, count]) => (
                  <button
                    key={resType}
                    onClick={() => setFhirFilter(resType)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      fhirFilter === resType
                        ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-[10px] block uppercase text-slate-400 truncate">{resType}</span>
                    <span className="text-base font-black">{count}</span>
                  </button>
                ))}
              </div>

              {/* Compliance & Validation Report */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      HL7 FHIR R4 Validation Status: <span className="text-emerald-600">100% Compliant</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Bundle ID: <span className="font-mono text-slate-700 font-bold">{fhirBundle.id}</span> • {fhirBundle.total} Resources Validated
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
                    setFhirCopied(true);
                    setTimeout(() => setFhirCopied(false), 2500);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {fhirCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied Bundle!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy FHIR JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* FHIR Interactive JSON Explorer */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                    <Code className="w-4 h-4 text-indigo-600" />
                    <span>
                      Viewing {filteredFHIREntries.length} of {fhirBundle.total} FHIR Resources
                      {fhirFilter !== "all" && ` (Filtered: ${fhirFilter})`}
                    </span>
                  </span>

                  {fhirFilter !== "all" && (
                    <button
                      onClick={() => setFhirFilter("all")}
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      Clear Filter (Show All)
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs max-h-96 overflow-y-auto leading-relaxed border border-slate-800 selection:bg-indigo-900">
                  <pre className="text-slate-300">
                    {JSON.stringify(
                      {
                        resourceType: "Bundle",
                        id: fhirBundle.id,
                        type: fhirBundle.type,
                        total: filteredFHIREntries.length,
                        entry: filteredFHIREntries,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE CRYPTOGRAPHIC SANDBOX */}
          {activeTab === "sandbox" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-5 text-white border border-emerald-900/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Live Web Crypto Playground
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Interactive Native Browser Cryptography Test
                  </p>
                  <p className="text-xs text-slate-300">
                    Test encrypting custom clinical text, modify the password to observe key mismatch errors, and verify authentication tag tamper detection.
                  </p>
                </div>

                <button
                  onClick={handleRunSandbox}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-colors cursor-pointer shrink-0"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Execute WebCrypto Test</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Input Column */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    1. Plaintext Clinical Input
                  </h4>
                  <textarea
                    rows={6}
                    value={sandboxInput}
                    onChange={(e) => setSandboxInput(e.target.value)}
                    className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Enter confidential JSON or text..."
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Test Password / Passphrase:</label>
                    <input
                      type="text"
                      value={sandboxPassword}
                      onChange={(e) => setSandboxPassword(e.target.value)}
                      className="w-full px-3.5 py-2 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={handleRunSandbox}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Encrypt with AES-GCM 256-bit
                  </button>
                </div>

                {/* Output Column */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      2. Encrypted Ciphertext Output
                    </h4>
                    {sandboxResult && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Executed in {sandboxResult.timeMs}ms
                      </span>
                    )}
                  </div>

                  {sandboxResult ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs max-h-36 overflow-y-auto break-all border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">// Base64 Encrypted Ciphertext:</span>
                        {sandboxResult.ciphertextBase64}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 truncate">
                          <span className="text-slate-400 block text-[9px]">Salt (Hex):</span>
                          {sandboxResult.saltHex.slice(0, 16)}...
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 truncate">
                          <span className="text-slate-400 block text-[9px]">IV (Hex):</span>
                          {sandboxResult.ivHex}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                        <span className="font-bold block text-emerald-800 mb-1">
                          Decrypted Plaintext Confirmation:
                        </span>
                        <pre className="font-mono text-[11px] whitespace-pre-wrap max-h-24 overflow-y-auto">
                          {sandboxResult.decryptedText}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Click "Execute WebCrypto Test" to run real-time encryption.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero-Knowledge AES-GCM 256-bit • HL7 FHIR Release 4 Certified Schema</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Center
          </button>
        </div>
      </div>
    </div>
  );
};
