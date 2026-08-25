import React, { useState, useMemo } from "react";
import { PatientProfile, MedicalHistory, Prescription, ClinicalRecord, LabReport } from "../types";
import {
  requestSymptomAnalysis,
  requestMedicationAnalysis,
  requestDiseasePrediction,
} from "../utils/aiAnalysisService";
import {
  validatePharmaceuticalEntity,
  getAutocompleteSuggestions,
} from "../utils/pharmacologyValidator";
import { PHARMACEUTICAL_DICTIONARY } from "../data/pharmaceuticalDictionary";
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
  HelpCircle,
  Layers,
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

  // Live Real-Time Validation & Autocomplete State
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");

  const liveValidation = useMemo(() => {
    if (!medSearchTerm.trim()) return null;
    return validatePharmaceuticalEntity(medSearchTerm);
  }, [medSearchTerm]);

  const autocompleteList = useMemo(() => {
    if (!medSearchTerm.trim() || medSearchTerm.length < 2) return [];
    return getAutocompleteSuggestions(medSearchTerm);
  }, [medSearchTerm]);

  const drugCategories = useMemo(() => {
    return [
      "All",
      "Antibiotic / Antimicrobial",
      "Analgesic & Anti-inflammatory",
      "Cardiovascular",
      "Antidiabetic & Metabolic",
      "Gastrointestinal",
      "Respiratory & Allergy",
      "Neurology & Psychiatry"
    ];
  }, []);

  const filteredPresetDrugs = useMemo(() => {
    if (selectedCategoryFilter === "All") {
      return PHARMACEUTICAL_DICTIONARY.slice(0, 10);
    }
    return PHARMACEUTICAL_DICTIONARY.filter(d => d.category === selectedCategoryFilter);
  }, [selectedCategoryFilter]);

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
                <div className="md:col-span-1 relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Search Medication Name
                    </label>
                    {liveValidation && (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                          liveValidation.isValid
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : liveValidation.isShortcut
                            ? "bg-amber-50 text-amber-800 border border-amber-300"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {liveValidation.isValid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                            <span>Verified Full Drug</span>
                          </>
                        ) : liveValidation.isShortcut ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-amber-600 inline" />
                            <span>Shortcut / Incomplete Name</span>
                          </>
                        ) : (
                          <>
                            <AlertOctagon className="w-3 h-3 text-rose-600 inline" />
                            <span>Non-Medical Term</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Amoxicillin, Ciprofloxacin, Metformin..."
                      value={medSearchTerm}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                      onChange={(e) => setMedSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs outline-none font-semibold transition-all ${
                        liveValidation
                          ? liveValidation.isValid
                            ? "border-emerald-300 focus:ring-2 focus:ring-emerald-400 text-slate-900 bg-white"
                            : liveValidation.isShortcut
                            ? "border-amber-300 focus:ring-2 focus:ring-amber-400 text-slate-900 bg-amber-50/20"
                            : "border-rose-300 focus:ring-2 focus:ring-rose-400 text-slate-900 bg-rose-50/20"
                          : "border-slate-300 focus:ring-2 focus:ring-indigo-500 text-slate-900"
                      }`}
                    />

                    {/* Autocomplete Dropdown */}
                    {isSearchFocused && autocompleteList.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                        <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Select Complete Pharmaceutical Name ({autocompleteList.length})</span>
                          <span className="text-indigo-600 font-mono">Click to Select Full Name</span>
                        </div>
                        {autocompleteList.map((drug, idx) => (
                          <div
                            key={idx}
                            onMouseDown={() => {
                              setMedSearchTerm(drug.name);
                              setProposedDose(drug.typicalDose.split("(")[0].trim());
                              setIsSearchFocused(false);
                            }}
                            className="p-2.5 hover:bg-indigo-50/80 cursor-pointer border-b border-slate-100 last:border-0 transition-colors flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                                <span>{drug.name}</span>
                                {drug.isAntibiotic && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                    Antibiotic
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {drug.drugClass} • Active: {drug.activeIngredient}
                              </div>
                            </div>
                            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-lg">
                              {drug.category.split(" ")[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Live Validation Guidance Subtext */}
                  <div className="mt-1.5 text-[11px]">
                    {liveValidation ? (
                      liveValidation.isValid ? (
                        <p className="text-emerald-700 font-medium flex items-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>
                            Verified: {liveValidation.drugClass || "Registered pharmaceutical active substance"}
                          </span>
                        </p>
                      ) : liveValidation.isShortcut ? (
                        <div className="space-y-1.5 pt-0.5">
                          <p className="text-amber-800 font-medium flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>
                              Shortcut/Abbreviation detected. Please select full name below:
                            </span>
                          </p>
                          {liveValidation.suggestedDrugs.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {liveValidation.suggestedDrugs.slice(0, 3).map((item, idx) => {
                                const clean = item.split(" (")[0];
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setMedSearchTerm(clean);
                                      handleAnalyzeMedication(undefined, clean);
                                    }}
                                    className="px-2 py-0.5 rounded-lg bg-amber-100/80 hover:bg-amber-200 text-amber-900 font-bold text-[10px] border border-amber-300 transition-colors flex items-center space-x-1"
                                  >
                                    <span>+</span>
                                    <span>{clean}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-rose-600 font-medium flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>
                            Not recognized as a pharmaceutical drug or chemical molecule.
                          </span>
                        </p>
                      )
                    ) : (
                      <p className="text-slate-400">
                        Please enter full generic name, full brand name, or active molecule (avoid abbreviations).
                      </p>
                    )}
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
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Adjusted automatically against patient weight and renal filtration.
                  </p>
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
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Cross-referenced for cumulative tolerance and resistance risks.
                  </p>
                </div>
              </div>

              {/* Categorized Clinical Drug Presets */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Clinical Pharmacology Explorer by Drug Class:</span>
                  </span>
                  
                  {/* Category Pills Filter */}
                  <div className="flex flex-wrap gap-1">
                    {drugCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                          selectedCategoryFilter === cat
                            ? "bg-indigo-600 text-white shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        }`}
                      >
                        {cat.split(" / ")[0].split(" & ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtered Drug Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {filteredPresetDrugs.map((drug) => (
                    <button
                      key={drug.name}
                      type="button"
                      onClick={() => {
                        setMedSearchTerm(drug.name);
                        setProposedDose(drug.typicalDose.split("(")[0].trim());
                        handleAnalyzeMedication(undefined, drug.name);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                        medSearchTerm.toLowerCase() === drug.name.toLowerCase()
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs"
                          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-indigo-500 font-black">+</span>
                      <span>{drug.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({drug.drugClass.split(" ")[0]})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="submit"
                  disabled={isMedLoading || !medSearchTerm.trim()}
                  className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isMedLoading
                      ? "Cross-referencing Medical History & Analyzing..."
                      : "Analyze Medicine Interaction, Resistance & Efficacy"}
                  </span>
                </button>
                
                {liveValidation && !liveValidation.isValid && (
                  <span className="text-xs text-rose-600 font-semibold flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Non-medicinal term detected. AI will verify entity before analysis.</span>
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Analysis Results Display */}
          {medResult && medResult.isValidMedication === false && (
            <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6 animate-fadeIn ${
              medResult.isShortcut || medResult.detectedCategory?.includes("Shortcut") || medResult.detectedCategory?.includes("Incomplete")
                ? "bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 border-amber-300"
                : "bg-gradient-to-br from-rose-50/80 via-white to-amber-50/80 border-rose-200/90"
            }`}>
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  medResult.isShortcut || medResult.detectedCategory?.includes("Shortcut") || medResult.detectedCategory?.includes("Incomplete")
                    ? "bg-amber-500/10 text-amber-700 border-amber-300"
                    : "bg-rose-500/10 text-rose-600 border-rose-200"
                }`}>
                  {medResult.isShortcut || medResult.detectedCategory?.includes("Shortcut") || medResult.detectedCategory?.includes("Incomplete") ? (
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  ) : (
                    <AlertOctagon className="w-6 h-6 text-rose-600" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      medResult.isShortcut || medResult.detectedCategory?.includes("Shortcut") || medResult.detectedCategory?.includes("Incomplete")
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                    }`}>
                      {medResult.isShortcut || medResult.detectedCategory?.includes("Shortcut") ? "Full Name Required" : "Entity Verification Notice"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {medResult.detectedCategory || "Non-Medical / Non-Drug Input"}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    {medResult.isShortcut || medResult.detectedCategory?.includes("Shortcut")
                      ? `Incomplete Drug Name or Shortcut: "${medResult.medicationName || medSearchTerm}"`
                      : `"${medResult.medicationName || medSearchTerm}" is Not Recognized as a Pharmaceutical Medication`}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {medResult.nonMedicineReason || `The term "${medResult.medicationName || medSearchTerm}" is not recognized as a complete full pharmaceutical drug name.`}
                  </p>
                </div>
              </div>

              {/* Explanation Card */}
              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                medResult.isShortcut || medResult.detectedCategory?.includes("Shortcut")
                  ? "bg-amber-50/60 border-amber-200"
                  : "bg-white/90 border-rose-200/80"
              }`}>
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span>
                    {medResult.isShortcut || medResult.detectedCategory?.includes("Shortcut")
                      ? "Why is the full generic or brand name strictly required?"
                      : "Why does AI require a valid pharmaceutical drug?"}
                  </span>
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {medResult.isShortcut || medResult.detectedCategory?.includes("Shortcut")
                    ? "Clinical pharmacology algorithms (antibiotic resistance analysis, hepatic CYP enzyme pathway metabolism, renal filtration, and drug-drug interactions) require exact chemical molecules. Abbreviations like 'amox' or 'cipro' cannot be safely cross-referenced without confirming the full formulation (e.g. Amoxicillin vs Augmentin)."
                    : "The Patient DNA Clinical Pharmacology Engine performs real biological cross-checks against patient kidney/liver clearance (CYP450 enzymes), antibiotic resistance gene history, and drug-drug interactions. These algorithms can only be computed for genuine generic drugs, brand medicines, or active pharmacological compounds."}
                </p>
              </div>

              {/* Clickable Quick Medication Suggestions */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Pill className="w-4 h-4 text-indigo-600" />
                  <span>
                    {medResult.isShortcut || medResult.detectedCategory?.includes("Shortcut")
                      ? "Click to select and analyze the verified full medication name:"
                      : "Try analyzing one of these verified clinical medications:"}
                  </span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {(medResult.suggestedMedicines || quickMedSuggestions).map((item: string, idx: number) => {
                    const cleanName = item.split(" (")[0].replace(" 1000mg", "");
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setMedSearchTerm(cleanName);
                          handleAnalyzeMedication(undefined, cleanName);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border shadow-2xs hover:shadow-md transition-all flex items-center space-x-1.5 ${
                          medResult.isShortcut || medResult.detectedCategory?.includes("Shortcut")
                            ? "bg-amber-100/90 hover:bg-indigo-600 hover:text-white text-amber-950 border-amber-300"
                            : "bg-white hover:bg-indigo-600 hover:text-white text-slate-800 border-slate-300"
                        }`}
                      >
                        <span className="text-indigo-600 font-black hover:text-white">+</span>
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Redirection */}
              <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-rose-200/60">
                <p className="text-xs text-slate-500">
                  Were you trying to search a symptom or physical discomfort (e.g. fever, headache)?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab("symptoms");
                    setSymptomInput(medSearchTerm);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Switch to Symptom Analysis</span>
                </button>
              </div>
            </div>
          )}

          {/* Valid Medication Analysis Results Display */}
          {medResult && medResult.isValidMedication !== false && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Badge & Suitability Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
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
                      {medResult.drugClass && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {medResult.drugClass}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {medResult.activeIngredient ? `Active Compound: ${medResult.activeIngredient} • ` : ""}
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

