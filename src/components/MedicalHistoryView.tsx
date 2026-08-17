import React, { useState } from "react";
import {
  MedicalHistory,
  DiseaseRecord,
  SurgeryRecord,
  VaccinationRecord,
  AllergyRecord,
  FamilyHistoryRecord,
  ChronicIllnessRecord,
  LifestyleInfo,
} from "../types";
import {
  Activity,
  Scissors,
  Syringe,
  Pill,
  AlertOctagon,
  Users,
  Flame,
  HeartPulse,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  UserCheck,
  AlertTriangle,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  Save,
  Building,
  Sparkles,
} from "lucide-react";

interface MedicalHistoryViewProps {
  history: MedicalHistory;
  onUpdateHistory: (updated: MedicalHistory) => void;
}

export const MedicalHistoryView: React.FC<MedicalHistoryViewProps> = ({
  history,
  onUpdateHistory,
}) => {
  const diseases = history?.diseases || [];
  const surgeries = history?.surgeries || [];
  const vaccinations = history?.vaccinations || [];
  const allergies = history?.allergies || [];
  const familyHistory = history?.familyHistory || [];
  const chronicIllnesses = history?.chronicIllnesses || [];

  const [activeTab, setActiveTab] = useState<
    "diseases" | "surgeries" | "vaccinations" | "allergies" | "family" | "chronic" | "lifestyle"
  >("diseases");

  const [searchQuery, setSearchQuery] = useState("");
  const [modalType, setModalType] = useState<
    "diseases" | "surgeries" | "vaccinations" | "allergies" | "family" | "chronic" | "lifestyle" | null
  >(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  // Diseases
  const [diseaseForm, setDiseaseForm] = useState<Partial<DiseaseRecord>>({
    name: "",
    diagnosedDate: new Date().toISOString().split("T")[0],
    status: "Active",
    doctor: "Dr. Attending Physician",
    severity: "Moderate",
  });

  // Surgeries
  const [surgeryForm, setSurgeryForm] = useState<Partial<SurgeryRecord>>({
    procedure: "",
    hospital: "Apex National Medical Center",
    surgeon: "Dr. Lead Surgeon",
    date: new Date().toISOString().split("T")[0],
    outcome: "Successful",
    notes: "",
  });

  // Vaccinations
  const [vaccineForm, setVaccineForm] = useState<Partial<VaccinationRecord>>({
    vaccine: "",
    doseNumber: "1st Dose",
    date: new Date().toISOString().split("T")[0],
    administeredBy: "Apex Health Nurse",
    nextDueDate: "",
    batchNo: `VAC-${Math.floor(100000 + Math.random() * 900000)}`,
  });

  // Allergies
  const [allergyForm, setAllergyForm] = useState<Partial<AllergyRecord>>({
    allergen: "",
    reaction: "",
    severity: "Moderate",
    onsetDate: new Date().toISOString().split("T")[0],
  });

  // Family History
  const [familyForm, setFamilyForm] = useState<Partial<FamilyHistoryRecord>>({
    condition: "",
    relation: "Father",
    onsetAge: "50s",
    riskFactor: "Moderate",
  });

  // Chronic Illness
  const [chronicForm, setChronicForm] = useState<Partial<ChronicIllnessRecord>>({
    condition: "",
    diagnosedYear: `${new Date().getFullYear()}`,
    carePlan: "Regular monitoring and prescribed medication",
    currentControlStatus: "Optimal",
  });

  // Lifestyle
  const [lifestyleForm, setLifestyleForm] = useState<LifestyleInfo>(
    history.lifestyle || {
      smokingStatus: "Non-smoker",
      alcoholConsumption: "Occasional",
      physicalActivity: "Active (3-5 days/wk)",
      sleepAvgHours: 7,
      dietType: "Balanced",
    }
  );

  // Helper to open modal for adding
  const handleOpenAdd = (category: typeof activeTab) => {
    setEditingId(null);
    setModalType(category);
    if (category === "diseases") {
      setDiseaseForm({
        name: "",
        diagnosedDate: new Date().toISOString().split("T")[0],
        status: "Active",
        doctor: "Dr. Attending Physician",
        severity: "Moderate",
      });
    } else if (category === "surgeries") {
      setSurgeryForm({
        procedure: "",
        hospital: "Apex National Medical Center",
        surgeon: "Dr. Lead Surgeon",
        date: new Date().toISOString().split("T")[0],
        outcome: "Successful",
        notes: "",
      });
    } else if (category === "vaccinations") {
      setVaccineForm({
        vaccine: "",
        doseNumber: "1st Dose",
        date: new Date().toISOString().split("T")[0],
        administeredBy: "Apex Health Nurse",
        nextDueDate: "",
        batchNo: `VAC-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    } else if (category === "allergies") {
      setAllergyForm({
        allergen: "",
        reaction: "",
        severity: "Moderate",
        onsetDate: new Date().toISOString().split("T")[0],
      });
    } else if (category === "family") {
      setFamilyForm({
        condition: "",
        relation: "Father",
        onsetAge: "50s",
        riskFactor: "Moderate",
      });
    } else if (category === "chronic") {
      setChronicForm({
        condition: "",
        diagnosedYear: `${new Date().getFullYear()}`,
        carePlan: "Regular monitoring and prescribed medication",
        currentControlStatus: "Optimal",
      });
    } else if (category === "lifestyle") {
      setLifestyleForm(history.lifestyle);
    }
  };

  // Delete helpers
  const handleDeleteDisease = (id: string) => {
    onUpdateHistory({
      ...history,
      diseases: history.diseases.filter((item) => item.id !== id),
    });
  };

  const handleDeleteSurgery = (id: string) => {
    onUpdateHistory({
      ...history,
      surgeries: history.surgeries.filter((item) => item.id !== id),
    });
  };

  const handleDeleteVaccination = (id: string) => {
    onUpdateHistory({
      ...history,
      vaccinations: history.vaccinations.filter((item) => item.id !== id),
    });
  };

  const handleDeleteAllergy = (id: string) => {
    onUpdateHistory({
      ...history,
      allergies: history.allergies.filter((item) => item.id !== id),
    });
  };

  const handleDeleteFamily = (id: string) => {
    onUpdateHistory({
      ...history,
      familyHistory: history.familyHistory.filter((item) => item.id !== id),
    });
  };

  const handleDeleteChronic = (id: string) => {
    onUpdateHistory({
      ...history,
      chronicIllnesses: history.chronicIllnesses.filter((item) => item.id !== id),
    });
  };

  // Submit handlers
  const handleSaveDisease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diseaseForm.name) return;

    if (editingId) {
      onUpdateHistory({
        ...history,
        diseases: history.diseases.map((d) =>
          d.id === editingId ? ({ ...d, ...diseaseForm } as DiseaseRecord) : d
        ),
      });
    } else {
      const newRec: DiseaseRecord = {
        id: `dis-${Date.now()}`,
        name: diseaseForm.name || "Condition",
        diagnosedDate: diseaseForm.diagnosedDate || new Date().toISOString().split("T")[0],
        status: diseaseForm.status as any || "Active",
        doctor: diseaseForm.doctor || "Dr. Attending Physician",
        severity: diseaseForm.severity as any || "Moderate",
      };
      onUpdateHistory({
        ...history,
        diseases: [newRec, ...history.diseases],
      });
    }
    setModalType(null);
  };

  const handleSaveSurgery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surgeryForm.procedure) return;

    if (editingId) {
      onUpdateHistory({
        ...history,
        surgeries: history.surgeries.map((s) =>
          s.id === editingId ? ({ ...s, ...surgeryForm } as SurgeryRecord) : s
        ),
      });
    } else {
      const newRec: SurgeryRecord = {
        id: `surg-${Date.now()}`,
        procedure: surgeryForm.procedure || "Surgical Procedure",
        hospital: surgeryForm.hospital || "Apex National Hospital",
        surgeon: surgeryForm.surgeon || "Dr. Attending Surgeon",
        date: surgeryForm.date || new Date().toISOString().split("T")[0],
        outcome: surgeryForm.outcome || "Successful",
        notes: surgeryForm.notes || "Procedure completed without complications.",
      };
      onUpdateHistory({
        ...history,
        surgeries: [newRec, ...history.surgeries],
      });
    }
    setModalType(null);
  };

  const handleSaveVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineForm.vaccine) return;

    if (editingId) {
      onUpdateHistory({
        ...history,
        vaccinations: history.vaccinations.map((v) =>
          v.id === editingId ? ({ ...v, ...vaccineForm } as VaccinationRecord) : v
        ),
      });
    } else {
      const newRec: VaccinationRecord = {
        id: `vac-${Date.now()}`,
        vaccine: vaccineForm.vaccine || "Vaccine",
        doseNumber: vaccineForm.doseNumber || "1st Dose",
        date: vaccineForm.date || new Date().toISOString().split("T")[0],
        administeredBy: vaccineForm.administeredBy || "Health Nurse",
        nextDueDate: vaccineForm.nextDueDate,
        batchNo: vaccineForm.batchNo || `VAC-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      onUpdateHistory({
        ...history,
        vaccinations: [newRec, ...history.vaccinations],
      });
    }
    setModalType(null);
  };

  const handleSaveAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allergyForm.allergen) return;

    if (editingId) {
      onUpdateHistory({
        ...history,
        allergies: history.allergies.map((a) =>
          a.id === editingId ? ({ ...a, ...allergyForm } as AllergyRecord) : a
        ),
      });
    } else {
      const newRec: AllergyRecord = {
        id: `alg-${Date.now()}`,
        allergen: allergyForm.allergen || "Allergen",
        reaction: allergyForm.reaction || "Allergic reaction",
        severity: allergyForm.severity as any || "Moderate",
        onsetDate: allergyForm.onsetDate || new Date().toISOString().split("T")[0],
      };
      onUpdateHistory({
        ...history,
        allergies: [newRec, ...history.allergies],
      });
    }
    setModalType(null);
  };

  const handleSaveFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyForm.condition) return;

    if (editingId) {
      onUpdateHistory({
        ...history,
        familyHistory: history.familyHistory.map((f) =>
          f.id === editingId ? ({ ...f, ...familyForm } as FamilyHistoryRecord) : f
        ),
      });
    } else {
      const newRec: FamilyHistoryRecord = {
        id: `fam-${Date.now()}`,
        condition: familyForm.condition || "Health Condition",
        relation: familyForm.relation || "Relative",
        onsetAge: familyForm.onsetAge || "50s",
        riskFactor: familyForm.riskFactor as any || "Moderate",
      };
      onUpdateHistory({
        ...history,
        familyHistory: [newRec, ...history.familyHistory],
      });
    }
    setModalType(null);
  };

  const handleSaveChronic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chronicForm.condition) return;

    if (editingId) {
      onUpdateHistory({
        ...history,
        chronicIllnesses: history.chronicIllnesses.map((c) =>
          c.id === editingId ? ({ ...c, ...chronicForm } as ChronicIllnessRecord) : c
        ),
      });
    } else {
      const newRec: ChronicIllnessRecord = {
        id: `chr-${Date.now()}`,
        condition: chronicForm.condition || "Chronic Illness",
        diagnosedYear: chronicForm.diagnosedYear || `${new Date().getFullYear()}`,
        carePlan: chronicForm.carePlan || "Monitored care plan",
        currentControlStatus: chronicForm.currentControlStatus as any || "Optimal",
      };
      onUpdateHistory({
        ...history,
        chronicIllnesses: [newRec, ...history.chronicIllnesses],
      });
    }
    setModalType(null);
  };

  const handleSaveLifestyle = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHistory({
      ...history,
      lifestyle: lifestyleForm,
    });
    setModalType(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title & Navigation Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
              <Activity className="w-7 h-7 text-blue-600" />
              <span>COMPLETE MEDICAL HISTORY</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Lifelong health record • Fully editable and synced with National Health Identity
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search medical history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none w-48 sm:w-64"
              />
            </div>
            <button
              onClick={() => handleOpenAdd(activeTab)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === "lifestyle"
                  ? "Edit Lifestyle Habits"
                  : `Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)} Record`}
              </span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-100 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "diseases", label: "Diseases & Conditions", icon: Activity, count: diseases.length },
            { id: "surgeries", label: "Surgeries & Procedures", icon: Scissors, count: surgeries.length },
            { id: "vaccinations", label: "Vaccinations", icon: Syringe, count: vaccinations.length },
            { id: "allergies", label: "Allergies & Sensitivities", icon: AlertOctagon, count: allergies.length },
            { id: "family", label: "Family History", icon: Users, count: familyHistory.length },
            { id: "chronic", label: "Chronic Illnesses", icon: HeartPulse, count: chronicIllnesses.length },
            { id: "lifestyle", label: "Lifestyle Habits", icon: Flame, count: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
                      isActive ? "bg-slate-800 text-cyan-300" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Diseases Content */}
      {activeTab === "diseases" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diseases
            .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((dis) => (
              <div
                key={dis.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{dis.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Diagnosed: {dis.diagnosedDate}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        dis.status === "Active"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : dis.status === "Managed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {dis.status}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(dis.id);
                        setDiseaseForm(dis);
                        setModalType("diseases");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="Edit Disease"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDisease(dis.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{dis.doctor}</span>
                  </span>
                  <span className="font-semibold text-slate-700">Severity: {dis.severity}</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Surgeries Content */}
      {activeTab === "surgeries" && (
        <div className="space-y-4">
          {surgeries
            .filter((s) => s.procedure.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((surg) => (
              <div
                key={surg.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                      <Scissors className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{surg.procedure}</h3>
                      <p className="text-xs text-slate-500">
                        {surg.hospital} • Surgeon: <strong className="text-slate-700">{surg.surgeon}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                      {surg.date}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(surg.id);
                        setSurgeryForm(surg);
                        setModalType("surgeries");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="Edit Surgery"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSurgery(surg.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Delete Surgery"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900">Outcome & Notes:</p>
                  <p className="mt-1">{surg.notes}</p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Vaccinations Content */}
      {activeTab === "vaccinations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vaccinations
            .filter((v) => v.vaccine.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((vac) => (
              <div
                key={vac.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3 relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                      <Syringe className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{vac.vaccine}</h3>
                      <p className="text-xs text-emerald-700 font-semibold">{vac.doseNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingId(vac.id);
                        setVaccineForm(vac);
                        setModalType("vaccinations");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="Edit Vaccination"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVaccination(vac.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-600 border-t border-slate-100 pt-3">
                  <p>
                    <strong className="text-slate-800">Administered:</strong> {vac.date} ({vac.administeredBy})
                  </p>
                  <p>
                    <strong className="text-slate-800">Batch No:</strong> {vac.batchNo}
                  </p>
                  {vac.nextDueDate && (
                    <p className="text-blue-600 font-semibold mt-1">
                      Next Due Booster: {vac.nextDueDate}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Allergies Content */}
      {activeTab === "allergies" && (
        <div className="space-y-4">
          {allergies
            .filter((a) => a.allergen.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((alg) => (
              <div
                key={alg.id}
                className={`rounded-3xl p-6 border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  alg.severity === "Critical"
                    ? "bg-rose-50/80 border-rose-200"
                    : alg.severity === "Severe"
                    ? "bg-amber-50/80 border-amber-200"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-2xl ${
                      alg.severity === "Critical" ? "bg-rose-200 text-rose-800" : "bg-amber-200 text-amber-800"
                    }`}
                  >
                    <AlertOctagon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-900">{alg.allergen}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                          alg.severity === "Critical"
                            ? "bg-rose-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {alg.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1">
                      Reaction: {alg.reaction}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-500 font-mono">First Noted: {alg.onsetDate}</span>
                  <button
                    onClick={() => {
                      setEditingId(alg.id);
                      setAllergyForm(alg);
                      setModalType("allergies");
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAllergy(alg.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Family History Content */}
      {activeTab === "family" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {familyHistory.map((fam) => (
            <div key={fam.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{fam.relation}</span>
                <div className="flex items-center space-x-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">
                    {fam.riskFactor} Risk
                  </span>
                  <button
                    onClick={() => {
                      setEditingId(fam.id);
                      setFamilyForm(fam);
                      setModalType("family");
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFamily(fam.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900">{fam.condition}</h3>
              <p className="text-xs text-slate-500">Onset Age: {fam.onsetAge}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chronic Illnesses Content */}
      {activeTab === "chronic" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chronicIllnesses.map((chr) => (
            <div key={chr.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{chr.condition}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Diagnosed Year: {chr.diagnosedYear}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                    {chr.currentControlStatus}
                  </span>
                  <button
                    onClick={() => {
                      setEditingId(chr.id);
                      setChronicForm(chr);
                      setModalType("chronic");
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteChronic(chr.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700">
                <p className="font-bold text-slate-900">Care Plan Summary:</p>
                <p className="mt-1">{chr.carePlan}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lifestyle Habits Content */}
      {activeTab === "lifestyle" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">
              Lifestyle & Health Habits
            </h2>
            <button
              onClick={() => {
                setLifestyleForm(history.lifestyle);
                setModalType("lifestyle");
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Lifestyle Habits</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Smoking Status</span>
              <p className="text-base font-bold text-slate-900">{history.lifestyle.smokingStatus}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Alcohol Consumption</span>
              <p className="text-base font-bold text-slate-900">{history.lifestyle.alcoholConsumption}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Physical Activity</span>
              <p className="text-base font-bold text-slate-900">{history.lifestyle.physicalActivity}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Average Sleep</span>
              <p className="text-base font-bold text-slate-900">{history.lifestyle.sleepAvgHours} Hours / Night</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Diet Plan</span>
              <p className="text-base font-bold text-slate-900">{history.lifestyle.dietType}</p>
            </div>
          </div>
        </div>
      )}

      {/* Unified Add / Edit Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 relative my-8">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-700">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Medical Record" : `Add New ${modalType.toUpperCase()} Record`}
                </h3>
                <p className="text-xs text-slate-500">
                  Update lifelong digital health record parameters
                </p>
              </div>
            </div>

            {/* Disease Form */}
            {modalType === "diseases" && (
              <form onSubmit={handleSaveDisease} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Disease / Diagnosis Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Type 2 Diabetes"
                    value={diseaseForm.name}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Diagnosed Date</label>
                    <input
                      type="date"
                      value={diseaseForm.diagnosedDate}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, diagnosedDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={diseaseForm.status}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Managed">Managed</option>
                      <option value="In Remission">In Remission</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Attending Doctor</label>
                    <input
                      type="text"
                      value={diseaseForm.doctor}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, doctor: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Severity</label>
                    <select
                      value={diseaseForm.severity}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, severity: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            )}

            {/* Surgeries Form */}
            {modalType === "surgeries" && (
              <form onSubmit={handleSaveSurgery} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Procedure Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Appendectomy"
                    value={surgeryForm.procedure}
                    onChange={(e) => setSurgeryForm({ ...surgeryForm, procedure: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hospital / Medical Center</label>
                    <input
                      type="text"
                      value={surgeryForm.hospital}
                      onChange={(e) => setSurgeryForm({ ...surgeryForm, hospital: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Lead Surgeon</label>
                    <input
                      type="text"
                      value={surgeryForm.surgeon}
                      onChange={(e) => setSurgeryForm({ ...surgeryForm, surgeon: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Procedure Date</label>
                  <input
                    type="date"
                    value={surgeryForm.date}
                    onChange={(e) => setSurgeryForm({ ...surgeryForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinical Notes & Outcome</label>
                  <textarea
                    rows={3}
                    placeholder="Describe surgical outcome, complications, recovery protocol..."
                    value={surgeryForm.notes}
                    onChange={(e) => setSurgeryForm({ ...surgeryForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md"
                  >
                    Save Surgery Record
                  </button>
                </div>
              </form>
            )}

            {/* Vaccination Form */}
            {modalType === "vaccinations" && (
              <form onSubmit={handleSaveVaccine} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vaccine Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Hepatitis B, COVID-19 mRNA"
                    value={vaccineForm.vaccine}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, vaccine: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dose Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Dose / Booster"
                      value={vaccineForm.doseNumber}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, doseNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Administered Date</label>
                    <input
                      type="date"
                      value={vaccineForm.date}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Batch / Lot Number</label>
                    <input
                      type="text"
                      value={vaccineForm.batchNo}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, batchNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Next Booster Due (Optional)</label>
                    <input
                      type="date"
                      value={vaccineForm.nextDueDate || ""}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, nextDueDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md"
                  >
                    Save Vaccination
                  </button>
                </div>
              </form>
            )}

            {/* Allergy Form */}
            {modalType === "allergies" && (
              <form onSubmit={handleSaveAllergy} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Allergen / Substance</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts, Latex"
                    value={allergyForm.allergen}
                    onChange={(e) => setAllergyForm({ ...allergyForm, allergen: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Severity Level</label>
                    <select
                      value={allergyForm.severity}
                      onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                      <option value="Critical">Critical (Anaphylaxis)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Onset Date</label>
                    <input
                      type="date"
                      value={allergyForm.onsetDate}
                      onChange={(e) => setAllergyForm({ ...allergyForm, onsetDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reaction Symptoms</label>
                  <input
                    type="text"
                    placeholder="e.g. Hives, Respiratory Distress, Facial Swelling"
                    value={allergyForm.reaction}
                    onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md"
                  >
                    Save Allergy Record
                  </button>
                </div>
              </form>
            )}

            {/* Family History Form */}
            {modalType === "family" && (
              <form onSubmit={handleSaveFamily} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condition / Hereditary Disease</label>
                  <input
                    type="text"
                    placeholder="e.g. Coronary Artery Disease"
                    value={familyForm.condition}
                    onChange={(e) => setFamilyForm({ ...familyForm, condition: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Family Relation</label>
                    <select
                      value={familyForm.relation}
                      onChange={(e) => setFamilyForm({ ...familyForm, relation: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Grandfather">Grandfather</option>
                      <option value="Grandmother">Grandmother</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Risk Factor Category</label>
                    <select
                      value={familyForm.riskFactor}
                      onChange={(e) => setFamilyForm({ ...familyForm, riskFactor: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Onset Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 40s, 60s"
                    value={familyForm.onsetAge}
                    onChange={(e) => setFamilyForm({ ...familyForm, onsetAge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md"
                  >
                    Save Family History
                  </button>
                </div>
              </form>
            )}

            {/* Chronic Illness Form */}
            {modalType === "chronic" && (
              <form onSubmit={handleSaveChronic} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chronic Illness Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Essential Hypertension"
                    value={chronicForm.condition}
                    onChange={(e) => setChronicForm({ ...chronicForm, condition: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Diagnosed Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2021"
                      value={chronicForm.diagnosedYear}
                      onChange={(e) => setChronicForm({ ...chronicForm, diagnosedYear: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Control Status</label>
                    <select
                      value={chronicForm.currentControlStatus}
                      onChange={(e) => setChronicForm({ ...chronicForm, currentControlStatus: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Optimal">Optimal</option>
                      <option value="Sub-optimal">Sub-optimal</option>
                      <option value="Requires Adjustment">Requires Adjustment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Care Plan Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Daily therapy, diet restrictions, doctor checkups..."
                    value={chronicForm.carePlan}
                    onChange={(e) => setChronicForm({ ...chronicForm, carePlan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md"
                  >
                    Save Chronic Record
                  </button>
                </div>
              </form>
            )}

            {/* Lifestyle Form */}
            {modalType === "lifestyle" && (
              <form onSubmit={handleSaveLifestyle} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Smoking Status</label>
                  <select
                    value={lifestyleForm.smokingStatus}
                    onChange={(e) => setLifestyleForm({ ...lifestyleForm, smokingStatus: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Non-smoker">Non-smoker</option>
                    <option value="Former smoker">Former smoker</option>
                    <option value="Current smoker">Current smoker</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alcohol Consumption</label>
                  <select
                    value={lifestyleForm.alcoholConsumption}
                    onChange={(e) => setLifestyleForm({ ...lifestyleForm, alcoholConsumption: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="None">None</option>
                    <option value="Occasional">Occasional</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Heavy">Heavy</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Physical Activity</label>
                  <select
                    value={lifestyleForm.physicalActivity}
                    onChange={(e) => setLifestyleForm({ ...lifestyleForm, physicalActivity: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Sedentary">Sedentary</option>
                    <option value="Light (1-2 days/wk)">Light (1-2 days/wk)</option>
                    <option value="Active (3-5 days/wk)">Active (3-5 days/wk)</option>
                    <option value="Athletic">Athletic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Average Sleep Hours per Night</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={lifestyleForm.sleepAvgHours}
                    onChange={(e) => setLifestyleForm({ ...lifestyleForm, sleepAvgHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Diet Type</label>
                  <select
                    value={lifestyleForm.dietType}
                    onChange={(e) => setLifestyleForm({ ...lifestyleForm, dietType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Balanced">Balanced</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Low Carb">Low Carb</option>
                    <option value="Keto">Keto</option>
                    <option value="Diabetic-Friendly">Diabetic-Friendly</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md"
                  >
                    Save Lifestyle Habits
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
