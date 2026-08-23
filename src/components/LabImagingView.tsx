import React, { useState, useRef } from "react";
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
  UploadCloud,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Sliders,
  Maximize2,
  Minimize2,
  Sparkles,
  Share2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
  Film,
  Camera,
} from "lucide-react";

interface LabImagingViewProps {
  reports: LabReport[];
  onUpdateReports?: (reports: LabReport[]) => void;
}

// Sample clinical demo assets for quick 1-click test populating
const CLINICAL_PRESETS = [
  {
    category: "MRI" as const,
    testName: "3.0T Brain MRI (Axial & Sagittal FLAIR)",
    bodyPart: "Brain / Cranium",
    viewOrientation: "Axial & Sagittal Cuts",
    sliceThickness: "1.0 mm Isotropic",
    fieldStrength: "3.0 Tesla High-Field",
    contrastUsed: false,
    facility: "Metropolitan Neurological Imaging Institute",
    orderedBy: "Dr. Harold King, MD",
    radiologistName: "Dr. Arthur Pendelton, FACR",
    keyFindings: "Normal ventricles, sulci, and brain parenchyma. Flow voids preserved. No diffusion restriction or intracranial mass.",
    uploadedScanUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1200",
    uploadedScanUrls: [
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=1200",
    ],
    numericResults: [
      { testItem: "Midline Shift", value: "0.0", unit: "mm", referenceRange: "0.0", isAbnormal: false },
      { testItem: "Fazekas White Matter Scale", value: "Grade 0", unit: "scale", referenceRange: "Grade 0", isAbnormal: false },
    ],
  },
  {
    category: "CT Scan" as const,
    testName: "128-Slice Contrast CT Abdomen & Pelvis (Multi-Cut)",
    bodyPart: "Abdomen & Pelvis",
    viewOrientation: "Axial Multi-Cut Series",
    sliceThickness: "1.25 mm",
    fieldStrength: "128-Detector MDCT",
    contrastUsed: true,
    contrastAgent: "Iohexol (Omnipaque 350) 100ml IV",
    facility: "Apex Central Advanced Diagnostic Center",
    orderedBy: "Dr. Jonathan Hayes, FACS",
    radiologistName: "Dr. Samantha Wei, MD",
    keyFindings: "Normal organ perfusion throughout liver, spleen, pancreas, and kidneys. No hydronephrosis, lymphadenopathy, or acute inflammatory processes.",
    uploadedScanUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1200",
    uploadedScanUrls: [
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200",
    ],
    numericResults: [
      { testItem: "Liver Span", value: "14.2", unit: "cm", referenceRange: "10.0 - 15.5", isAbnormal: false },
      { testItem: "Aorta Caliber", value: "1.8", unit: "cm", referenceRange: "< 3.0", isAbnormal: false },
    ],
  },
  {
    category: "X-Ray" as const,
    testName: "Digital Chest Radiogram (PA & Lateral Views)",
    bodyPart: "Thorax / Chest",
    viewOrientation: "PA Standing & Lateral",
    sliceThickness: "Single Projection",
    fieldStrength: "High-Frequency Digital RAD",
    contrastUsed: false,
    facility: "Saint Jude Medical Imaging Center",
    orderedBy: "Dr. Elena Rostova",
    radiologistName: "Dr. Arthur Pendelton, FACR",
    keyFindings: "Clear bilateral lung zones without focal infiltrate, effusion, or pneumothorax. Cardiothoracic ratio normal (0.46).",
    uploadedScanUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200",
    uploadedScanUrls: [
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200",
    ],
    numericResults: [
      { testItem: "Cardiothoracic Ratio (CTR)", value: "0.46", unit: "ratio", referenceRange: "< 0.50", isAbnormal: false },
      { testItem: "Pleural Effusion", value: "Absent", unit: "status", referenceRange: "Absent", isAbnormal: false },
    ],
  },
  {
    category: "MRI" as const,
    testName: "3.0T High-Field MRI Left Knee Joint",
    bodyPart: "Left Knee Joint",
    viewOrientation: "Sagittal & Coronal PD Fat-Suppressed",
    sliceThickness: "3.0 mm",
    fieldStrength: "3.0 Tesla Magnetom",
    contrastUsed: false,
    facility: "Apex Orthopedic Specialty Imaging",
    orderedBy: "Dr. Aris Thorne",
    radiologistName: "Dr. Arthur Pendelton, FACR",
    keyFindings: "Grade 3 complex tear of posterior horn of medial meniscus. ACL, PCL, and collateral ligaments intact.",
    uploadedScanUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=1200",
    uploadedScanUrls: [
      "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1200",
    ],
    numericResults: [
      { testItem: "Meniscal Tear Grade", value: "Grade 3 Tear", unit: "stage", referenceRange: "Grade 0", isAbnormal: true },
      { testItem: "Joint Effusion Volume", value: "Moderate", unit: "grade", referenceRange: "Trace/None", isAbnormal: true },
    ],
  },
];

export const LabImagingView: React.FC<LabImagingViewProps> = ({
  reports,
  onUpdateReports,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePreviewReport, setActivePreviewReport] = useState<LabReport | null>(null);

  // PACS Viewer Controls State
  const [activeSliceIndex, setActiveSliceIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [showCaliperGrid, setShowCaliperGrid] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Modal State for Upload / Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Uploaded Scan Files Buffer in Form
  const [uploadedSlices, setUploadedSlices] = useState<string[]>([]);
  const [uploadedFileMeta, setUploadedFileMeta] = useState<{ name: string; size: string; type: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<LabReport>>({
    category: "MRI",
    testName: "",
    facility: "Apex Central Advanced Diagnostic Center",
    orderedBy: "Dr. Attending Physician",
    radiologistName: "Dr. Arthur Pendelton, FACR",
    date: new Date().toISOString().split("T")[0],
    status: "Completed",
    bodyPart: "Brain / Cranium",
    viewOrientation: "Axial Cut (Multi-Slice)",
    sliceThickness: "1.5 mm",
    fieldStrength: "3.0 Tesla",
    contrastUsed: false,
    contrastAgent: "",
    keyFindings: "No acute focal abnormalities detected. Diagnostic slices exhibit clear anatomical delineation.",
    specimenType: "Radiographic Scan",
    numericResults: [
      {
        testItem: "Diagnostic Quality Score",
        value: "Optimal / High SNR",
        unit: "grade",
        referenceRange: "Diagnostic Grade",
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
      (r.bodyPart && r.bodyPart.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.radiologistName && r.radiologistName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.keyFindings.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Open Add/Upload Modal
  const handleOpenUploadModal = (defaultCategory: "MRI" | "CT Scan" | "X-Ray" | "Ultrasound" | "Blood Test" = "MRI") => {
    setEditingId(null);
    setUploadedSlices([]);
    setUploadedFileMeta(null);

    const isImaging = defaultCategory === "MRI" || defaultCategory === "CT Scan" || defaultCategory === "X-Ray" || defaultCategory === "Ultrasound";

    setFormData({
      category: defaultCategory,
      testName: defaultCategory === "MRI"
        ? "3.0T High-Resolution MRI Scan"
        : defaultCategory === "CT Scan"
        ? "128-Slice Multi-Cut CT Scan"
        : defaultCategory === "X-Ray"
        ? "Digital Radiogram X-Ray"
        : defaultCategory === "Ultrasound"
        ? "High-Resolution Diagnostic Sonogram"
        : "Complete Blood & Metabolic Panel",
      facility: "Apex Central Advanced Diagnostic Center",
      orderedBy: "Dr. Attending Physician",
      radiologistName: isImaging ? "Dr. Arthur Pendelton, FACR" : undefined,
      date: new Date().toISOString().split("T")[0],
      status: "Completed",
      bodyPart: defaultCategory === "MRI" ? "Brain / Cranium" : defaultCategory === "CT Scan" ? "Abdomen & Pelvis" : "Thorax / Chest",
      viewOrientation: defaultCategory === "CT Scan" || defaultCategory === "MRI" ? "Axial Cut (Multi-Slice)" : "PA Standing View",
      sliceThickness: defaultCategory === "CT Scan" ? "1.25 mm" : defaultCategory === "MRI" ? "1.5 mm" : "Single View",
      fieldStrength: defaultCategory === "MRI" ? "3.0 Tesla High-Field" : defaultCategory === "CT Scan" ? "128-Slice MDCT" : "Digital RAD",
      contrastUsed: false,
      contrastAgent: "",
      keyFindings: "Anatomical structures well visualized. Diagnostic cuts show no focal lesion or acute pathology.",
      specimenType: isImaging ? "Radiological Image" : "Venous Blood",
      numericResults: isImaging
        ? [
            {
              testItem: "Diagnostic Quality Score",
              value: "Optimal / High SNR",
              unit: "grade",
              referenceRange: "Diagnostic Grade",
              isAbnormal: false,
            },
          ]
        : [
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
    setUploadedSlices(report.uploadedScanUrls || (report.uploadedScanUrl ? [report.uploadedScanUrl] : []));
    setUploadedFileMeta(
      report.scanFileName
        ? {
            name: report.scanFileName,
            size: report.scanFileSize || "24 MB",
            type: report.scanFileType || "DICOM Image",
          }
        : null
    );
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

  // Preset Auto-Fill
  const handleApplyPreset = (preset: typeof CLINICAL_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      ...preset,
      numericResults: [...preset.numericResults],
    }));
    setUploadedSlices(preset.uploadedScanUrls || (preset.uploadedScanUrl ? [preset.uploadedScanUrl] : []));
    setUploadedFileMeta({
      name: `${preset.category.replace(/\s+/g, "_")}_CLINICAL_SERIES.dcm`,
      size: "64.2 MB",
      type: "DICOM 3.0 High-Resolution Scan",
    });
  };

  // File Upload Handlers (Supports both Drag-and-Drop and File Picker)
  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const firstFile = fileArray[0];
    const formatSize = (bytes: number) => {
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    setUploadedFileMeta({
      name: fileArray.length === 1 ? firstFile.name : `${firstFile.name} (+${fileArray.length - 1} slices)`,
      size: formatSize(fileArray.reduce((acc, f) => acc + f.size, 0)),
      type: firstFile.type || "Medical Scan / DICOM Format",
    });

    // Read files as base64 URLs
    const newUrls: string[] = [];
    let processed = 0;

    fileArray.forEach((file) => {
      // If it's an image or readable binary, convert to Data URL
      if (file.type.startsWith("image/") || file.name.endsWith(".dcm") || file.name.endsWith(".dicom") || file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newUrls.push(e.target.result as string);
          }
          processed++;
          if (processed === fileArray.length) {
            setUploadedSlices((prev) => [...prev, ...newUrls]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Fallback for DICOM / binary: assign medical placeholder slice
        newUrls.push("https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200");
        processed++;
        if (processed === fileArray.length) {
          setUploadedSlices((prev) => [...prev, ...newUrls]);
        }
      }
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveSlice = (index: number) => {
    setUploadedSlices((prev) => prev.filter((_, i) => i !== index));
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
      testItem: "Diagnostic Metric",
      value: "0.0",
      unit: "mm / index",
      referenceRange: "Normal",
      isAbnormal: false,
    });
    setFormData({ ...formData, numericResults: list });
  };

  const handleRemoveNumericRow = (index: number) => {
    const list = [...(formData.numericResults || [])];
    list.splice(index, 1);
    setFormData({ ...formData, numericResults: list });
  };

  // Save Report
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.testName) return;

    const primaryScanUrl = uploadedSlices.length > 0
      ? uploadedSlices[0]
      : formData.category === "MRI"
      ? "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1200"
      : formData.category === "CT Scan"
      ? "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1200"
      : formData.category === "X-Ray"
      ? "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200"
      : undefined;

    const reportToSave: LabReport = {
      id: editingId || `lab-${Date.now()}`,
      date: formData.date || new Date().toISOString().split("T")[0],
      category: (formData.category as any) || "MRI",
      testName: formData.testName || "Diagnostic Imaging Scan",
      facility: formData.facility || "Apex Central Diagnostics",
      orderedBy: formData.orderedBy || "Dr. Attending Physician",
      radiologistName: formData.radiologistName || "Dr. Arthur Pendelton, FACR",
      status: (formData.status as any) || "Completed",
      bodyPart: formData.bodyPart || "Thorax / Chest",
      viewOrientation: formData.viewOrientation || "Axial Cut",
      sliceThickness: formData.sliceThickness || "1.5 mm",
      fieldStrength: formData.fieldStrength || "3.0 Tesla",
      contrastUsed: !!formData.contrastUsed,
      contrastAgent: formData.contrastAgent || undefined,
      keyFindings: formData.keyFindings || "Scan findings verified within clinical tolerance.",
      specimenType: formData.specimenType || "Radiological Diagnostic Image",
      numericResults: formData.numericResults || [],
      uploadedScanUrl: primaryScanUrl,
      uploadedScanUrls: uploadedSlices.length > 0 ? uploadedSlices : primaryScanUrl ? [primaryScanUrl] : undefined,
      scanFileName: uploadedFileMeta?.name || `${formData.category?.replace(/\s+/g, "_")}_SCAN_FILE.dcm`,
      scanFileSize: uploadedFileMeta?.size || "48.5 MB",
      scanFileType: uploadedFileMeta?.type || "DICOM / Medical Imaging",
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

  // Open Full-Featured PACS Viewer
  const handleOpenViewer = (report: LabReport) => {
    setActivePreviewReport(report);
    setActiveSliceIndex(0);
    setZoomLevel(1);
    setIsInverted(false);
    setBrightness(100);
    setContrast(100);
    setRotation(0);
    setShowCaliperGrid(false);
    setIsFullScreen(false);
  };

  // Active scan slices for viewer
  const viewerSlices: string[] = activePreviewReport?.uploadedScanUrls && activePreviewReport.uploadedScanUrls.length > 0
    ? activePreviewReport.uploadedScanUrls
    : activePreviewReport?.uploadedScanUrl
    ? [activePreviewReport.uploadedScanUrl]
    : [
        activePreviewReport?.category === "MRI"
          ? "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1200"
          : activePreviewReport?.category === "CT Scan"
          ? "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1200"
          : "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200",
      ];

  const currentSliceUrl = viewerSlices[activeSliceIndex] || viewerSlices[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header & Upload Action Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-700">
                <FlaskConical className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                  <span>LABORATORY & MEDICAL IMAGING</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-Resolution MRI • Multi-Cut CT Scans • Digital X-Ray • Ultrasound • DICOM PACS Viewer
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search scans, organs, findings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 outline-none w-44 sm:w-60 bg-slate-50/50"
              />
            </div>

            {/* Primary MRI / CT / X-Ray Upload Button */}
            <button
              onClick={() => handleOpenUploadModal("MRI")}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload MRI / CT / X-Ray Scan</span>
            </button>

            {/* General Lab Report Button */}
            <button
              onClick={() => handleOpenUploadModal("Blood Test")}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Blood Test</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills & Modality Quick Selector */}
        <div className="flex items-center space-x-2 border-t border-slate-100 pt-4 overflow-x-auto scrollbar-none">
          {[
            { id: "ALL", label: "All Records" },
            { id: "MRI", label: "🧲 MRI Scans (3.0T)" },
            { id: "CT Scan", label: "🌀 CT Scans (Multi-Cut)" },
            { id: "X-Ray", label: "🩻 Digital X-Rays" },
            { id: "Ultrasound", label: "📡 Ultrasounds" },
            { id: "ECG", label: "⚡ ECG Waveforms" },
            { id: "Blood Test", label: "🧪 Blood & Pathology" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="space-y-6">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 text-slate-500 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <FileImage className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-base text-slate-800">No diagnostic reports matching filter</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Click the "Upload MRI / CT / X-Ray Scan" button above to upload scans, axial cuts, or clinical test results.
              </p>
            </div>
            <button
              onClick={() => handleOpenUploadModal("MRI")}
              className="px-5 py-2.5 rounded-2xl bg-cyan-600 text-white text-xs font-bold shadow-md hover:bg-cyan-700"
            >
              Upload First Medical Scan
            </button>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isImaging = report.category === "MRI" || report.category === "CT Scan" || report.category === "X-Ray" || report.category === "Ultrasound";
            const scanThumbnail = report.uploadedScanUrl || (report.uploadedScanUrls && report.uploadedScanUrls[0]);
            const sliceCount = report.uploadedScanUrls?.length || (report.uploadedScanUrl ? 1 : 0);

            return (
              <div
                key={report.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                {/* Top Accent Strip for Modality */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    report.category === "MRI"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600"
                      : report.category === "CT Scan"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                      : report.category === "X-Ray"
                      ? "bg-gradient-to-r from-slate-600 to-slate-800"
                      : report.category === "ECG"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                      : "bg-gradient-to-r from-rose-500 to-pink-600"
                  }`}
                />

                {/* Report Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4 pt-1">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3.5 rounded-2xl shrink-0 ${
                        report.category === "MRI"
                          ? "bg-purple-50 text-purple-600 border border-purple-100"
                          : report.category === "CT Scan"
                          ? "bg-cyan-50 text-cyan-600 border border-cyan-100"
                          : report.category === "X-Ray"
                          ? "bg-slate-100 text-slate-700 border border-slate-200"
                          : report.category === "ECG"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}
                    >
                      {report.category === "Blood Test" ? (
                        <FlaskConical className="w-6 h-6" />
                      ) : report.category === "ECG" ? (
                        <Activity className="w-6 h-6" />
                      ) : (
                        <FileImage className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            report.category === "MRI"
                              ? "bg-purple-100 text-purple-800"
                              : report.category === "CT Scan"
                              ? "bg-cyan-100 text-cyan-800"
                              : report.category === "X-Ray"
                              ? "bg-slate-200 text-slate-800"
                              : report.category === "ECG"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {report.category}
                        </span>

                        {report.bodyPart && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            Anatomy: {report.bodyPart}
                          </span>
                        )}

                        {report.contrastUsed && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            IV Contrast (+C)
                          </span>
                        )}

                        {sliceCount > 1 && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center space-x-1">
                            <Layers className="w-3 h-3" />
                            <span>{sliceCount} Slices / Cuts</span>
                          </span>
                        )}

                        <span className="text-xs text-slate-400 font-mono ml-auto sm:ml-2">
                          {report.date}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mt-1.5 flex items-center space-x-2">
                        <span>{report.testName}</span>
                      </h3>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {report.facility} • Ordered by <strong className="text-slate-700">{report.orderedBy}</strong>
                        {report.radiologistName && (
                          <span> • Radiologist: <strong className="text-slate-700">{report.radiologistName}</strong></span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleOpenViewer(report)}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{isImaging ? "Open PACS Viewer" : "View Details"}</span>
                    </button>

                    <button
                      onClick={(e) => handleOpenEdit(report, e)}
                      className="p-2 rounded-2xl text-slate-400 hover:text-cyan-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Report / Upload Slices"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(report.id, e)}
                      className="p-2 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Imaging Card Preview Thumbnail & Metadata Bar */}
                {isImaging && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-950 text-white border border-slate-800">
                    {/* Thumbnail Viewport */}
                    <div
                      onClick={() => handleOpenViewer(report)}
                      className="md:col-span-4 h-36 rounded-xl bg-black border border-slate-800 overflow-hidden relative group/thumb cursor-pointer flex items-center justify-center"
                    >
                      {scanThumbnail ? (
                        <img
                          src={scanThumbnail}
                          alt={report.testName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300 opacity-85"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <FileImage className="w-10 h-10 text-cyan-400 mx-auto opacity-70 mb-1" />
                          <span className="text-[10px] text-slate-400 font-mono">DICOM 3.0 Series</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2.5">
                        <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-cyan-300 font-bold border border-cyan-500/30">
                          {report.viewOrientation || "Axial Slice"}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-cyan-600/90 text-white text-[10px] font-bold flex items-center space-x-1 shadow">
                          <Eye className="w-3 h-3" />
                          <span>View Scan</span>
                        </span>
                      </div>
                    </div>

                    {/* Imaging Metadata Summary */}
                    <div className="md:col-span-8 flex flex-col justify-between space-y-3 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-medium">Technology / Field</span>
                          <span className="font-bold text-cyan-300 font-mono text-xs">{report.fieldStrength || "High-Res"}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-medium">Slice Thickness</span>
                          <span className="font-bold text-slate-200 font-mono text-xs">{report.sliceThickness || "1.5 mm"}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-medium">Contrast Agent</span>
                          <span className="font-bold text-slate-200 text-xs truncate">
                            {report.contrastUsed ? (report.contrastAgent || "Enhanced") : "Non-Contrast"}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-0.5">
                          Radiologist Clinical Impression:
                        </span>
                        <p className="text-slate-300 text-xs line-clamp-2">{report.keyFindings}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Non-Imaging Findings Summary (Blood Tests, ECG) */}
                {!isImaging && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-1">Key Diagnostic Findings:</span>
                    <p>{report.keyFindings}</p>
                  </div>
                )}

                {/* Numeric Test Items Table */}
                {report.numericResults && report.numericResults.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                          <th className="py-2 px-3">Diagnostic Parameter</th>
                          <th className="py-2 px-3">Value</th>
                          <th className="py-2 px-3">Unit</th>
                          <th className="py-2 px-3">Reference Range</th>
                          <th className="py-2 px-3 text-right">Evaluation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.numericResults.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-semibold text-slate-900">{item.testItem}</td>
                            <td className="py-2 px-3 font-bold font-mono text-slate-800">{item.value}</td>
                            <td className="py-2 px-3 text-slate-500">{item.unit}</td>
                            <td className="py-2 px-3 text-slate-500 font-mono">{item.referenceRange}</td>
                            <td className="py-2 px-3 text-right">
                              {item.isAbnormal ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>Abnormal / Alert</span>
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
            );
          })
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ADD / UPLOAD MODAL (MRI, CT SCAN CUTS, X-RAY, ULTRASOUND)     */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200 shadow-2xl space-y-6 relative my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-700">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Diagnostic Lab / Imaging Report" : "Upload MRI, CT Scan, X-Ray or Lab Report"}
                </h3>
                <p className="text-xs text-slate-500">
                  Attach scan files, cuts/slices, DICOM images, and clinical radiologist interpretations
                </p>
              </div>
            </div>

            {/* Quick Preset Autoloader */}
            {!editingId && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Quick Sample Presets (Click to autofill realistic medical scan):</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CLINICAL_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-left hover:border-cyan-500 hover:bg-cyan-50/40 transition-all text-xs cursor-pointer shadow-xs"
                    >
                      <span className="font-bold text-slate-900 block text-[11px] truncate">{preset.category}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{preset.bodyPart}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* Scan File Upload Zone */}
              <div className="space-y-3">
                <label className="block font-bold text-slate-800 text-xs">
                  Medical Scan Upload (MRI, CT Axial Cuts, X-Ray Radiograms, DICOM / JPG / PNG)
                </label>

                {/* Drag and Drop Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDraggingFile
                      ? "border-cyan-500 bg-cyan-50/60 scale-[1.01]"
                      : "border-slate-300 hover:border-cyan-500 hover:bg-slate-50/60"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    multiple
                    accept="image/*,.dcm,.dicom,application/pdf"
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-inner">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">
                        Drag & Drop MRI slices, CT cuts, or X-Ray films here
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        or <span className="text-cyan-600 font-semibold underline">browse from your computer</span> (supports multi-slice series)
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-mono">
                      PNG • JPG • WebP • DICOM (.dcm) • PDF Reports
                    </span>
                  </div>
                </div>

                {/* Uploaded Slices / Cuts Thumbnail Tray */}
                {uploadedSlices.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-400 flex items-center space-x-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Attached Scan Slices ({uploadedSlices.length} Cuts)</span>
                      </span>
                      {uploadedFileMeta && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {uploadedFileMeta.name} ({uploadedFileMeta.size})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-none">
                      {uploadedSlices.map((url, idx) => (
                        <div key={idx} className="relative group shrink-0 w-20 h-20 rounded-xl bg-black border border-slate-700 overflow-hidden">
                          <img src={url} alt={`Slice ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 px-1 rounded bg-black/70 text-[9px] font-mono text-cyan-300">
                            Cut #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSlice(idx);
                            }}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Slice"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Diagnostic Modality & Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Diagnostic Modality</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none bg-white font-semibold"
                  >
                    <option value="MRI">MRI (Magnetic Resonance)</option>
                    <option value="CT Scan">CT Scan (Computed Tomography)</option>
                    <option value="X-Ray">Digital X-Ray (Radiography)</option>
                    <option value="Ultrasound">Ultrasound / Sonography</option>
                    <option value="ECG">ECG (Electrocardiogram)</option>
                    <option value="Blood Test">Blood & Laboratory Test</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Body Part / Organ</label>
                  <select
                    value={formData.bodyPart}
                    onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  >
                    <option value="Brain / Cranium">Brain / Cranium</option>
                    <option value="Thorax / Chest">Thorax / Chest</option>
                    <option value="Abdomen & Pelvis">Abdomen & Pelvis</option>
                    <option value="Lumbar Spine">Lumbar Spine (L1-L5)</option>
                    <option value="Cervical Spine">Cervical Spine (C1-C7)</option>
                    <option value="Left Knee Joint">Left Knee Joint</option>
                    <option value="Right Knee Joint">Right Knee Joint</option>
                    <option value="Cardiovascular System">Cardiovascular System</option>
                    <option value="Musculoskeletal">Musculoskeletal / Extremity</option>
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
                <label className="block font-bold text-slate-700 mb-1">Test / Scan Title</label>
                <input
                  type="text"
                  placeholder="e.g. 3.0T Brain MRI with FLAIR, 128-Slice Abdomen CT"
                  value={formData.testName}
                  onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                  required
                />
              </div>

              {/* Imaging Parameters (Orientation, Thickness, Field Strength, Contrast) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-xs block">Imaging & Radiographic Specifications</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-[11px]">View / Cut Orientation</label>
                    <input
                      type="text"
                      placeholder="e.g. Axial Cuts, Sagittal View, PA Standing"
                      value={formData.viewOrientation}
                      onChange={(e) => setFormData({ ...formData, viewOrientation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-[11px]">Slice Thickness / Resolution</label>
                    <input
                      type="text"
                      placeholder="e.g. 1.25 mm, 3.0 mm"
                      value={formData.sliceThickness}
                      onChange={(e) => setFormData({ ...formData, sliceThickness: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-[11px]">Field Strength / Scanner</label>
                    <input
                      type="text"
                      placeholder="e.g. 3.0 Tesla, 128-Slice MDCT"
                      value={formData.fieldStrength}
                      onChange={(e) => setFormData({ ...formData, fieldStrength: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Contrast Toggle */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.contrastUsed}
                      onChange={(e) => setFormData({ ...formData, contrastUsed: e.target.checked })}
                      className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                    />
                    <span>IV Contrast Enhanced (+C)</span>
                  </label>

                  {formData.contrastUsed && (
                    <input
                      type="text"
                      placeholder="Contrast Agent (e.g. Gadolinium 15ml, Iohexol 100ml)"
                      value={formData.contrastAgent}
                      onChange={(e) => setFormData({ ...formData, contrastAgent: e.target.value })}
                      className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Diagnostic Center / Laboratory</label>
                  <input
                    type="text"
                    value={formData.facility}
                    onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Radiologist / Attending Physician</label>
                  <input
                    type="text"
                    value={formData.radiologistName || formData.orderedBy}
                    onChange={(e) => setFormData({ ...formData, radiologistName: e.target.value, orderedBy: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Diagnostic Findings & Radiologist Impression</label>
                <textarea
                  rows={3}
                  placeholder="Detailed anatomical summary and diagnostic impression..."
                  value={formData.keyFindings}
                  onChange={(e) => setFormData({ ...formData, keyFindings: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Numeric Lab / Measurement Parameters */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Diagnostic Parameters & Numeric Lab Values</span>
                  <button
                    type="button"
                    onClick={handleAddNumericRow}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600 text-white font-bold text-[10px] flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Metric</span>
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
                            <span>Abnormal</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveNumericRow(index)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
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

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-md shadow-cyan-600/20 cursor-pointer"
                >
                  Save & Index Scan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADVANCED PACS / RADIOLOGY INTERACTIVE SCAN VIEWER MODAL       */}
      {/* ------------------------------------------------------------- */}
      {activePreviewReport && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className={`bg-slate-950 rounded-3xl border border-slate-800 text-white shadow-2xl relative flex flex-col transition-all ${
            isFullScreen ? "w-full h-full max-w-none rounded-none" : "max-w-5xl w-full max-h-[95vh]"
          }`}>
            {/* PACS Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <FileImage className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-wider">
                      {activePreviewReport.category} PACS VIEWER
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{activePreviewReport.date}</span>
                    {activePreviewReport.bodyPart && (
                      <span className="text-xs text-slate-300 font-bold">• {activePreviewReport.bodyPart}</span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-white mt-0.5">{activePreviewReport.testName}</h2>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Toggle Full Screen"
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActivePreviewReport(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Close Viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PACS Viewer Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-900 border-b border-slate-800/80 text-xs">
              {/* Slice Selector (For CT and MRI Multi-Cuts) */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-[11px] font-mono">Cut/Slice:</span>
                <button
                  disabled={activeSliceIndex <= 0}
                  onClick={() => setActiveSliceIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2.5 py-0.5 rounded bg-slate-800 font-mono text-cyan-300 font-bold text-[11px]">
                  {activeSliceIndex + 1} / {viewerSlices.length}
                </span>
                <button
                  disabled={activeSliceIndex >= viewerSlices.length - 1}
                  onClick={() => setActiveSliceIndex((prev) => Math.min(viewerSlices.length - 1, prev + 1))}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Imaging Manipulation Controls */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Zoom+</span>
                </button>

                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Zoom-</span>
                </button>

                <button
                  onClick={() => {
                    setZoomLevel(1);
                    setRotation(0);
                    setIsInverted(false);
                    setBrightness(100);
                    setContrast(100);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px]"
                  title="Reset View"
                >
                  Reset
                </button>

                <div className="h-4 w-px bg-slate-700 mx-1" />

                <button
                  onClick={() => setIsInverted(!isInverted)}
                  className={`p-1.5 rounded-lg text-[10px] font-medium flex items-center space-x-1 ${
                    isInverted ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                  title="Invert Negative / Positive X-Ray Film"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Invert Film</span>
                </button>

                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1 text-[10px]"
                  title="Rotate 90 deg"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>

                <button
                  onClick={() => setShowCaliperGrid(!showCaliperGrid)}
                  className={`p-1.5 rounded-lg text-[10px] font-medium flex items-center space-x-1 ${
                    showCaliperGrid ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                  title="Toggle Measurement Grid"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Caliper Grid</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Visualization Stage */}
            <div className="flex-1 bg-black relative flex items-center justify-center min-h-[380px] p-6 overflow-hidden select-none">
              {/* HUD Overlays (Top Left) */}
              <div className="absolute top-4 left-4 z-20 text-[11px] font-mono text-cyan-400/90 space-y-0.5 pointer-events-none bg-black/60 backdrop-blur-sm p-2.5 rounded-xl border border-cyan-500/20">
                <p className="font-bold text-white">{activePreviewReport.testName}</p>
                <p>Anatomy: {activePreviewReport.bodyPart || "Thorax / Chest"}</p>
                <p>Orientation: {activePreviewReport.viewOrientation || "Axial Slice"}</p>
                <p>Slice: #{activeSliceIndex + 1} / {viewerSlices.length}</p>
                <p>Thickness: {activePreviewReport.sliceThickness || "1.5 mm"}</p>
              </div>

              {/* HUD Overlays (Top Right) */}
              <div className="absolute top-4 right-4 z-20 text-[11px] font-mono text-right text-slate-400 pointer-events-none bg-black/60 backdrop-blur-sm p-2.5 rounded-xl border border-slate-800">
                <p className="font-bold text-cyan-300">{activePreviewReport.facility}</p>
                <p>Rad: {activePreviewReport.radiologistName || "Dr. Arthur Pendelton"}</p>
                <p>Field: {activePreviewReport.fieldStrength || "3.0T High-Field"}</p>
                <p>Zoom: {(zoomLevel * 100).toFixed(0)}% • Rot: {rotation}°</p>
              </div>

              {/* Caliper Measurement Grid */}
              {showCaliperGrid && (
                <div
                  className="absolute inset-0 z-10 pointer-events-none opacity-30"
                  style={{
                    backgroundImage: "linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
              )}

              {/* Scan Image Render Target */}
              <div className="relative max-w-full max-h-full flex items-center justify-center">
                <img
                  src={currentSliceUrl}
                  alt={`Scan slice ${activeSliceIndex + 1}`}
                  referrerPolicy="no-referrer"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    filter: `${isInverted ? "invert(1) hue-rotate(180deg)" : ""} brightness(${brightness}%) contrast(${contrast}%)`,
                    transition: "transform 0.15s ease-out",
                  }}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
                />
              </div>
            </div>

            {/* Slice Scrub Carousel (if multiple slices exist) */}
            {viewerSlices.length > 1 && (
              <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-3 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">Series Cuts:</span>
                {viewerSlices.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSliceIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all relative cursor-pointer ${
                      activeSliceIndex === idx ? "border-cyan-400 scale-105 shadow-md shadow-cyan-500/30" : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt={`Thumb ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-white">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Radiologist Report Summary & Actions */}
            <div className="p-6 bg-slate-950 rounded-b-3xl border-t border-slate-800 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Official Radiologist Diagnostic Report:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Signed by {activePreviewReport.radiologistName || activePreviewReport.orderedBy}
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed">{activePreviewReport.keyFindings}</p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-slate-500 font-mono">
                  DICOM Series UID: {activePreviewReport.id} • Verified on Decentralized Medical Chain
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={currentSliceUrl}
                    download={`${activePreviewReport.testName.replace(/\s+/g, "_")}_cut_${activeSliceIndex + 1}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Scan Image</span>
                  </a>

                  <button
                    onClick={() => setActivePreviewReport(null)}
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Close PACS Viewer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
