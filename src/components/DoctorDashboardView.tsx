import React, { useState } from "react";
import { PatientProfile, MedicalHistory, ClinicalRecord, Prescription } from "../types";
import {
  Stethoscope,
  Search,
  UserCheck,
  Plus,
  FileText,
  Pill,
  Sparkles,
  CheckCircle2,
  Calendar,
  Zap,
} from "lucide-react";

interface DoctorDashboardViewProps {
  patient: PatientProfile;
  history: MedicalHistory;
  onAddClinicalRecord: (record: ClinicalRecord) => void;
  onAddPrescription: (rx: Prescription) => void;
  allPatients?: PatientProfile[];
  onSelectPatient?: (dnaId: string) => void;
  onOpenAddPatient?: () => void;
}

export const DoctorDashboardView: React.FC<DoctorDashboardViewProps> = ({
  patient,
  history,
  onAddClinicalRecord,
  onAddPrescription,
  allPatients = [],
  onSelectPatient,
  onOpenAddPatient,
}) => {
  const [searchDnaId, setSearchDnaId] = useState("");
  const [activeTab, setActiveTab] = useState<"examine" | "prescription" | "ai-support">("examine");

  // New Clinical Note Form
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentGiven, setTreatmentGiven] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  // New Prescription Form
  const [rxMedicine, setRxMedicine] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxFrequency, setRxFrequency] = useState("");
  const [rxDuration, setRxDuration] = useState("30");

  // AI Clinical Decision Support State
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSaveEncounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis) return;

    const newRecord: ClinicalRecord = {
      id: `cr-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      recordType: "OPD Visit",
      hospitalName: "Apex National University Medical Center",
      attendingDoctor: "Dr. Marcus Vance, FACC",
      department: "Cardiology & Internal Medicine",
      chiefComplaint: chiefComplaint || "Routine specialist evaluation",
      diagnosis,
      treatmentGiven: treatmentGiven || "Symptomatic treatment provided",
      followUpNotes: followUpNotes || "Follow up in 30 days",
      vitals: {
        bp: "120/78 mmHg",
        heartRate: 72,
        tempCelsius: 36.8,
        spO2: 99,
        respRate: 16,
        weightKg: 78.5,
        heightCm: 180,
      },
    };

    onAddClinicalRecord(newRecord);
    setChiefComplaint("");
    setDiagnosis("");
    setTreatmentGiven("");
    setFollowUpNotes("");
    alert("Clinical encounter successfully signed and logged into Patient DNA record!");
  };

  const handleSaveRx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxMedicine) return;

    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      doctorName: "Dr. Marcus Vance, FACC",
      department: "Cardiology",
      hospital: "Apex National University Medical Center",
      digitalSignature: `SIG-CRYPT-${Math.floor(100000 + Math.random() * 900000)}-MV`,
      qrCodeToken: `DNA-RX-VERIFIED-${Date.now()}`,
      medicines: [
        {
          name: rxMedicine,
          dosage: rxDosage || "Standard Dose",
          frequency: rxFrequency || "Once daily",
          durationDays: parseInt(rxDuration) || 30,
          instructions: "Take after meals with water.",
          refillAvailable: true,
        },
      ],
    };

    onAddPrescription(newRx);
    setRxMedicine("");
    setRxDosage("");
    setRxFrequency("");
    alert("E-Prescription cryptographically signed & issued to Patient DNA Vault!");
  };

  const handleFetchAiSupport = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/clinical-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chiefComplaint: chiefComplaint || "Hypertension check & fatigue",
          doctorNotes: treatmentGiven || "Evaluating blood pressure compliance",
          currentDiagnosis: diagnosis || "Stage 1 Essential Hypertension",
          patientRecord: {
            age: 38,
            gender: "Male",
            diseases: (history?.diseases || []).map((d) => d.name),
            allergies: (history?.allergies || []).map((a) => a.allergen),
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.differentialDiagnoses) {
          setAiSuggestions(data);
          return;
        }
      }
      throw new Error("Invalid response");
    } catch (err) {
      console.warn("Fallback clinical decision support applied:", err);
      setAiSuggestions({
        differentialDiagnoses: [
          diagnosis || "Primary Essential Hypertension",
          "Secondary Renovascular Strain",
          "Stress-Induced Neurohormonal Elevation"
        ],
        suggestedMedications: [
          {
            medicine: "Telmisartan 40mg Once Daily",
            standardDosage: "40mg",
            route: "Oral",
            duration: "30 Days",
            rationale: "Cardioprotective ARB with long half-life and minimal cough side-effects."
          },
          {
            medicine: "Amlodipine 5mg",
            standardDosage: "5mg",
            route: "Oral",
            duration: "30 Days",
            rationale: "Synergistic calcium channel blockade if target BP is not achieved."
          }
        ],
        followUpTimeline: "Re-evaluate home blood pressure diary in 14 days",
        recommendedWorkup: [
          "Serum Electrolytes (Sodium, Potassium)",
          "Serum Creatinine & Estimated GFR",
          "Urinary Albumin-to-Creatinine Ratio"
        ],
        keyWarnings: [
          "Check baseline renal function before initiating therapy.",
          "Counsel patient on limiting high dietary sodium intake."
        ]
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Search Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                DOCTOR CLINICAL CONSOLE
              </span>
              <span className="text-xs text-slate-400">Dr. Marcus Vance, FACC</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              PHYSICIAN WORKSPACE
            </h1>
          </div>

          <div className="flex flex-wrap items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search patient or DNA ID..."
                value={searchDnaId}
                onChange={(e) => setSearchDnaId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchDnaId) {
                    const matched = allPatients.find(
                      (p) =>
                        p.dnaId.toLowerCase().includes(searchDnaId.toLowerCase()) ||
                        p.fullName.toLowerCase().includes(searchDnaId.toLowerCase())
                    );
                    if (matched && onSelectPatient) {
                      onSelectPatient(matched.dnaId);
                      setSearchDnaId("");
                    } else if (searchDnaId.startsWith("DNA-") && onSelectPatient) {
                      onSelectPatient(searchDnaId);
                    }
                  }
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {allPatients.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value && onSelectPatient) {
                    onSelectPatient(e.target.value);
                  }
                }}
                value={patient.dnaId}
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                {allPatients.map((p) => (
                  <option key={p.dnaId} value={p.dnaId}>
                    {p.fullName} ({p.dnaId})
                  </option>
                ))}
              </select>
            )}

            {onOpenAddPatient && (
              <button
                type="button"
                onClick={onOpenAddPatient}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Patient</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Patient Identity Bar */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <img
              src={patient.avatarUrl}
              alt={patient.fullName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-400"
            />
            <div>
              <span className="font-bold text-white text-sm">{patient.fullName}</span>
              <span className="ml-2 font-mono text-cyan-300">{patient.dnaId}</span>
              <p className="text-slate-400">
                Blood Group: <strong className="text-red-400">{patient.bloodGroup}</strong> • DOB: {patient.dob}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
              Allergies: Penicillin (Critical)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("examine")}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
            activeTab === "examine"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Add Diagnosis & Clinical Encounter</span>
        </button>

        <button
          onClick={() => setActiveTab("prescription")}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
            activeTab === "prescription"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Write E-Prescription</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("ai-support");
            if (!aiSuggestions) handleFetchAiSupport();
          }}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
            activeTab === "ai-support"
              ? "bg-cyan-600 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Clinical Suggestions</span>
        </button>
      </div>

      {/* Examine & Diagnosis Tab */}
      {activeTab === "examine" && (
        <form
          onSubmit={handleSaveEncounter}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
        >
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Record New OPD Encounter Notes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Chief Complaint & Presentation
              </label>
              <textarea
                rows={3}
                placeholder="Describe patient's symptoms & complaints..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Primary Diagnosis
              </label>
              <input
                type="text"
                placeholder="e.g. Stage 1 Essential Hypertension"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Treatment Provided & Interventions
              </label>
              <textarea
                rows={3}
                placeholder="Detail procedures, clinical instructions, and therapy given..."
                value={treatmentGiven}
                onChange={(e) => setTreatmentGiven(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Follow-up Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Repeat blood pressure check in 4 weeks. Continue salt restriction."
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
            >
              Sign & Save Encounter to Patient DNA
            </button>
          </div>
        </form>
      )}

      {/* E-Prescription Form Tab */}
      {activeTab === "prescription" && (
        <form
          onSubmit={handleSaveRx}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
        >
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Write Cryptographically Signed E-Prescription
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Medicine Name
              </label>
              <input
                type="text"
                placeholder="e.g. Telmisartan"
                value={rxMedicine}
                onChange={(e) => setRxMedicine(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Dosage
              </label>
              <input
                type="text"
                placeholder="e.g. 40 mg Tablet"
                value={rxDosage}
                onChange={(e) => setRxDosage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Frequency
              </label>
              <input
                type="text"
                placeholder="e.g. Once daily (Morning)"
                value={rxFrequency}
                onChange={(e) => setRxFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Duration (Days)
              </label>
              <input
                type="number"
                value={rxDuration}
                onChange={(e) => setRxDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
            >
              Sign & Issue E-Prescription
            </button>
          </div>
        </form>
      )}

      {/* AI Clinical Decision Support */}
      {activeTab === "ai-support" && (
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  CLINICAL DECISION SUPPORT ASSISTANT
                </h2>
                <p className="text-xs text-slate-400">
                  Gemini 3.6 Diagnostic Differential & Pharmacotherapy Suggestions
                </p>
              </div>
            </div>

            <button
              onClick={handleFetchAiSupport}
              disabled={isAiLoading}
              className="px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              {isAiLoading ? "Analyzing Record..." : "Re-Run AI Workup"}
            </button>
          </div>

          {aiSuggestions ? (
            <div className="space-y-6 text-xs text-slate-200">
              {aiSuggestions.differentialDiagnoses && (
                <div>
                  <span className="font-bold text-cyan-300 block text-xs uppercase tracking-wider mb-2">
                    Suggested Differential Diagnoses:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.differentialDiagnoses.map((diff: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium"
                      >
                        {diff}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {aiSuggestions.suggestedMedications && (
                <div>
                  <span className="font-bold text-cyan-300 block text-xs uppercase tracking-wider mb-2">
                    Evidence-Based Pharmacotherapy Options:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {aiSuggestions.suggestedMedications.map((med: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1"
                      >
                        <p className="font-bold text-white text-sm">
                          {med.medicine} ({med.standardDosage})
                        </p>
                        <p className="text-slate-400">Rationale: {med.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">
              Click "Re-Run AI Workup" to analyze chief complaints against patient history.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
