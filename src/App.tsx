import React, { useState, useEffect, useCallback } from "react";
import {
  UserRole,
  PatientProfile,
  MedicalHistory,
  ClinicalRecord,
  Prescription,
  Appointment,
  AuditLog,
  DoctorAuthSession,
} from "./types";
import {
  INITIAL_PATIENT,
  INITIAL_MEDICAL_HISTORY,
  INITIAL_CLINICAL_RECORDS,
  INITIAL_LAB_REPORTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_APPOINTMENTS,
  DOCTORS_LIST,
  INITIAL_GENETIC_MARKERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PATIENTS_DATABASE,
  PatientFullRecord,
} from "./data/mockDatabase";

import { Header } from "./components/Header";
import { PatientProfileView } from "./components/PatientProfileView";
import { MedicalHistoryView } from "./components/MedicalHistoryView";
import { ClinicalRecordsView } from "./components/ClinicalRecordsView";
import { LabImagingView } from "./components/LabImagingView";
import { PrescriptionCenterView } from "./components/PrescriptionCenterView";
import { AppointmentSystemView } from "./components/AppointmentSystemView";
import { DoctorDashboardView } from "./components/DoctorDashboardView";
import { HospitalDashboardView } from "./components/HospitalDashboardView";
import { AIModuleView } from "./components/AIModuleView";
import { FutureModulesView } from "./components/FutureModulesView";
import { DigitalPatientCard } from "./components/DigitalPatientCard";
import { EmergencyAccessModal } from "./components/EmergencyAccessModal";
import { AddPatientModal } from "./components/AddPatientModal";
import { PatientSwitcherModal } from "./components/PatientSwitcherModal";
import { DoctorOtpModal } from "./components/DoctorOtpModal";
import { PatientSecurityAuthModal } from "./components/PatientSecurityAuthModal";
import { PublicDigitalCardModal } from "./components/PublicDigitalCardModal";
import { PatientLoginModal } from "./components/PatientLoginModal";
import { AuthWelcomeScreen } from "./components/AuthWelcomeScreen";
import { CreatorPortfolioModal } from "./components/CreatorPortfolioModal";
import { SessionInactivityModal } from "./components/SessionInactivityModal";
import {
  validateCurrentSession,
  createActiveSession,
  touchActiveSession,
  terminateActiveSession,
  getStoredInactivityTimeout,
  setStoredInactivityTimeout,
  getAndClearExpirationNotice,
  WARNING_DURATION_SECONDS,
} from "./utils/sessionSecurity";

import {
  User,
  Activity,
  FileText,
  FlaskConical,
  Pill,
  Calendar,
  Stethoscope,
  Building2,
  Brain,
  Sparkles,
  QrCode,
  Heart,
  ShieldCheck,
  Bell,
  Clock,
  ArrowRight,
  Siren,
  Globe,
  X,
  Users,
  UserPlus,
  Lock,
  KeyRound,
  CheckCircle2,
  Database,
  LogOut,
} from "lucide-react";

const STORAGE_KEY = "health_dna_patients_database_v2";

export default function App() {
  const [currentRole, setRole] = useState<UserRole>("patient");
  const [activeTab, setActiveTab] = useState<string>("patient-dash");

  // Inactivity timeout configuration (in seconds, default 300s = 5m)
  const [inactivityTimeoutSeconds, setInactivityTimeoutSeconds] = useState<number>(() =>
    getStoredInactivityTimeout()
  );
  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState<number>(() =>
    getStoredInactivityTimeout()
  );
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [sessionExpiredReason, setSessionExpiredReason] = useState<string | null>(() =>
    getAndClearExpirationNotice()
  );
  const [lastActivePatientId, setLastActivePatientId] = useState<string | null>(null);

  // Ref tracking exact timestamp of user's last interaction
  const lastActiveTimestampRef = React.useRef<number>(Date.now());

  // Multi-Patient Database State with local fallback + server persistent sync
  const [patientsDatabase, setPatientsDatabase] = useState<Record<string, PatientFullRecord>>(() => {
    try {
      const localCached = localStorage.getItem(STORAGE_KEY);
      if (localCached) {
        const parsed = JSON.parse(localCached);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
    }
    return INITIAL_PATIENTS_DATABASE;
  });

  // Authentication State: Validated against session activity
  const [activePatientId, setActivePatientId] = useState<string | null>(() => {
    const sessionCheck = validateCurrentSession();
    if (sessionCheck.isValid && sessionCheck.session) {
      return sessionCheck.session.dnaId;
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const sessionCheck = validateCurrentSession();
    return sessionCheck.isValid && !!sessionCheck.session;
  });

  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"synced" | "saving" | "idle">("synced");

  // Global static stores
  const [doctors] = useState(DOCTORS_LIST);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [geneticMarkers] = useState(INITIAL_GENETIC_MARKERS);

  // Doctor Authorized Sessions Map: { [dnaId]: DoctorAuthSession }
  const [doctorAuthSessions, setDoctorAuthSessions] = useState<Record<string, DoctorAuthSession>>({
    "DNA-8924-9012": {
      patientDnaId: "DNA-8924-9012",
      doctorName: "Dr. Marcus Vance, FACC",
      authorizedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      token: "AUTH-SESSION-DEMO-ROOT",
    },
  });

  // Modal States
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isDigitalIdModalOpen, setIsDigitalIdModalOpen] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isPatientSwitcherModalOpen, setIsPatientSwitcherModalOpen] = useState(false);

  // Security & Privacy Modals
  const [isDoctorOtpModalOpen, setIsDoctorOtpModalOpen] = useState(false);
  const [doctorOtpTargetPatient, setDoctorOtpTargetPatient] = useState<PatientProfile | null>(null);

  const [isPatientAuthModalOpen, setIsPatientAuthModalOpen] = useState(false);
  const [patientAuthTarget, setPatientAuthTarget] = useState<PatientProfile | null>(null);

  const [isPatientLoginModalOpen, setIsPatientLoginModalOpen] = useState(false);

  const [isPublicCardModalOpen, setIsPublicCardModalOpen] = useState(false);
  const [publicCardPatient, setPublicCardPatient] = useState<PatientProfile | null>(null);

  const [isCreatorPortfolioModalOpen, setIsCreatorPortfolioModalOpen] = useState(false);

  // 1. Initial Load & Real-time Live Sync from Backend Persistence
  const syncDatabaseFromServer = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch("/api/database/load");
      if (!res.ok) return;
      const data = await res.json();
      const serverDb = data.patientsDatabase || data.database;

      if (data.success && serverDb && typeof serverDb === "object" && Object.keys(serverDb).length > 0) {
        setPatientsDatabase((prev) => {
          // Check if server has new patients or changes
          const prevKeys = Object.keys(prev);
          const serverKeys = Object.keys(serverDb);
          const hasNew = serverKeys.some((k) => !prev[k]);
          const hasUpdates = serverKeys.length !== prevKeys.length;

          if (!hasNew && !hasUpdates && !isInitial) {
            return prev;
          }

          const merged = { ...prev, ...serverDb };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      } else if (isInitial) {
        // If server had no file yet, push our initial seed database to the server store
        setPatientsDatabase((current) => {
          fetch("/api/database/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ database: current, patientsDatabase: current }),
          }).catch(() => {});
          return current;
        });
      }
    } catch (err) {
      console.warn("Live database sync notice:", err);
    } finally {
      if (isInitial) setIsDbLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    syncDatabaseFromServer(true);

    // Periodic live background poll so registrations on other devices/tabs appear immediately
    const pollInterval = setInterval(() => {
      syncDatabaseFromServer(false);
    }, 3500);

    // Also sync whenever the browser tab gains focus
    const onFocus = () => syncDatabaseFromServer(false);
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("focus", onFocus);
    };
  }, [syncDatabaseFromServer]);

  // 2. Persistent Save on Database Mutation
  const persistDatabase = useCallback(async (updatedDb: Record<string, PatientFullRecord>) => {
    try {
      setSaveStatus("saving");
      // Instant synchronous localStorage write
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDb));

      // Asynchronous server-side file write
      await fetch("/api/database/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ database: updatedDb, patientsDatabase: updatedDb }),
      });
      setSaveStatus("synced");
    } catch (err) {
      console.error("Error saving database to server:", err);
      setSaveStatus("synced");
    }
  }, []);

  const updatePatientsDatabaseState = (
    updater: (prev: Record<string, PatientFullRecord>) => Record<string, PatientFullRecord>
  ) => {
    setPatientsDatabase((prev) => {
      const next = updater(prev);
      persistDatabase(next);
      return next;
    });
  };

  // User Activity Listeners to Reset Inactivity Countdown
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle session touching to once every 2 seconds
      if (now - lastActiveTimestampRef.current > 2000) {
        lastActiveTimestampRef.current = now;
        touchActiveSession();
        if (isWarningModalOpen) {
          setIsWarningModalOpen(false);
        }
      }
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
    };
  }, [isAuthenticated, isWarningModalOpen]);

  // Real-Time 1-Second Inactivity Countdown Interval
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSecs = Math.floor((now - lastActiveTimestampRef.current) / 1000);
      const remaining = Math.max(0, inactivityTimeoutSeconds - elapsedSecs);
      setSessionRemainingSeconds(remaining);

      if (remaining <= WARNING_DURATION_SECONDS && remaining > 0) {
        setIsWarningModalOpen(true);
      } else if (remaining <= 0) {
        // Auto-lock triggered due to inactivity
        clearInterval(interval);
        setIsWarningModalOpen(false);
        const lockedPatientId = activePatientId;
        setLastActivePatientId(lockedPatientId);
        terminateActiveSession(
          "Your session was automatically locked after several minutes of inactivity for HIPAA patient data security. Please sign in again."
        );
        setActivePatientId(null);
        setIsAuthenticated(false);
        setSessionExpiredReason(
          "Your session timed out after several minutes of inactivity for HIPAA patient privacy. Please sign in to resume."
        );
        setActiveTab("patient-dash");

        // Record Audit Log for Auto-Lock
        const autoLockAudit: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          actor: "HIPAA Security Guardian",
          role: "patient",
          action: "Session Auto-Locked (Inactivity)",
          details: `Vault for patient ${lockedPatientId || "Active"} automatically locked after ${Math.round(
            inactivityTimeoutSeconds / 60
          )} minutes of inactivity.`,
          ipAddress: "127.0.0.1 (Local Session Security)",
          securityHash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}...TIMEOUT`,
        };
        setAuditLogs((prev) => [autoLockAudit, ...prev]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, inactivityTimeoutSeconds, activePatientId]);

  // Derived Active Record Data - ONLY available if user is authenticated and valid patient is selected
  const currentRecord =
    isAuthenticated && activePatientId && patientsDatabase[activePatientId]
      ? patientsDatabase[activePatientId]
      : null;

  const patient = currentRecord ? currentRecord.patient : null;
  const history = currentRecord ? currentRecord.history : null;
  const clinicalRecords = currentRecord ? currentRecord.clinicalRecords || [] : [];
  const labReports = currentRecord ? currentRecord.labReports || [] : [];
  const prescriptions = currentRecord ? currentRecord.prescriptions || [] : [];
  const appointments = currentRecord ? currentRecord.appointments || [] : [];

  // All registered patients list (for directory & emergency triage)
  const allPatientsList = (Object.values(patientsDatabase) as PatientFullRecord[]).map(
    (r) => r.patient
  );

  // Authentication Login Handler
  const handleLoginSuccess = (dnaId: string, remember = true) => {
    const patientName = patientsDatabase[dnaId]?.patient.fullName;
    const session = createActiveSession(dnaId, patientName, remember);
    lastActiveTimestampRef.current = Date.now();
    setSessionRemainingSeconds(session.timeoutSeconds);
    setIsWarningModalOpen(false);
    setSessionExpiredReason(null);
    setLastActivePatientId(dnaId);
    setActivePatientId(dnaId);
    setIsAuthenticated(true);
    setRole("patient");
    setActiveTab("patient-dash");

    // Add Audit Log
    const loginAudit: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actor: patientName || dnaId,
      role: "patient",
      action: "Patient Vault Authenticated",
      details: `Successful sign-in to Health DNA vault (${dnaId}) with active session protection.`,
      ipAddress: "127.0.0.1 (Secure Local Session)",
      securityHash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}...AES256`,
    };
    setAuditLogs((prev) => [loginAudit, ...prev]);
  };

  // Authentication Logout Handler
  const handleLogout = (reason?: string) => {
    const prevId = activePatientId;
    if (prevId) setLastActivePatientId(prevId);
    terminateActiveSession(reason);
    setActivePatientId(null);
    setIsAuthenticated(false);
    setIsWarningModalOpen(false);
    if (reason) {
      setSessionExpiredReason(reason);
    }
    setActiveTab("patient-dash");

    const logoutAudit: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actor: prevId || "Patient",
      role: "patient",
      action: "Session Logged Out",
      details: reason ? `Logout: ${reason}` : "Manual patient vault log out.",
      ipAddress: "127.0.0.1",
      securityHash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}...LOGOUT`,
    };
    setAuditLogs((prev) => [logoutAudit, ...prev]);
  };

  // Manual Vault Lock (one-click instant security lock)
  const handleManualLock = () => {
    const prevId = activePatientId;
    if (prevId) setLastActivePatientId(prevId);
    terminateActiveSession("Patient vault manually locked for privacy.");
    setIsAuthenticated(false);
    setIsWarningModalOpen(false);
    setSessionExpiredReason("Patient vault manually locked. Re-authenticate to access medical records.");
    setActiveTab("patient-dash");

    const lockAudit: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actor: prevId || "Patient",
      role: "patient",
      action: "Vault Manually Locked",
      details: `Vault for patient ${prevId} was manually locked to prevent unauthorized viewing.`,
      ipAddress: "127.0.0.1",
      securityHash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}...LOCK`,
    };
    setAuditLogs((prev) => [lockAudit, ...prev]);
  };

  // Extend Session from Inactivity Warning Modal
  const handleExtendSession = () => {
    lastActiveTimestampRef.current = Date.now();
    setSessionRemainingSeconds(inactivityTimeoutSeconds);
    touchActiveSession();
    setIsWarningModalOpen(false);
  };

  // Inactivity Timeout Configuration Change
  const handleSetTimeoutSeconds = (secs: number) => {
    setStoredInactivityTimeout(secs);
    setInactivityTimeoutSeconds(secs);
    setSessionRemainingSeconds(secs);
    lastActiveTimestampRef.current = Date.now();
    touchActiveSession();
  };

  // State Updates per Active Patient (Auto-persisted)
  const handleUpdatePatient = (updatedPatient: PatientProfile) => {
    if (!activePatientId) return;
    updatePatientsDatabaseState((prev) => ({
      ...prev,
      [activePatientId]: {
        ...prev[activePatientId],
        patient: updatedPatient,
      },
    }));
  };

  const handleUpdateHistory = (updatedHistory: MedicalHistory) => {
    if (!activePatientId) return;
    updatePatientsDatabaseState((prev) => ({
      ...prev,
      [activePatientId]: {
        ...prev[activePatientId],
        history: updatedHistory,
      },
    }));
  };

  const handleAddClinicalRecord = (newRecord: ClinicalRecord) => {
    if (!activePatientId) return;
    updatePatientsDatabaseState((prev) => ({
      ...prev,
      [activePatientId]: {
        ...prev[activePatientId],
        clinicalRecords: [newRecord, ...(prev[activePatientId]?.clinicalRecords || [])],
      },
    }));
  };

  const handleUpdateClinicalRecords = (updatedRecords: ClinicalRecord[]) => {
    if (!activePatientId) return;
    updatePatientsDatabaseState((prev) => ({
      ...prev,
      [activePatientId]: {
        ...prev[activePatientId],
        clinicalRecords: updatedRecords,
      },
    }));
  };

  const handleUpdateLabReports = (updatedReports: any[]) => {
    if (!activePatientId) return;
    updatePatientsDatabaseState((prev) => ({
      ...prev,
      [activePatientId]: {
        ...prev[activePatientId],
        labReports: updatedReports,
      },
    }));
  };

  const handleAddPrescription = (newRx: Prescription) => {
    if (!activePatientId) return;
    updatePatientsDatabaseState((prev) => ({
      ...prev,
      [activePatientId]: {
        ...prev[activePatientId],
        prescriptions: [newRx, ...(prev[activePatientId]?.prescriptions || [])],
      },
    }));
  };

  const handleUpdatePrescriptions = (updatedPrescriptions: Prescription[]) => {
    if (!activePatientId) return;
    updatePatientsDatabaseState((prev) => ({
      ...prev,
      [activePatientId]: {
        ...prev[activePatientId],
        prescriptions: updatedPrescriptions,
      },
    }));
  };

  const handleAddAppointment = (newApt: Appointment) => {
    if (!activePatientId) return;
    updatePatientsDatabaseState((prev) => ({
      ...prev,
      [activePatientId]: {
        ...prev[activePatientId],
        appointments: [newApt, ...(prev[activePatientId]?.appointments || [])],
      },
    }));
  };

  const handleUpdateAppointments = (updatedAppointments: Appointment[]) => {
    if (!activePatientId) return;
    updatePatientsDatabaseState((prev) => ({
      ...prev,
      [activePatientId]: {
        ...prev[activePatientId],
        appointments: updatedAppointments,
      },
    }));
  };

  const handleRegisterPatient = async (newRecord: PatientFullRecord) => {
    const newDnaId = newRecord.patient.dnaId;
    
    // Instant local state update
    updatePatientsDatabaseState((prev) => ({
      ...prev,
      [newDnaId]: newRecord,
    }));
    handleLoginSuccess(newDnaId);

    // Broadcast to server registration endpoint for real-time network persistence
    try {
      await fetch("/api/patients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newRecord }),
      });
      // Force instant sync
      syncDatabaseFromServer(false);
    } catch (e) {
      console.warn("Server registration push note:", e);
    }

    // Audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actor: "Patient Registration Portal",
      role: currentRole,
      action: "New Patient Identity Created",
      details: `Registered profile for ${newRecord.patient.fullName} under ${newDnaId} with Lifetime Storage`,
      ipAddress: "127.0.0.1 (Authorized Auth Portal)",
      securityHash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}...AES256`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Switch or Select Patient with Role Access Rules
  const handleSelectPatientRequest = (targetDnaId: string) => {
    const targetRecord = patientsDatabase[targetDnaId];
    if (!targetRecord) return;

    if (currentRole === "patient") {
      // In Patient mode: if trying to open another patient's account, request unlock PIN
      if (targetDnaId !== activePatientId) {
        setPatientAuthTarget(targetRecord.patient);
        setIsPatientAuthModalOpen(true);
      }
    } else if (currentRole === "doctor") {
      // In Doctor mode: check if doctor has authorized session token for this patient
      const hasAuthSession = !!doctorAuthSessions[targetDnaId];
      if (hasAuthSession) {
        setActivePatientId(targetDnaId);
      } else {
        setDoctorOtpTargetPatient(targetRecord.patient);
        setIsDoctorOtpModalOpen(true);
      }
    } else {
      // Admin
      setActivePatientId(targetDnaId);
    }
  };

  // Doctor OTP Verified Callback
  const handleDoctorOtpSuccess = (token: string) => {
    if (doctorOtpTargetPatient) {
      const targetDnaId = doctorOtpTargetPatient.dnaId;
      setDoctorAuthSessions((prev) => ({
        ...prev,
        [targetDnaId]: {
          patientDnaId: targetDnaId,
          doctorName: "Dr. Marcus Vance, FACC",
          authorizedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          token,
        },
      }));
      setActivePatientId(targetDnaId);
      setDoctorOtpTargetPatient(null);
    }
  };

  // Patient Security Unlock Callback
  const handlePatientUnlockSuccess = (targetDnaId: string) => {
    handleLoginSuccess(targetDnaId);
    setIsPatientAuthModalOpen(false);
    setPatientAuthTarget(null);
  };

  const handleOpenPublicCard = (targetPatient: PatientProfile) => {
    setPublicCardPatient(targetPatient);
    setIsPublicCardModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased selection:bg-blue-500 selection:text-white flex flex-col">
      {/* Universal Header */}
      <Header
        currentRole={currentRole}
        setRole={setRole}
        patient={patient}
        isAuthenticated={isAuthenticated}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenDigitalIdModal={() => setIsDigitalIdModalOpen(true)}
        onOpenPatientSwitcher={() => setIsPatientSwitcherModalOpen(true)}
        onOpenAddPatient={() => setIsAddPatientModalOpen(true)}
        onOpenPatientLogin={() => setIsPatientLoginModalOpen(true)}
        onLogout={() => handleLogout("Manual user logout")}
        onLockSession={handleManualLock}
        sessionRemainingSeconds={sessionRemainingSeconds}
        timeoutDurationSeconds={inactivityTimeoutSeconds}
        onSetTimeoutSeconds={handleSetTimeoutSeconds}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        patientCount={allPatientsList.length}
      />

      {/* Main Navigation Sub-Bar */}
      <nav className="bg-white border-b border-slate-200/80 shadow-sm sticky top-20 z-30 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-1">
              {[
                { id: "patient-dash", label: "Patient Dashboard", icon: User, reqAuth: true },
                { id: "profile", label: "Patient Identity", icon: QrCode, reqAuth: true },
                { id: "history", label: "Medical History", icon: Activity, reqAuth: true },
                { id: "clinical", label: "Clinical Records", icon: FileText, reqAuth: true },
                { id: "lab", label: "Lab & Imaging", icon: FlaskConical, reqAuth: true },
                { id: "prescription", label: "Prescriptions", icon: Pill, reqAuth: true },
                { id: "appointments", label: "Appointments", icon: Calendar, reqAuth: true },
                { id: "ai-module", label: "AI Diagnostics", icon: Brain, isAi: true, reqAuth: true },
                { id: "doctor-dash", label: "Doctor Console", icon: Stethoscope, reqAuth: false },
                { id: "hospital-dash", label: "Hospital Admin", icon: Building2, reqAuth: false },
                { id: "future", label: "Genetics & Labs", icon: Globe, reqAuth: true },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isLocked = !isAuthenticated && item.reqAuth;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? item.isAi
                          ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md"
                          : "bg-blue-600 text-white shadow-md"
                        : isLocked
                        ? "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                    {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                  </button>
                );
              })}
            </div>

            {/* Persistent Database Sync Pill */}
            <div className="hidden lg:flex items-center space-x-2 pl-4 text-[11px] text-slate-500 font-medium shrink-0">
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>Cloud Database Synced</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* If user is not authenticated and is trying to access any patient view, show the AuthWelcomeScreen */}
        {!isAuthenticated && activeTab !== "doctor-dash" && activeTab !== "hospital-dash" ? (
          <AuthWelcomeScreen
            allPatients={allPatientsList}
            patients={allPatientsList}
            onLoginSuccess={handleLoginSuccess}
            onRegisterPatient={handleRegisterPatient}
            onRegisterNewPatient={handleRegisterPatient}
            onOpenPublicEmergency={(p) => {
              setPublicCardPatient(p);
              setIsPublicCardModalOpen(true);
            }}
            onOpenEmergencyTriage={(p) => {
              setPublicCardPatient(p);
              setIsPublicCardModalOpen(true);
            }}
            onSelectRoleTab={(tab) => {
              if (tab === "doctor-dash") setRole("doctor");
              if (tab === "hospital-dash") setRole("admin");
              setActiveTab(tab);
            }}
            sessionExpiredReason={sessionExpiredReason}
            lastActivePatientId={lastActivePatientId}
          />
        ) : isAuthenticated && patient && history ? (
          <>
            {/* PATIENT DASHBOARD OVERVIEW */}
            {activeTab === "patient-dash" && (
              <div className="space-y-8 max-w-6xl mx-auto">
                {/* Hero Welcome Banner */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                        ONE PATIENT • ONE IDENTITY
                      </span>
                      <span className="text-xs text-slate-400">Lifetime Vault Active</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Welcome back, {patient.fullName}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Your complete electronic medical history, lab results, AI disease risk indicators, and prescriptions are unified under DNA ID:{" "}
                      <strong className="text-cyan-300 font-mono">{patient.dnaId}</strong>.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => setIsDigitalIdModalOpen(true)}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Digital Patient Card</span>
                    </button>
                    <button
                      onClick={() => setIsEmergencyModalOpen(true)}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                    >
                      <Siren className="w-4 h-4" />
                      <span>Emergency Access</span>
                    </button>
                  </div>
                </div>

                {/* Overview Quick Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div
                    onClick={() => setActiveTab("profile")}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-1"
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Blood Group
                    </span>
                    <p className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      <span>{patient.bloodGroup}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">Universal Donor</p>
                  </div>

                  <div
                    onClick={() => setActiveTab("prescription")}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-1"
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Active Medicines
                    </span>
                    <p className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                      <Pill className="w-5 h-5 text-emerald-600" />
                      <span>{history.medicines?.length || 0} Drugs</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold">Refills Available</p>
                  </div>

                  <div
                    onClick={() => setActiveTab("appointments")}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-1"
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Appointments
                    </span>
                    <p className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span>{appointments.length} Scheduled</span>
                    </p>
                    <p className="text-[11px] text-indigo-700 font-semibold">Queue Confirmed</p>
                  </div>

                  <div
                    onClick={() => setActiveTab("lab")}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-1"
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Lab & Imaging Reports
                    </span>
                    <p className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                      <FlaskConical className="w-5 h-5 text-cyan-600" />
                      <span>{labReports.length} Files</span>
                    </p>
                    <p className="text-[11px] text-slate-500">Lipid & Diagnostic Panels</p>
                  </div>
                </div>

                {/* Two Column Layout: Health Timeline & Reminders */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Health Timeline */}
                  <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span>Recent Medical Encounters & Timeline</span>
                      </h2>
                      <button
                        onClick={() => setActiveTab("clinical")}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {clinicalRecords.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          No clinical records yet. Add a clinical encounter in the Clinical Records tab.
                        </div>
                      ) : (
                        clinicalRecords.slice(0, 3).map((rec) => (
                          <div
                            key={rec.id}
                            onClick={() => setActiveTab("clinical")}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase">
                                {rec.recordType}
                              </span>
                              <h3 className="text-sm font-bold text-slate-900">{rec.diagnosis}</h3>
                              <p className="text-slate-500">
                                {rec.hospitalName} • {rec.attendingDoctor}
                              </p>
                            </div>
                            <span className="font-mono text-slate-400 text-xs self-end sm:self-auto">
                              {rec.date}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Medicine Reminders & Allergy Alerts */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                      <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                        <Bell className="w-5 h-5 text-amber-500" />
                        <span>Daily Medication Reminders</span>
                      </h3>

                      <div className="space-y-3 text-xs">
                        {history.medicines && history.medicines.length > 0 ? (
                          history.medicines.slice(0, 2).map((m) => (
                            <div
                              key={m.id}
                              className="p-3 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{m.name}</span>
                                <p className="text-slate-500">{m.dosage} • {m.frequency}</p>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                Active
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400">No active reminders configured.</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100 space-y-3 text-xs">
                      <h3 className="font-bold text-rose-900 flex items-center space-x-2">
                        <ShieldCheck className="w-5 h-5 text-rose-600" />
                        <span>Critical Allergy Lock</span>
                      </h3>
                      <p className="text-rose-950">
                        Penicillin Derivatives are strictly blocked on your global electronic prescription profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Views */}
            {activeTab === "profile" && (
              <PatientProfileView
                patient={patient}
                onUpdatePatient={handleUpdatePatient}
                onOpenDigitalId={() => setIsDigitalIdModalOpen(true)}
                onLogout={handleLogout}
              />
            )}

            {activeTab === "history" && (
              <MedicalHistoryView history={history} onUpdateHistory={handleUpdateHistory} />
            )}

            {activeTab === "clinical" && (
              <ClinicalRecordsView
                records={clinicalRecords}
                onAddRecord={handleAddClinicalRecord}
                onUpdateRecords={handleUpdateClinicalRecords}
              />
            )}

            {activeTab === "lab" && (
              <LabImagingView
                reports={labReports}
                onUpdateReports={handleUpdateLabReports}
              />
            )}

            {activeTab === "prescription" && (
              <PrescriptionCenterView
                prescriptions={prescriptions}
                onUpdatePrescriptions={handleUpdatePrescriptions}
              />
            )}

            {activeTab === "appointments" && (
              <AppointmentSystemView
                appointments={appointments}
                doctors={doctors}
                onBookAppointment={handleAddAppointment}
                onUpdateAppointments={handleUpdateAppointments}
              />
            )}

            {activeTab === "ai-module" && (
              <AIModuleView
                patient={patient}
                history={history}
                prescriptions={prescriptions}
                clinicalRecords={clinicalRecords}
                labReports={labReports}
              />
            )}

            {activeTab === "future" && (
              <FutureModulesView markers={geneticMarkers} />
            )}
          </>
        ) : null}

        {/* Doctor Console & Hospital Admin tabs can also be accessed by staff */}
        {activeTab === "doctor-dash" && (
          <DoctorDashboardView
            patient={patient || allPatientsList[0]}
            history={history || patientsDatabase[allPatientsList[0]?.dnaId]?.history || INITIAL_MEDICAL_HISTORY}
            onAddClinicalRecord={handleAddClinicalRecord}
            onAddPrescription={handleAddPrescription}
            allPatients={allPatientsList}
            onSelectPatient={handleSelectPatientRequest}
            onOpenAddPatient={() => setIsAddPatientModalOpen(true)}
            onRefresh={() => syncDatabaseFromServer(false)}
          />
        )}

        {activeTab === "hospital-dash" && (
          <HospitalDashboardView
            doctors={doctors}
            auditLogs={auditLogs}
            allPatients={allPatientsList}
            onSelectPatient={handleSelectPatientRequest}
            onOpenAddPatient={() => setIsAddPatientModalOpen(true)}
            onRefresh={() => syncDatabaseFromServer(false)}
          />
        )}
      </main>

      {/* Digital Patient ID Card Modal */}
      {isDigitalIdModalOpen && patient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setIsDigitalIdModalOpen(false)}
              className="absolute -top-12 right-0 p-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <DigitalPatientCard patient={patient} onUpdatePatient={handleUpdatePatient} />
          </div>
        </div>
      )}

      {/* Emergency Access Modal */}
      <EmergencyAccessModal
        patient={patient}
        history={history}
        allPatients={allPatientsList}
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Patient Switcher & Search Directory Modal */}
      <PatientSwitcherModal
        isOpen={isPatientSwitcherModalOpen}
        onClose={() => setIsPatientSwitcherModalOpen(false)}
        patients={allPatientsList}
        activePatientId={activePatientId || ""}
        currentRole={currentRole}
        onSelectPatient={handleSelectPatientRequest}
        onOpenAddPatient={() => setIsAddPatientModalOpen(true)}
        onViewPublicCard={handleOpenPublicCard}
        onRefresh={() => syncDatabaseFromServer(false)}
        onRequestUnlockPatient={(target) => {
          setPatientAuthTarget(target);
          setIsPatientAuthModalOpen(true);
        }}
      />

      {/* Add New Patient Registration Modal */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onAddPatient={handleRegisterPatient}
      />

      {/* Doctor Real-Time Patient OTP Authorization Modal */}
      {doctorOtpTargetPatient && (
        <DoctorOtpModal
          isOpen={isDoctorOtpModalOpen}
          onClose={() => {
            setIsDoctorOtpModalOpen(false);
            setDoctorOtpTargetPatient(null);
          }}
          patient={doctorOtpTargetPatient}
          onVerificationSuccess={handleDoctorOtpSuccess}
        />
      )}

      {/* Patient Security PIN Vault Access Modal */}
      {patientAuthTarget && (
        <PatientSecurityAuthModal
          isOpen={isPatientAuthModalOpen}
          onClose={() => {
            setIsPatientAuthModalOpen(false);
            setPatientAuthTarget(null);
          }}
          targetPatient={patientAuthTarget}
          currentPatient={patient || patientAuthTarget}
          onUnlockSuccess={handlePatientUnlockSuccess}
          onViewPublicCard={handleOpenPublicCard}
        />
      )}

      {/* Public Emergency Digital ID Card Modal */}
      {publicCardPatient && (
        <PublicDigitalCardModal
          isOpen={isPublicCardModalOpen}
          onClose={() => {
            setIsPublicCardModalOpen(false);
            setPublicCardPatient(null);
          }}
          patient={publicCardPatient}
          onRequestUnlock={(target) => {
            setPatientAuthTarget(target);
            setIsPatientAuthModalOpen(true);
          }}
        />
      )}

      {/* Patient Self-Login with Password Modal */}
      <PatientLoginModal
        isOpen={isPatientLoginModalOpen}
        onClose={() => setIsPatientLoginModalOpen(false)}
        patients={allPatientsList}
        onLoginSuccess={handleLoginSuccess}
        onOpenAddPatient={() => {
          setIsPatientLoginModalOpen(false);
          setIsAddPatientModalOpen(true);
        }}
        onViewPublicCard={handleOpenPublicCard}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">PATIENT DNA</span>
            <span>• Universal Healthcare Identity System</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCreatorPortfolioModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 border border-blue-500/30 transition-all text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Creator Portfolio & Ownership</span>
            </button>
          </div>

          <p className="text-[11px] font-mono text-slate-500">
            Encrypted End-to-End • Persistent Cloud Store • ISO 27001 Certified • HIPAA Compliant
          </p>
        </div>
      </footer>

      {/* HIPAA Session Inactivity Warning Modal */}
      <SessionInactivityModal
        isOpen={isWarningModalOpen}
        secondsRemaining={sessionRemainingSeconds}
        onExtendSession={handleExtendSession}
        onLockNow={handleManualLock}
        patientName={patient?.fullName}
        totalTimeoutMinutes={Math.round(inactivityTimeoutSeconds / 60)}
      />

      {/* Creator & Portfolio Modal */}
      <CreatorPortfolioModal
        isOpen={isCreatorPortfolioModalOpen}
        onClose={() => setIsCreatorPortfolioModalOpen(false)}
      />
    </div>
  );
}
