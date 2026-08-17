import React, { useState } from "react";
import { ClinicalRecord } from "../types";
import {
  FileText,
  Stethoscope,
  Building,
  Calendar,
  Heart,
  Thermometer,
  Activity,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle2,
} from "lucide-react";

interface ClinicalRecordsViewProps {
  records: ClinicalRecord[];
  onAddRecord: (record: ClinicalRecord) => void;
  onUpdateRecords?: (records: ClinicalRecord[]) => void;
}

export const ClinicalRecordsView: React.FC<ClinicalRecordsViewProps> = ({
  records,
  onAddRecord,
  onUpdateRecords,
}) => {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(records[0]?.id || null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ClinicalRecord>>({
    recordType: "OPD Visit",
    date: new Date().toISOString().split("T")[0],
    hospitalName: "Apex National University Medical Center",
    attendingDoctor: "Dr. Sarah Jenkins",
    department: "Internal Medicine",
    chiefComplaint: "",
    diagnosis: "",
    treatmentGiven: "",
    followUpNotes: "",
    vitals: {
      bp: "120/80",
      heartRate: 72,
      tempCelsius: 36.8,
      spO2: 98,
      respRate: 16,
      weightKg: 70,
      heightCm: 172,
    },
  });

  const filteredRecords = records.filter((r) => {
    const matchesFilter = filterType === "ALL" || r.recordType === filterType;
    const matchesQuery =
      searchQuery.trim() === "" ||
      r.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.attendingDoctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      recordType: "OPD Visit",
      date: new Date().toISOString().split("T")[0],
      hospitalName: "Apex National University Medical Center",
      attendingDoctor: "Dr. Sarah Jenkins",
      department: "Internal Medicine",
      chiefComplaint: "",
      diagnosis: "",
      treatmentGiven: "",
      followUpNotes: "Follow up in 2 weeks or as required.",
      vitals: {
        bp: "120/80",
        heartRate: 72,
        tempCelsius: 36.8,
        spO2: 98,
        respRate: 16,
        weightKg: 70,
        heightCm: 172,
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: ClinicalRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(rec.id);
    setFormData({ ...rec });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this clinical encounter record?")) {
      const updated = records.filter((r) => r.id !== id);
      if (onUpdateRecords) {
        onUpdateRecords(updated);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.diagnosis) return;

    const recordToSave: ClinicalRecord = {
      id: editingId || `cr-${Date.now()}`,
      date: formData.date || new Date().toISOString().split("T")[0],
      recordType: (formData.recordType as any) || "OPD Visit",
      hospitalName: formData.hospitalName || "Apex National Medical Center",
      attendingDoctor: formData.attendingDoctor || "Dr. Attending Physician",
      department: formData.department || "General Medicine",
      chiefComplaint: formData.chiefComplaint || "Routine consultation",
      diagnosis: formData.diagnosis || "Medical Consultation",
      treatmentGiven: formData.treatmentGiven || "Prescribed medication & rest",
      followUpNotes: formData.followUpNotes || "Follow up as advised",
      vitals: formData.vitals || {
        bp: "120/80",
        heartRate: 72,
        tempCelsius: 36.8,
        spO2: 98,
        respRate: 16,
        weightKg: 70,
        heightCm: 172,
      },
    };

    if (editingId) {
      if (onUpdateRecords) {
        onUpdateRecords(records.map((r) => (r.id === editingId ? recordToSave : r)));
      }
    } else {
      if (onUpdateRecords) {
        onUpdateRecords([recordToSave, ...records]);
      } else {
        onAddRecord(recordToSave);
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title & Filter bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
              <FileText className="w-7 h-7 text-indigo-600" />
              <span>CLINICAL RECORDS & ENCOUNTERS</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              OPD Visits • Inpatient Admissions • Surgical Operations • ICU Stays
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search encounters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-44 sm:w-56"
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Encounter</span>
            </button>
          </div>
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center space-x-2 border-t border-slate-100 pt-4 overflow-x-auto scrollbar-none">
          {["ALL", "OPD Visit", "Inpatient Admission", "Surgical Operation", "ICU Stay"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === type
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type === "ALL" ? "All Encounters" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Record Cards Timeline */}
      <div className="space-y-6">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 text-slate-500 space-y-3">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No clinical records found</p>
            <p className="text-xs">Click "Add New Encounter" to log a new clinical record.</p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const isExpanded = expandedId === record.id;
            return (
              <div
                key={record.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
              >
                {/* Card Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  className="p-6 cursor-pointer hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3.5 rounded-2xl ${
                        record.recordType === "OPD Visit"
                          ? "bg-blue-50 text-blue-600"
                          : record.recordType === "Inpatient Admission"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      <Stethoscope className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                            record.recordType === "OPD Visit"
                              ? "bg-blue-100 text-blue-800"
                              : record.recordType === "Inpatient Admission"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {record.recordType}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{record.date}</span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mt-1">{record.diagnosis}</h3>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {record.hospitalName} •{" "}
                        <strong className="text-slate-700">{record.attendingDoctor}</strong> ({record.department})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-auto">
                    <div className="hidden sm:flex items-center space-x-3 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100 mr-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">BP</span>
                        <span className="font-bold text-slate-800">{record.vitals?.bp || "N/A"}</span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Heart Rate</span>
                        <span className="font-bold text-slate-800">{record.vitals?.heartRate || 0} bpm</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleOpenEdit(record, e)}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      title="Edit Record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(record.id, e)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Detailed Breakdown */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-6">
                    {/* Chief Complaint & Treatment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                        <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                          Chief Complaint & Presentation
                        </span>
                        <p className="text-slate-700 leading-relaxed">{record.chiefComplaint}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                        <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                          Treatment Provided & Action Plan
                        </span>
                        <p className="text-slate-700 leading-relaxed">{record.treatmentGiven}</p>
                      </div>
                    </div>

                    {/* Vitals Grid */}
                    {record.vitals && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
                          Encounter Vitals Snapshot
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block">Blood Pressure</span>
                            <span className="font-bold text-slate-900">{record.vitals.bp}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block">Heart Rate</span>
                            <span className="font-bold text-slate-900">{record.vitals.heartRate} bpm</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block">Body Temp</span>
                            <span className="font-bold text-slate-900">{record.vitals.tempCelsius}°C</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block">SpO2 Oxygen</span>
                            <span className="font-bold text-emerald-700">{record.vitals.spO2}%</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block">Resp Rate</span>
                            <span className="font-bold text-slate-900">{record.vitals.respRate} /min</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block">Weight</span>
                            <span className="font-bold text-slate-900">{record.vitals.weightKg} kg</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Follow-up */}
                    {record.followUpNotes && (
                      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                        <p className="font-bold text-indigo-900">Follow-up Instructions:</p>
                        <p>{record.followUpNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
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
              <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Clinical Encounter" : "Add New Clinical Record"}
                </h3>
                <p className="text-xs text-slate-500">Log patient consultation, diagnosis, and vitals</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Record Type</label>
                  <select
                    value={formData.recordType}
                    onChange={(e) => setFormData({ ...formData, recordType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="OPD Visit">OPD Visit</option>
                    <option value="Inpatient Admission">Inpatient Admission</option>
                    <option value="Surgical Operation">Surgical Operation</option>
                    <option value="ICU Stay">ICU Stay</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Encounter Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Diagnosis</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hospital / Clinic</label>
                  <input
                    type="text"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Attending Doctor</label>
                  <input
                    type="text"
                    value={formData.attendingDoctor}
                    onChange={(e) => setFormData({ ...formData, attendingDoctor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chief Complaint</label>
                <textarea
                  rows={2}
                  placeholder="Patient presentation symptoms and duration..."
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Treatment Provided & Action Plan</label>
                <textarea
                  rows={2}
                  placeholder="Interventions, administered drugs, therapies..."
                  value={formData.treatmentGiven}
                  onChange={(e) => setFormData({ ...formData, treatmentGiven: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Follow-Up Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Return in 14 days for BP check"
                  value={formData.followUpNotes}
                  onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Vitals Input */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Patient Vitals at Encounter</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">BP (mmHg)</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={formData.vitals?.bp}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vitals: { ...formData.vitals!, bp: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={formData.vitals?.heartRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vitals: { ...formData.vitals!, heartRate: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.vitals?.tempCelsius}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vitals: { ...formData.vitals!, tempCelsius: parseFloat(e.target.value) || 36.8 },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">SpO2 (%)</label>
                    <input
                      type="number"
                      value={formData.vitals?.spO2}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vitals: { ...formData.vitals!, spO2: parseInt(e.target.value) || 98 },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Resp Rate (/min)</label>
                    <input
                      type="number"
                      value={formData.vitals?.respRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vitals: { ...formData.vitals!, respRate: parseInt(e.target.value) || 16 },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.vitals?.weightKg}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vitals: { ...formData.vitals!, weightKg: parseFloat(e.target.value) || 70 },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
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
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
