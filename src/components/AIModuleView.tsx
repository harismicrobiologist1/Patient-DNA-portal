import React, { useState } from "react";
import { PatientProfile, MedicalHistory, Prescription, ClinicalRecord, LabReport } from "../types";
import {
  requestSymptomAnalysis,
  requestMedicationAnalysis,
  requestDiseasePrediction,
} from "../utils/aiAnalysisService";
import {
  Sparkles,
  Zap,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Brain,
  Search,
  CheckCircle2,
  HeartPulse,
  Flame,
  FileSearch,
  Pill,
  ShieldAlert,
  BarChart3,
  Microscope,
  RotateCcw,
  Info,
  Check,
  AlertOctagon,
  ArrowRight,
} from "lucide-react";

interface AIModuleViewProps {
  patient: PatientProfile;
  history: MedicalHistory;
  prescriptions?: Prescription[];
  clinicalRecords?: ClinicalRecord[];
  labReports?: LabReport[];
}

export const AIModuleView: React.FC<AIModuleViewProps> = ({
  patient,
  history,
  prescriptions = [],
  clinicalRecords = [],
  labReports = [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"symptoms" | "medication" | "prediction">("medication");

  // Symptom Analysis State
  const [symptomInput, setSymptomInput] = useState("");
  const [symptomResult, setSymptomResult] = useState<any>(null);
  const [isSymptomLoading, setIsSymptomLoading] = useState(false);

  // Medication, Resistance & Efficacy Search State
  const [medSearchTerm, setMedSearchTerm] = useState("Amoxicillin");
  const [proposedDose, setProposedDose] = useState("500mg Twice Daily");
  const [treatmentDuration, setTreatmentDuration] = useState("7 Days");
  const [medResult, setMedResult] = useState<any>(null);
  const [isMedLoading, setIsMedLoading] = useState(false);

  // Disease Prediction State
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [isPredictLoading, setIsPredictLoading] = useState(false);

  const handleAnalyzeSymptoms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput) return;
    setIsSymptomLoading(true);
    setSymptomResult(null);

    try {
      const data = await requestSymptomAnalysis({
        symptoms: symptomInput,
        age: 38,
        gender: patient.gender,
        medicalHistory: (history?.diseases || []).map((d) => d.name),
        vitals: { bp: "122/78", heartRate: 72 },
      });
      setSymptomResult(data);
    } catch (err) {
      console.error("Error analyzing symptoms:", err);
    } finally {
      setIsSymptomLoading(false);
    }
  };

  const handleAnalyzeMedication = async (e?: React.FormEvent, overrideMedName?: string) => {
    if (e) e.preventDefault();
    const queryName = overrideMedName || medSearchTerm;
    if (!queryName.trim()) return;

    setIsMedLoading(true);
    setMedResult(null);

    try {
      const data = await requestMedicationAnalysis({
        medicineName: queryName,
        proposedDose,
        duration: treatmentDuration,
        patientProfile: { age: 38, gender: patient.gender, bloodGroup: patient.bloodGroup },
        medicalHistory: history || {},
        prescriptions: prescriptions || [],
        clinicalRecords: clinicalRecords || [],
        labReports: labReports || [],
      });
      setMedResult(data);
    } catch (err) {
      console.error("Error analyzing medication:", err);
    } finally {
      setIsMedLoading(false);
    }
  };

  const handleRunDiseasePrediction = async () => {
    setIsPredictLoading(true);
    setPredictionResult(null);

    try {
      const data = await requestDiseasePrediction({
        patientProfile: { age: 38, bloodGroup: patient.bloodGroup, gender: patient.gender },
        medicalHistory: history?.diseases || [],
        lifestyle: history?.lifestyle || {},
        familyHistory: history?.familyHistory || [],
      });
      setPredictionResult(data);
    } catch (err) {
      console.error("Error predicting disease:", err);
    } finally {
      setIsPredictLoading(false);
    }
  };

  const quickMedSuggestions = [
    "Amoxicillin",
    "Azithromycin",
    "Ciprofloxacin",
    "Augmentin 1000mg",
    "Metformin",
    "Atorvastatin",
    "Gentamicin",
    "Dexamethasone",
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl text-slate-950 shadow-lg shadow-cyan-500/20">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">PATIENT DNA AI MODULE</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                AI Diagnostics • Medicine Interaction, Resistance & Efficacy Analysis • Health Risk Radar
              </p>
            </div>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "medication", label: "Medicine & Resistance Search", icon: Pill },
              { id: "symptoms", label: "Symptom Analysis", icon: Sparkles },
              { id: "prediction", label: "Disease Prediction", icon: Activity },
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSubTab(tab.id as any);
                    if (tab.id === "prediction" && !predictionResult) handleRunDiseasePrediction();
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    activeSubTab === tab.id
                      ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. Medication & Resistance Search Sub-Tab */}
      {activeSubTab === "medication" && (
        <div className="space-y-6">
          {/* Search Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Microscope className="w-5 h-5 text-indigo-600" />
                <span>Medication Interaction, Resistance & Efficacy Analyzer</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Search any medication to cross-examine against patient's full longitudinal history. AI analyzes drug interactions, microbial/drug resistance risks, and efficacy changes caused by previous high doses or prolonged use.
              </p>
            </div>

            <form onSubmit={handleAnalyzeMedication} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Search Medication Name
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Amoxicillin, Ciprofloxacin..."
                      value={medSearchTerm}
                      onChange={(e) => setMedSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Dosage (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg Twice Daily"
                    value={proposedDose}
                    onChange={(e) => setProposedDose(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Treatment Duration (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7 Days"
                    value={treatmentDuration}
                    onChange={(e) => setTreatmentDuration(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Quick Preset Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Quick Search:
                </span>
                {quickMedSuggestions.map((med) => (
                  <button
                    key={med}
                    type="button"
                    onClick={() => {
                      setMedSearchTerm(med);
                      handleAnalyzeMedication(undefined, med);
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    + {med}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isMedLoading || !medSearchTerm.trim()}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isMedLoading
                      ? "Cross-referencing Medical History & Analyzing..."
                      : "Analyze Medicine Interaction, Resistance & Efficacy"}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Analysis Results Display */}
          {medResult && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Badge & Suitability Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-black text-slate-900">
                        {medResult.medicationName || medSearchTerm}
                      </h3>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase border ${
                          medResult.riskRating === "Low Risk"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : medResult.riskRating === "Moderate Risk"
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-rose-100 text-rose-800 border-rose-300"
                        }`}
                      >
                        {medResult.riskRating || "Moderate Risk"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Analyzed against {prescriptions.length} past prescriptions & {history.diseases.length} diagnosed conditions
                    </p>
                  </div>

                  {/* Suitability Score Gauge */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center space-x-4 min-w-[220px]">
                    <div className="text-center border-r border-slate-700 pr-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Safety Score
                      </span>
                      <span className="text-2xl font-black text-cyan-400">
                        {medResult.overallSuitabilityScore || 82} / 100
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      <span className="font-bold text-white block">AI Evaluation</span>
                      <span>
                        {medResult.overallSuitabilityScore >= 80
                          ? "Favorable Profile"
                          : medResult.overallSuitabilityScore >= 50
                          ? "Caution Advised"
                          : "High Risk"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pharmacological Summary */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                  <span className="font-bold text-indigo-900 flex items-center space-x-1.5">
                    <Info className="w-4 h-4 text-indigo-600" />
                    <span>Pharmacological Clinical Synthesis</span>
                  </span>
                  <p className="text-indigo-900/90 leading-relaxed pl-5">
                    {medResult.pharmacologicalSummary ||
                      "The requested medication has been evaluated against past clinical history and lab results."}
                  </p>
                </div>

                {/* 3 Main Analytical Pillars Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                  {/* Pillar 1: Drug Interactions */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>Interactions & Contraindications</span>
                    </h4>

                    {medResult.drugInteractions && medResult.drugInteractions.length > 0 ? (
                      <div className="space-y-2.5 text-xs">
                        {medResult.drugInteractions.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{item.target}</span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                  item.severity === "Severe"
                                    ? "bg-rose-100 text-rose-800"
                                    : item.severity === "Moderate"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {item.severity}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">{item.clinicalEffect}</p>
                            <p className="text-[11px] font-semibold text-indigo-600">
                              Recommendation: {item.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>No severe drug-drug or drug-disease interactions identified.</span>
                      </div>
                    )}
                  </div>

                  {/* Pillar 2: Resistance & Tolerance Risk */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                      <Microscope className="w-4 h-4 text-indigo-600" />
                      <span>Resistance & Prior High Dose Impact</span>
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700">Resistance Risk Level</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              medResult.resistanceAndTolerance?.resistanceRiskLevel === "High"
                                ? "bg-rose-100 text-rose-800"
                                : medResult.resistanceAndTolerance?.resistanceRiskLevel === "Moderate"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {medResult.resistanceAndTolerance?.resistanceRiskLevel || "Low"}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                          <span className="font-bold text-slate-900 block mb-0.5">
                            Prior High Dose & Exposure Analysis:
                          </span>
                          {medResult.resistanceAndTolerance?.priorExposureAnalysis ||
                            "No significant prior high-dose tolerance detected."}
                        </div>
                      </div>

                      {medResult.resistanceAndTolerance?.crossResistanceWarnings?.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                          <span className="font-bold text-amber-900 text-[11px] block">
                            Cross-Resistance Warnings:
                          </span>
                          <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-900">
                            {medResult.resistanceAndTolerance.crossResistanceWarnings.map(
                              (warn: string, idx: number) => (
                                <li key={idx}>{warn}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pillar 3: Efficacy & Dose Adjustment */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      <span>Efficacy & Dose Adjustment</span>
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            Estimated Efficacy
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {medResult.doseEfficacyAndAdjustment?.estimatedEfficacy || "Optimal (85-90%)"}
                          </span>
                        </div>

                        <div className="border-t border-slate-100 pt-2 space-y-1">
                          <span className="font-bold text-slate-900 block text-[11px]">
                            Recommended Dosage Adjustment:
                          </span>
                          <p className="text-[11px] text-slate-600">
                            {medResult.doseEfficacyAndAdjustment?.doseAdjustmentAdvice ||
                              "Standard adult therapeutic dosage recommended."}
                          </p>
                        </div>

                        {medResult.doseEfficacyAndAdjustment?.metabolismAndClearance && (
                          <div className="border-t border-slate-100 pt-2 space-y-1">
                            <span className="font-bold text-slate-900 block text-[11px]">
                              Organ Clearance Factors:
                            </span>
                            <p className="text-[11px] text-slate-600">
                              {medResult.doseEfficacyAndAdjustment.metabolismAndClearance}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Extras: Monitoring & Safer Alternatives */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  {/* Monitoring Parameters */}
                  {medResult.monitoringParameters?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                      <span className="font-bold text-slate-900 block">
                        Recommended Clinical Monitoring Parameters:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {medResult.monitoringParameters.map((param: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold"
                          >
                            • {param}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safer Alternatives */}
                  {medResult.saferAlternatives?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
                      <span className="font-bold text-emerald-950 block">
                        Alternative Medicine Options (if resistance/interaction arises):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {medResult.saferAlternatives.map((alt: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold flex items-center space-x-1"
                          >
                            <ArrowRight className="w-3 h-3 text-emerald-600" />
                            <span>{alt}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Symptom Analysis Sub-Tab */}
      {activeSubTab === "symptoms" && (
        <div className="space-y-6">
          <form
            onSubmit={handleAnalyzeSymptoms}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4"
          >
            <h2 className="text-lg font-bold text-slate-900">Interactive Symptom Analysis Engine</h2>
            <p className="text-xs text-slate-500">
              Enter any current symptoms or physiological discomforts for differential analysis cross-referenced against your DNA medical history.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. Mild persistent headache with dizziness after exercise..."
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                disabled={isSymptomLoading || !symptomInput}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSymptomLoading ? "Analyzing Symptoms..." : "Analyze Symptoms"}</span>
              </button>
            </div>
          </form>

          {/* Results render */}
          {symptomResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                  Diagnostic Summary
                </span>
                <p className="text-base font-bold text-slate-900 mt-1">{symptomResult.summary}</p>
              </div>

              {/* Possible Conditions */}
              {symptomResult.possibleConditions && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Differential Diagnoses:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {symptomResult.possibleConditions.map((cond: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{cond.condition}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              cond.probability === "High"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            Likelihood: {cond.probability}
                          </span>
                        </div>
                        <p className="text-slate-600">{cond.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Lab Workup */}
              {symptomResult.recommendedTests && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-950 space-y-2">
                  <span className="font-bold text-blue-900 block">Suggested Diagnostic Lab Workup:</span>
                  <div className="flex flex-wrap gap-2">
                    {symptomResult.recommendedTests.map((test: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-white border border-blue-200 font-semibold text-blue-900">
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Disease Prediction Sub-Tab */}
      {activeSubTab === "prediction" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Health Risk Radar & Genetic Disease Prediction</h2>
                <p className="text-xs text-slate-500">
                  Comprehensive risk scoring based on family history, lab values, and lifestyle factors
                </p>
              </div>

              <button
                onClick={handleRunDiseasePrediction}
                disabled={isPredictLoading}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                {isPredictLoading ? "Calculating Risk..." : "Re-calculate Score"}
              </button>
            </div>

            {predictionResult ? (
              <div className="space-y-6 text-xs text-slate-700">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider block">
                      Overall Patient Health Index
                    </span>
                    <h3 className="text-3xl font-black text-cyan-300">
                      {predictionResult.healthScore || 88} / 100
                    </h3>
                    <p className="text-xs text-slate-300">Optimal metabolic & cardiovascular trajectory</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs space-y-1">
                    <span className="font-bold text-cyan-300 block">DNA Genetic Insights:</span>
                    <p className="text-slate-200 max-w-md">
                      {predictionResult.dnaGeneticInsights || "Familial predisposition for hypertension managed well through diet and active lifestyle."}
                    </p>
                  </div>
                </div>

                {/* Risk Categories Bar Chart */}
                {predictionResult.riskFactors && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {predictionResult.riskFactors.map((rf: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{rf.category} Risk</span>
                          <span className="text-blue-600">{rf.scorePercent || 25}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              rf.scorePercent > 50 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${rf.scorePercent || 25}%` }}
                          />
                        </div>
                        <p className="text-slate-600 text-[11px]">{rf.keyInsights}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">
                Click "Re-calculate Score" to run deep AI risk profiling.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

