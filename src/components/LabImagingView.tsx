import React, { useState } from "react";
import { LabReport, LabResultItem } from "../types";
import {
  FlaskConical,
  FileImage,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Download,
  X,
  Plus,
  Edit2,
  Trash2,
  Search,
} from "lucide-react";

interface LabImagingViewProps {
  reports: LabReport[];
  onUpdateReports?: (reports: LabReport[]) => void;
}

export const LabImagingView: React.FC<LabImagingViewProps> = ({
  reports,
  onUpdateReports,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePreviewReport, setActivePreviewReport] = useState<LabReport | null>(null);

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<LabReport>>({
    category: "Blood Test",
    testName: "",
    facility: "Apex Central Diagnostic Laboratory",
    orderedBy: "Dr. Attending Physician",
    date: new Date().toISOString().split("T")[0],
    status: "Completed",
    keyFindings: "",
    specimenType: "Venous Blood",
    numericResults: [
      {
        testItem: "Hemoglobin",
        value: "14.2",
        unit: "g/dL",
        referenceRange: "13.5 - 17.5",
        isAbnormal: false,
      },
    ],
  });

  const filteredReports = reports.filter((r) => {
    const matchesCat = selectedCategory === "ALL" || r.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      r.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.keyFindings.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      category: "Blood Test",
      testName: "",
      facility: "Apex Central Diagnostic Laboratory",
      orderedBy: "Dr. Attending Physician",
      date: new Date().toISOString().split("T")[0],
      status: "Completed",
      keyFindings: "Within normal limits.",
      specimenType: "Venous Blood",
      numericResults: [
        {
          testItem: "Hemoglobin",
          value: "14.2",
          unit: "g/dL",
          referenceRange: "13.5 - 17.5",
          isAbnormal: false,
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (report: LabReport, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(report.id);
    setFormData({
      ...report,
      numericResults: report.numericResults ? [...report.numericResults] : [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this lab/imaging diagnostic report?")) {
      const updated = reports.filter((r) => r.id !== id);
      if (onUpdateReports) {
        onUpdateReports(updated);
      }
    }
  };

  // Helper to update numeric test item
  const handleNumericChange = (index: number, field: keyof LabResultItem, val: any) => {
    const list = [...(formData.numericResults || [])];
    list[index] = { ...list[index], [field]: val };
    setFormData({ ...formData, numericResults: list });
  };

  const handleAddNumericRow = () => {
    const list = [...(formData.numericResults || [])];
    list.push({
      testItem: "New Test Parameter",
      value: "0.0",
      unit: "mg/dL",
      referenceRange: "0.0 - 1.0",
      isAbnormal: false,
    });
    setFormData({ ...formData, numericResults: list });
  };

  const handleRemoveNumericRow = (index: number) => {
    const list = [...(formData.numericResults || [])];
    list.splice(index, 1);
    setFormData({ ...formData, numericResults: list });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.testName) return;

    const reportToSave: LabReport = {
      id: editingId || `lab-${Date.now()}`,
      date: formData.date || new Date().toISOString().split("T")[0],
      category: (formData.category as any) || "Blood Test",
      testName: formData.testName || "Diagnostic Test",
      facility: formData.facility || "Apex Central Diagnostics",
      orderedBy: formData.orderedBy || "Dr. Attending Physician",
      status: (formData.status as any) || "Completed",
      keyFindings: formData.keyFindings || "Findings within expected medical tolerances.",
      specimenType: formData.specimenType || "Blood / Sample",
      numericResults: formData.numericResults || [],
      imagingPreviewType: formData.imagingPreviewType || undefined,
    };

    if (onUpdateReports) {
      if (editingId) {
        onUpdateReports(reports.map((r) => (r.id === editingId ? reportToSave : r)));
      } else {
        onUpdateReports([reportToSave, ...reports]);
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header & Category filter */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
              <FlaskConical className="w-7 h-7 text-cyan-600" />
              <span>LABORATORY & IMAGING CENTER</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Blood Tests • X-Ray • MRI • CT Scan • ECG • Ultrasound Diagnostics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search lab records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 outline-none w-44 sm:w-56"
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lab / Imaging Report</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 border-t border-slate-100 pt-4 overflow-x-auto scrollbar-none">
          {["ALL", "Blood Test", "X-Ray", "MRI", "CT Scan", "ECG", "Ultrasound"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-cyan-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "ALL" ? "All Diagnostic Reports" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="space-y-6">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 text-slate-500 space-y-3">
            <FlaskConical className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No laboratory or imaging reports found</p>
            <p className="text-xs">Click "Add Lab / Imaging Report" to record new diagnostic lab results.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 hover:shadow-md transition-shadow"
            >
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3.5 rounded-2xl ${
                      report.category === "Blood Test"
                        ? "bg-rose-50 text-rose-600"
                        : report.category === "ECG"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-cyan-50 text-cyan-600"
                    }`}
                  >
                    {report.category === "Blood Test" ? (
                      <FlaskConical className="w-6 h-6" />
                    ) : (
                      <FileImage className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-extrabold uppercase">
                        {report.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{report.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{report.testName}</h3>
                    <p className="text-xs text-slate-500">
                      {report.facility} • Ordered by {report.orderedBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    onClick={() => setActivePreviewReport(report)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Scan & Report</span>
                  </button>

                  <button
                    onClick={(e) => handleOpenEdit(report, e)}
                    className="p-2 rounded-2xl text-slate-400 hover:text-cyan-600 hover:bg-slate-100 transition-colors"
                    title="Edit Report"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(report.id, e)}
                    className="p-2 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                    title="Delete Report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Findings Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">Key Diagnostic Findings:</span>
                <p>{report.keyFindings}</p>
              </div>

              {/* Numeric Test Items Table */}
              {report.numericResults && report.numericResults.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Test Parameter</th>
                        <th className="py-2.5 px-3">Measured Value</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3">Standard Reference Range</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.numericResults.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{item.testItem}</td>
                          <td className="py-2.5 px-3 font-bold font-mono text-slate-800">{item.value}</td>
                          <td className="py-2.5 px-3 text-slate-500">{item.unit}</td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono">{item.referenceRange}</td>
                          <td className="py-2.5 px-3 text-right">
                            {item.isAbnormal ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Abnormal</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Normal</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
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
              <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-700">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Diagnostic Lab / Imaging Report" : "Add New Lab / Imaging Report"}
                </h3>
                <p className="text-xs text-slate-500">Add test parameters, findings, and diagnostic metadata</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Diagnostic Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  >
                    <option value="Blood Test">Blood Test</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="MRI">MRI</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="ECG">ECG</option>
                    <option value="Ultrasound">Ultrasound</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date Conducted</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Test / Scan Name</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count (CBC), Chest Radiogram PA"
                  value={formData.testName}
                  onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Diagnostic Facility / Laboratory</label>
                  <input
                    type="text"
                    value={formData.facility}
                    onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ordered By (Doctor)</label>
                  <input
                    type="text"
                    value={formData.orderedBy}
                    onChange={(e) => setFormData({ ...formData, orderedBy: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Diagnostic Findings</label>
                <textarea
                  rows={2}
                  placeholder="Radiologist / pathologist clinical summary..."
                  value={formData.keyFindings}
                  onChange={(e) => setFormData({ ...formData, keyFindings: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Numeric Test Parameters */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Measured Lab Parameters (Numeric Results)</span>
                  <button
                    type="button"
                    onClick={handleAddNumericRow}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600 text-white font-bold text-[10px] flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Parameter</span>
                  </button>
                </div>

                {formData.numericResults && formData.numericResults.length > 0 ? (
                  <div className="space-y-2">
                    {formData.numericResults.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 bg-white rounded-xl border border-slate-200 items-center text-[11px]"
                      >
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            placeholder="Parameter Name"
                            value={item.testItem}
                            onChange={(e) => handleNumericChange(index, "testItem", e.target.value)}
                            className="w-full px-2 py-1 border rounded text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Value"
                            value={item.value}
                            onChange={(e) => handleNumericChange(index, "value", e.target.value)}
                            className="w-full px-2 py-1 border rounded text-xs font-mono"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Unit"
                            value={item.unit}
                            onChange={(e) => handleNumericChange(index, "unit", e.target.value)}
                            className="w-full px-2 py-1 border rounded text-xs"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            placeholder="Ref Range"
                            value={item.referenceRange}
                            onChange={(e) => handleNumericChange(index, "referenceRange", e.target.value)}
                            className="w-full px-2 py-1 border rounded text-xs font-mono"
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center justify-between space-x-1">
                          <label className="flex items-center space-x-1 text-[10px] text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.isAbnormal}
                              onChange={(e) => handleNumericChange(index, "isAbnormal", e.target.checked)}
                              className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                            />
                            <span>High/Abnormal</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveNumericRow(index)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px] italic">No numeric test parameters added yet.</p>
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
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-md"
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Imaging Preview Modal */}
      {activePreviewReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-3xl w-full border border-slate-800 text-white shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActivePreviewReport(null)}
              className="absolute top-6 right-6 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase">
                {activePreviewReport.category} VIEWER
              </span>
              <h2 className="text-xl font-bold text-white mt-2">{activePreviewReport.testName}</h2>
              <p className="text-xs text-slate-400">
                {activePreviewReport.facility} • {activePreviewReport.date}
              </p>
            </div>

            {/* Diagnostic Visualization Canvas */}
            <div className="bg-black rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center min-h-[280px] relative overflow-hidden group">
              {activePreviewReport.category === "X-Ray" || activePreviewReport.category === "MRI" || activePreviewReport.category === "CT Scan" ? (
                <div className="text-center space-y-3">
                  <div className="w-48 h-48 mx-auto rounded-2xl bg-gradient-to-tr from-slate-800 via-slate-900 to-black border-2 border-cyan-500/30 flex items-center justify-center relative shadow-2xl">
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl animate-pulse" />
                    <FileImage className="w-20 h-20 text-cyan-400 opacity-80" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-mono text-cyan-400">
                      DICOM 3.0 • High Res
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">High Resolution Radiographic Viewer Simulation</p>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <div className="h-28 w-full bg-slate-950 rounded-xl p-4 border border-emerald-500/30 flex items-center justify-center relative overflow-hidden">
                    <svg className="w-full h-full text-emerald-400" viewBox="0 0 500 100">
                      <path
                        d="M 0 50 L 50 50 L 60 20 L 70 80 L 80 10 L 90 90 L 100 50 L 200 50 L 210 20 L 220 80 L 230 10 L 240 90 L 250 50 L 350 50 L 360 20 L 370 80 L 380 10 L 390 90 L 400 50 L 500 50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-center text-emerald-400 font-mono">
                    12-Lead Real-time Waveform Verification Passed
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 space-y-1">
              <span className="font-bold text-cyan-300 block">Radiologist Report Summary:</span>
              <p>{activePreviewReport.keyFindings}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActivePreviewReport(null)}
                className="px-5 py-2.5 rounded-2xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
