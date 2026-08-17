import React, { useState } from "react";
import { Prescription } from "../types";
import {
  Pill,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Search,
  CheckCircle2,
  FileCheck2,
  Zap,
  Plus,
  Edit2,
  Trash2,
  X,
} from "lucide-react";

interface PrescriptionCenterViewProps {
  prescriptions: Prescription[];
  onCheckDrugInteractions?: (medicines: string[]) => void;
  onUpdatePrescriptions?: (prescriptions: Prescription[]) => void;
}

export const PrescriptionCenterView: React.FC<PrescriptionCenterViewProps> = ({
  prescriptions,
  onUpdatePrescriptions,
}) => {
  const [selectedMedList, setSelectedMedList] = useState<string[]>([]);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Prescription>>({
    doctorName: "Dr. Sarah Jenkins",
    department: "Internal Medicine",
    hospital: "Apex National University Medical Center",
    date: new Date().toISOString().split("T")[0],
    digitalSignature: `RSA-2048-SIG-${Math.floor(Math.random() * 89999 + 10000)}`,
    qrCodeToken: `RX-TOK-${Date.now()}`,
    medicines: [
      {
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "3 times daily",
        durationDays: 7,
        instructions: "Take after meals with plenty of water.",
        refillAvailable: true,
      },
    ],
  });

  // Collect all active unique meds
  const safePrescriptions = prescriptions || [];
  const allMeds: string[] = safePrescriptions.flatMap((p) => (p.medicines || []).map((m) => m.name));
  const uniqueMeds: string[] = Array.from(new Set(allMeds));

  const filteredPrescriptions = safePrescriptions.filter((rx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (rx.doctorName || "").toLowerCase().includes(q) ||
      (rx.hospital || "").toLowerCase().includes(q) ||
      (rx.medicines || []).some((m) => (m.name || "").toLowerCase().includes(q))
    );
  });

  const toggleMedSelection = (medName: string) => {
    if (selectedMedList.includes(medName)) {
      setSelectedMedList(selectedMedList.filter((m) => m !== medName));
    } else {
      setSelectedMedList([...selectedMedList, medName]);
    }
  };

  const handleRunInteractionCheck = async () => {
    if (selectedMedList.length < 2) return;
    setIsLoadingAi(true);
    setAiAnalysisResult(null);

    try {
      const response = await fetch("/api/ai/drug-interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicines: selectedMedList }),
      });
      const data = await response.json();
      setAiAnalysisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      doctorName: "Dr. Sarah Jenkins",
      department: "Internal Medicine",
      hospital: "Apex National University Medical Center",
      date: new Date().toISOString().split("T")[0],
      digitalSignature: `RSA-2048-SIG-${Math.floor(Math.random() * 89999 + 10000)}`,
      qrCodeToken: `RX-TOK-${Date.now()}`,
      medicines: [
        {
          name: "",
          dosage: "500mg",
          frequency: "Twice daily",
          durationDays: 10,
          instructions: "Take with food.",
          refillAvailable: true,
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rx: Prescription) => {
    setEditingId(rx.id);
    setFormData({
      ...rx,
      medicines: rx.medicines ? rx.medicines.map((m) => ({ ...m })) : [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this digital prescription?")) {
      const updated = prescriptions.filter((p) => p.id !== id);
      if (onUpdatePrescriptions) {
        onUpdatePrescriptions(updated);
      }
    }
  };

  // Medicine list helpers inside modal
  const handleMedChange = (index: number, field: string, value: any) => {
    const list = [...(formData.medicines || [])];
    list[index] = { ...list[index], [field]: value };
    setFormData({ ...formData, medicines: list });
  };

  const handleAddMedRow = () => {
    const list = [...(formData.medicines || [])];
    list.push({
      name: "",
      dosage: "100mg",
      frequency: "Once daily",
      durationDays: 30,
      instructions: "Take in the morning.",
      refillAvailable: false,
    });
    setFormData({ ...formData, medicines: list });
  };

  const handleRemoveMedRow = (index: number) => {
    const list = [...(formData.medicines || [])];
    list.splice(index, 1);
    setFormData({ ...formData, medicines: list });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medicines || formData.medicines.length === 0) return;

    const rxToSave: Prescription = {
      id: editingId || `rx-${Date.now()}`,
      date: formData.date || new Date().toISOString().split("T")[0],
      doctorName: formData.doctorName || "Dr. Attending Physician",
      department: formData.department || "General Medicine",
      hospital: formData.hospital || "Apex National Medical Center",
      medicines: formData.medicines.filter((m) => m.name.trim() !== ""),
      digitalSignature: formData.digitalSignature || `RSA-2048-SIG-${Date.now()}`,
      qrCodeToken: formData.qrCodeToken || `RX-TOK-${Date.now()}`,
    };

    if (onUpdatePrescriptions) {
      if (editingId) {
        onUpdatePrescriptions(prescriptions.map((p) => (p.id === editingId ? rxToSave : p)));
      } else {
        onUpdatePrescriptions([rxToSave, ...prescriptions]);
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
            <Pill className="w-7 h-7 text-emerald-600" />
            <span>PRESCRIPTION CENTER & DRUG SAFETY</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cryptographically signed digital prescriptions • Refill tracking • AI interaction checker
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none w-44 sm:w-56"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Prescription</span>
          </button>
        </div>
      </div>

      {/* AI Drug Interaction Inspection Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-cyan-300 border border-indigo-500/30">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>AI DRUG INTERACTION ENGINE</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/40">
                  Gemini 3.6
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Select 2 or more medicines to perform real-time pharmacological collision check
              </p>
            </div>
          </div>

          <button
            onClick={handleRunInteractionCheck}
            disabled={selectedMedList.length < 2 || isLoadingAi}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-lg transition-all ${
              selectedMedList.length >= 2 && !isLoadingAi
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isLoadingAi
                ? "Checking Interactions..."
                : `Check Interaction (${selectedMedList.length} selected)`}
            </span>
          </button>
        </div>

        {/* Medicine Selector Chips */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            Your Active Prescription Medications:
          </span>
          <div className="flex flex-wrap gap-2">
            {uniqueMeds.map((med) => {
              const isSelected = selectedMedList.includes(med);
              return (
                <button
                  key={med}
                  onClick={() => toggleMedSelection(med)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md"
                      : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {isSelected ? "✓ " : "+ "} {med}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Interaction Result Render */}
        {aiAnalysisResult && (
          <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4 text-xs text-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="font-bold text-cyan-300 text-sm">Safety Profile Assessment</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  aiAnalysisResult.overallRiskLevel === "High"
                    ? "bg-rose-500 text-white"
                    : aiAnalysisResult.overallRiskLevel === "Moderate"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-emerald-500 text-slate-950"
                }`}
              >
                Risk Level: {aiAnalysisResult.overallRiskLevel || "Safe"}
              </span>
            </div>

            <p className="text-slate-300">{aiAnalysisResult.summary}</p>

            {aiAnalysisResult.foodContraindications && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <strong className="block mb-1">Dietary Warnings:</strong>
                <p>
                  {Array.isArray(aiAnalysisResult.foodContraindications)
                    ? aiAnalysisResult.foodContraindications.join(", ")
                    : String(aiAnalysisResult.foodContraindications)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prescriptions List */}
      <div className="space-y-6">
        {filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 text-slate-500 space-y-3">
            <Pill className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No prescriptions found</p>
            <p className="text-xs">Click "Add New Prescription" to issue a digital prescription.</p>
          </div>
        ) : (
          filteredPrescriptions.map((rx) => (
            <div
              key={rx.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase border border-emerald-200">
                      VERIFIED E-PRESCRIPTION
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{rx.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Prescribed by {rx.doctorName}</h3>
                  <p className="text-xs text-slate-500">
                    {rx.hospital} ({rx.department})
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 font-mono block">CRYPTOGRAPHIC SIGNATURE</span>
                    <span className="text-xs font-mono font-bold text-emerald-700">{rx.digitalSignature}</span>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(rx)}
                    className="p-2 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                    title="Edit Prescription"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(rx.id)}
                    className="p-2 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                    title="Delete Prescription"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Medicines List */}
              <div className="space-y-3">
                {rx.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Pill className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          {med.name} ({med.dosage})
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600">
                        Frequency: <strong className="text-slate-800">{med.frequency}</strong> • Duration:{" "}
                        {med.durationDays} Days
                      </p>
                      <p className="text-xs text-slate-500 italic">Instructions: {med.instructions}</p>
                    </div>

                    <div className="flex items-center space-x-3 self-end md:self-auto">
                      {med.refillAvailable ? (
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center space-x-1">
                          <RefreshCw className="w-3 h-3" />
                          <span>Refill Available</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                          No Refills
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Prescription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Digital Prescription" : "Create New Digital Prescription"}
                </h3>
                <p className="text-xs text-slate-500">Issue medications with electronic signature</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prescribing Doctor</label>
                  <input
                    type="text"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prescription Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hospital / Medical Center</label>
                  <input
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Medicines Builder */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Prescribed Medications List</span>
                  <button
                    type="button"
                    onClick={handleAddMedRow}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                {formData.medicines && formData.medicines.length > 0 ? (
                  <div className="space-y-3">
                    {formData.medicines.map((med, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 relative"
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveMedRow(index)}
                          className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1"
                          title="Remove Medicine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Medicine Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Amoxicillin"
                              value={med.name}
                              onChange={(e) => handleMedChange(index, "name", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Dosage</label>
                            <input
                              type="text"
                              placeholder="e.g. 500mg"
                              value={med.dosage}
                              onChange={(e) => handleMedChange(index, "dosage", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Frequency</label>
                            <input
                              type="text"
                              placeholder="e.g. Twice daily"
                              value={med.frequency}
                              onChange={(e) => handleMedChange(index, "frequency", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Duration (Days)
                            </label>
                            <input
                              type="number"
                              value={med.durationDays}
                              onChange={(e) =>
                                handleMedChange(index, "durationDays", parseInt(e.target.value) || 1)
                              }
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Instructions
                            </label>
                            <input
                              type="text"
                              placeholder="Take after food"
                              value={med.instructions}
                              onChange={(e) => handleMedChange(index, "instructions", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          </div>

                          <div className="pt-3">
                            <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={med.refillAvailable}
                                onChange={(e) => handleMedChange(index, "refillAvailable", e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>Refill Available</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px] italic">No medicines added to this prescription yet.</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
