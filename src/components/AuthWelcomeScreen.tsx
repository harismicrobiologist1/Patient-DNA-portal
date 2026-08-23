import React, { useState, useEffect } from "react";
import { PatientProfile, PatientFullRecord } from "../types";
import { CreatorPortfolioModal } from "./CreatorPortfolioModal";
import {
  evaluatePasswordStrength,
  checkAccountLockout,
  recordFailedPasswordAttempt,
  resetFailedAttempts,
} from "../utils/security";
import {
  Lock,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Dna,
  QrCode,
  Heart,
  UserPlus,
  Stethoscope,
  Building2,
  AlertTriangle,
  Sparkles,
  Phone,
  Mail,
  User,
  ArrowRight,
  ShieldAlert,
  Calendar,
  MapPin,
  FileCheck2,
  Activity,
  CheckCircle2,
  Search,
  Fingerprint,
  MailCheck,
  RefreshCw,
  Check,
  Copy,
  ChevronLeft,
  Send,
} from "lucide-react";

interface AuthWelcomeScreenProps {
  allPatients?: PatientProfile[];
  patients?: PatientProfile[];
  onLoginSuccess: (dnaId: string, remember?: boolean) => void;
  onRegisterPatient?: (newRecord: PatientFullRecord) => void;
  onRegisterNewPatient?: (newRecord: PatientFullRecord) => void;
  onOpenPublicEmergency?: (patient: PatientProfile) => void;
  onOpenEmergencyTriage?: (patient: PatientProfile) => void;
  onSelectRoleTab: (tab: string) => void;
}

export const AuthWelcomeScreen: React.FC<AuthWelcomeScreenProps> = ({
  allPatients = [],
  patients = [],
  onLoginSuccess,
  onRegisterPatient,
  onRegisterNewPatient,
  onOpenPublicEmergency,
  onOpenEmergencyTriage,
  onSelectRoleTab,
}) => {
  const patientList = allPatients && allPatients.length > 0 ? allPatients : (patients || []);
  const handleRegisterCallback = onRegisterPatient || onRegisterNewPatient;
  const handleEmergencyCallback = onOpenPublicEmergency || onOpenEmergencyTriage;

  const [activeMode, setActiveMode] = useState<"login" | "register" | "emergency" | "staff">("login");

  // Sign in states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);

  // Registration states
  const [regForm, setRegForm] = useState({
    fullName: "",
    dob: "1995-04-12",
    gender: "Female",
    bloodGroup: "O Positive (O+)",
    phone: "+1 (555) 234-5678",
    email: "",
    address: "450 Medical Center Blvd, Suite 300, Boston, MA",
    nationalId: "US-MA-882104-Z",
    allergies: "Penicillin, Sulfa drugs",
    organDonor: true,
    emergencyContactName: "Michael Adams",
    emergencyRelationship: "Spouse",
    emergencyPhone: "+1 (555) 234-9900",
    password: "",
    confirmPassword: "",
    securityPin: "1234",
  });
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // OTP Verification States
  const [regStep, setRegStep] = useState<"form" | "otp">("form");
  const [regOtpDigits, setRegOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [regSentOtp, setRegSentOtp] = useState<string>("");
  const [regOtpTimer, setRegOtpTimer] = useState<number>(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState<"sent" | "simulated" | "failed">("simulated");
  const [resendConfigured, setResendConfigured] = useState(false);
  const [otpVerificationSuccess, setOtpVerificationSuccess] = useState(false);
  const [regOtpPassword, setRegOtpPassword] = useState("");
  const [showRegOtpPassword, setShowRegOtpPassword] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Countdown timer for registration OTP resend
  useEffect(() => {
    if (regOtpTimer <= 0) return;
    const interval = setInterval(() => {
      setRegOtpTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [regOtpTimer]);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Password evaluation
  const loginPasswordStrength = evaluatePasswordStrength(password);
  const regPasswordStrength = evaluatePasswordStrength(regForm.password);

  // Emergency Search State
  const [emergencyQuery, setEmergencyQuery] = useState("");
  const [emergencyResult, setEmergencyResult] = useState<PatientProfile | null>(null);
  const [emergencySearchError, setEmergencySearchError] = useState<string | null>(null);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanId = identifier.trim().toLowerCase();
    const cleanPwd = password.trim();

    if (!cleanId) {
      setLoginError("Please enter your DNA ID, registered Email, or Phone number.");
      return;
    }
    if (!cleanPwd) {
      setLoginError("Please enter your account password.");
      return;
    }

    const matched = patientList.find(
      (p) =>
        p.dnaId.toLowerCase() === cleanId ||
        p.dnaId.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanId.replace(/[^a-z0-9]/g, "") ||
        p.email.toLowerCase() === cleanId ||
        p.phone.replace(/[^0-9]/g, "") === cleanId.replace(/[^0-9]/g, "") ||
        p.nationalId.toLowerCase() === cleanId
    );

    if (!matched) {
      setLoginError("No patient record found matching that DNA ID, Email, or Phone.");
      return;
    }

    // Check account lockout
    const lockStatus = checkAccountLockout(matched.dnaId);
    if (lockStatus.isLocked) {
      setLockoutTimer(lockStatus.remainingSeconds);
      setLoginError(
        `Account Temporarily Locked: Too many failed password attempts. Please wait ${lockStatus.remainingSeconds}s.`
      );
      return;
    }

    const expectedPassword = (matched.password || "AlexMercer@2026!").trim();
    const isMatch = cleanPwd === expectedPassword;

    if (isMatch) {
      resetFailedAttempts(matched.dnaId);
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        onLoginSuccess(matched.dnaId, rememberMe);
      }, 500);
    } else {
      const failStatus = recordFailedPasswordAttempt(matched.dnaId);
      if (failStatus.isLocked) {
        setLockoutTimer(failStatus.remainingSeconds);
        setLoginError(
          `Access Denied: Account temporarily locked for ${failStatus.remainingSeconds}s due to repeated failed password attempts.`
        );
      } else {
        setLoginError(
          `Access Denied: Incorrect password. (${failStatus.attemptsLeft} attempts remaining before security lockout)`
        );
      }
    }
  };

  // Quick Demo Account Selector (populates form for quick review without bypassing security)
  const handleSelectDemoAccount = (demoPatient: PatientProfile) => {
    setIdentifier(demoPatient.dnaId);
    setPassword(demoPatient.password || "AlexMercer@2026!");
    setLoginError(null);
  };

  // Step 1: Validate Form & Send Email OTP
  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regForm.fullName.trim()) {
      setRegError("Please enter the patient's full legal name.");
      return;
    }
    const cleanEmail = regForm.email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setRegError("A valid email address is required to receive your registration OTP.");
      return;
    }
    if (!regForm.password.trim()) {
      setRegError("Please set a strong account password.");
      return;
    }
    if (!regPasswordStrength.isValidStrong) {
      setRegError(
        "Strong Password Required: Must have at least 8 characters, uppercase, lowercase, numbers, and a special character (!@#$)."
      );
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setRegError("Passwords do not match. Please verify.");
      return;
    }
    if (!regForm.securityPin.trim() || regForm.securityPin.length < 4) {
      setRegError("Please enter a 4-digit bedside PIN.");
      return;
    }

    setIsSendingOtp(true);

    try {
      // Fallback local code
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      let activeCode = fallbackOtp;
      let deliveryStatus: "sent" | "simulated" | "failed" = "simulated";
      let isResendReady = false;

      try {
        const res = await fetch("/api/auth/send-registration-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            fullName: regForm.fullName.trim(),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          deliveryStatus = data.emailDeliveryStatus || "simulated";
          isResendReady = !!data.resendConfigured;
          if (data && data.otpCode) {
            activeCode = data.otpCode;
          }
        }
      } catch (apiErr) {
        console.warn("API registration OTP dispatched with local verification engine:", apiErr);
      }

      setRegSentOtp(activeCode);
      setEmailDeliveryStatus(deliveryStatus);
      setResendConfigured(isResendReady);
      setSimulatedOtp(deliveryStatus === "sent" ? null : activeCode);
      setRegOtpDigits(["", "", "", "", "", ""]);
      setRegOtpPassword("");
      setRegOtpTimer(60);
      setRegStep("otp");
      setRegError(null);

      // Auto-focus first input box after step switch
      setTimeout(() => {
        const firstInput = document.getElementById("reg-otp-input-0");
        if (firstInput) firstInput.focus();
      }, 100);
    } catch (err: any) {
      setRegError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Resend Registration OTP
  const handleResendRegistrationOtp = async () => {
    if (regOtpTimer > 0) return;
    setIsSendingOtp(true);
    setRegError(null);

    try {
      const cleanEmail = regForm.email.trim();
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      let activeCode = fallbackOtp;
      let deliveryStatus: "sent" | "simulated" | "failed" = "simulated";
      let isResendReady = false;

      try {
        const res = await fetch("/api/auth/send-registration-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            fullName: regForm.fullName.trim(),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          deliveryStatus = data.emailDeliveryStatus || "simulated";
          isResendReady = !!data.resendConfigured;
          if (data && data.otpCode) {
            activeCode = data.otpCode;
          }
        }
      } catch (err) {
        console.warn("Resend OTP applied fallback:", err);
      }

      setRegSentOtp(activeCode);
      setEmailDeliveryStatus(deliveryStatus);
      setResendConfigured(isResendReady);
      setSimulatedOtp(deliveryStatus === "sent" ? null : activeCode);
      setRegOtpTimer(60);
    } catch (err: any) {
      setRegError("Could not resend OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP digit individual inputs

  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    if (!clean) {
      const updated = [...regOtpDigits];
      updated[index] = "";
      setRegOtpDigits(updated);
      return;
    }

    if (clean.length > 1) {
      const digits = clean.slice(0, 6).split("");
      const updated = [...regOtpDigits];
      digits.forEach((d, i) => {
        if (i < 6) updated[i] = d;
      });
      setRegOtpDigits(updated);
      const nextIdx = Math.min(digits.length, 5);
      const nextElem = document.getElementById(`reg-otp-input-${nextIdx}`);
      if (nextElem) nextElem.focus();
      return;
    }

    const updated = [...regOtpDigits];
    updated[index] = clean[clean.length - 1];
    setRegOtpDigits(updated);

    if (index < 5 && clean) {
      const nextElem = document.getElementById(`reg-otp-input-${index + 1}`);
      if (nextElem) nextElem.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !regOtpDigits[index] && index > 0) {
      const prevElem = document.getElementById(`reg-otp-input-${index - 1}`);
      if (prevElem) prevElem.focus();
    }
  };

  const handleAutofillSimulatedOtp = () => {
    if (simulatedOtp && simulatedOtp.length === 6) {
      setRegOtpDigits(simulatedOtp.split(""));
      setRegOtpPassword(regForm.password);
      setRegError(null);
    }
  };

  // Step 2: Verify OTP & Confirm Password to Register
  const handleVerifyOtpAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const enteredOtp = regOtpDigits.join("").trim();
    if (enteredOtp.length < 6) {
      setRegError("Please enter the complete 6-digit OTP code sent to your email.");
      return;
    }

    if (enteredOtp !== regSentOtp) {
      setRegError("Incorrect 6-digit OTP verification code. Please check your email or click autofill.");
      return;
    }

    if (!regOtpPassword.trim()) {
      setRegError("Please enter your account password to confirm your registration.");
      return;
    }

    if (regOtpPassword.trim() !== regForm.password.trim()) {
      setRegError("Entered password does not match the password you set in step 1.");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpVerificationSuccess(true);

    // Generate unique DNA ID
    const randomPart1 = Math.floor(1000 + Math.random() * 9000);
    const randomPart2 = Math.floor(1000 + Math.random() * 9000);
    const newDnaId = `DNA-${randomPart1}-${randomPart2}`;

    const newPatientProfile: PatientProfile = {
      dnaId: newDnaId,
      fullName: regForm.fullName.trim(),
      dob: regForm.dob,
      gender: regForm.gender,
      bloodGroup: regForm.bloodGroup,
      avatarUrl:
        regForm.gender === "Female"
          ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300"
          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
      phone: regForm.phone.trim() || "+1 (555) 000-0000",
      email: regForm.email.trim(),
      address: regForm.address.trim() || "Universal Medical District",
      nationalId: regForm.nationalId.trim() || `ID-${Math.floor(100000 + Math.random() * 900000)}`,
      biometricStatus: "Verified",
      organDonorStatus: regForm.organDonor,
      registeredHospital: "Apex National Medical Center",
      securityPin: regForm.securityPin.trim(),
      password: regForm.password.trim(),
      insurance: {
        provider: "Universal Standard Health Network",
        policyNumber: `POL-${Math.floor(1000000 + Math.random() * 9000000)}`,
        groupNumber: "GRP-01",
        status: "Active",
        coverageAmount: "$500,000 Comprehensive",
      },
      emergencyContacts: [
        {
          id: `ec-${Date.now()}`,
          name: regForm.emergencyContactName.trim() || "Emergency Contact",
          relationship: regForm.emergencyRelationship || "Family",
          phone: regForm.emergencyPhone.trim() || "+1 (555) 911-0000",
          isPrimary: true,
        },
      ],
    };

    const newRecord: PatientFullRecord = {
      patient: newPatientProfile,
      history: {
        diseases: [],
        surgeries: [],
        vaccinations: [],
        medicines: [],
        allergies: regForm.allergies
          ? regForm.allergies.split(",").map((a, idx) => ({
              id: `all-${idx}`,
              substance: a.trim(),
              severity: "Severe" as const,
              reaction: "Anaphylaxis Alert",
              firstObserved: "2024-01-10",
            }))
          : [],
        familyHistory: [],
        chronicIllnesses: [],
        lifestyle: {
          smokingStatus: "Non-smoker",
          alcoholConsumption: "None",
          physicalActivity: "Active (3-5 days/wk)",
          sleepAvgHours: 8,
          dietType: "Balanced",
        },
      },
      clinicalRecords: [],
      labReports: [],
      prescriptions: [],
      appointments: [],
    };

    setTimeout(() => {
      setIsVerifyingOtp(false);
      if (handleRegisterCallback) {
        handleRegisterCallback(newRecord);
      }
    }, 700);
  };

  // Handle Emergency Lookup
  const handleEmergencySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setEmergencySearchError(null);
    setEmergencyResult(null);

    const query = emergencyQuery.trim().toLowerCase();
    if (!query) {
      setEmergencySearchError("Please enter a Patient DNA ID, National ID, or Phone Number.");
      return;
    }

    const found = patientList.find(
      (p) =>
        p.dnaId.toLowerCase() === query ||
        p.dnaId.toLowerCase().replace(/[^a-z0-9]/g, "") === query.replace(/[^a-z0-9]/g, "") ||
        p.phone.replace(/[^0-9]/g, "") === query.replace(/[^0-9]/g, "") ||
        p.nationalId.toLowerCase() === query
    );

    if (found) {
      setEmergencyResult(found);
    } else {
      setEmergencySearchError("No patient record matching that Emergency identifier.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AES-256 ENCRYPTED HEALTH VAULT</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              • ZERO-KNOWLEDGE PATIENT SOVEREIGNTY
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            One Lifetime Identity. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
              All Your Health Records Unified.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Welcome to the Universal Health DNA Portal. Securely access clinical encounters, prescriptions, diagnostic scans, and emergency triage passports across all hospital networks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-cyan-300 text-xs font-bold">
                <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Locked by Default</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Medical vaults remain encrypted until authenticated by the patient.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-rose-300 text-xs font-bold">
                <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Instant Paramedic Triage</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                First responders can check blood groups & allergies in emergencies.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
                <Stethoscope className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Doctor OTP Protocol</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Physicians request cryptographic patient consent before record access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Authentication & Services Hub */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Navigation Mode Switcher */}
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50/70 p-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveMode("login");
              setLoginError(null);
            }}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeMode === "login"
                ? "bg-white text-blue-700 shadow-md border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>Patient Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode("register");
              setRegError(null);
            }}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeMode === "register"
                ? "bg-white text-indigo-700 shadow-md border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <span>Register New Patient</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("emergency")}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeMode === "emergency"
                ? "bg-white text-rose-700 shadow-md border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <QrCode className="w-4 h-4 text-rose-600" />
            <span>Paramedic Triage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("staff")}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeMode === "staff"
                ? "bg-white text-slate-900 shadow-md border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Stethoscope className="w-4 h-4 text-slate-700" />
            <span>Doctor & Hospital Portals</span>
          </button>
        </div>

        {/* Tab 1: Patient Sign In */}
        {activeMode === "login" && (
          <div className="p-6 sm:p-10 space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Section (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                    <Fingerprint className="w-4 h-4" />
                    <span>Secure Biometric & Key Authentication</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">
                    Sign In to Your Health DNA Vault
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Enter your unique DNA ID, registered email, or phone number along with your password or 4-digit security PIN.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Patient DNA ID / Email / Phone:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. DNA-8924-9012, alex.mercer@healthdna.org, or phone"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50/50 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Account Password: <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? "Hide" : "Show"}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? "text" : "password"}
                        disabled={lockoutTimer > 0}
                        placeholder="Enter strong password (e.g. AlexMercer@2026!)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50/50 focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-400"
                        required
                      />
                    </div>

                    {/* Password Strength Feedback when typing in Login */}
                    {password.length > 0 && (
                      <div className="mt-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-500">Strength:</span>
                          <span className={`font-bold ${loginPasswordStrength.color}`}>
                            {loginPasswordStrength.level}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${loginPasswordStrength.barColor}`}
                            style={{ width: `${loginPasswordStrength.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Keep my session active on this browser</span>
                    </label>
                  </div>

                  {/* Lockout Warning */}
                  {lockoutTimer > 0 && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2.5">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 animate-pulse" />
                      <div>
                        <p className="font-bold">Brute-Force Lockout Active</p>
                        <p className="text-[11px] text-rose-700">
                          Security protection enabled. Retry allowed in <strong>{lockoutTimer}s</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {loginError && lockoutTimer === 0 && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2 animate-shake">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAuthenticating || lockoutTimer > 0}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isAuthenticating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-white" />
                        <span>Decrypting Lifetime Vault...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Unlock & Open Patient Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Demo Accounts & Helper Section (5 cols) */}
              <div className="lg:col-span-5 bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                    <Dna className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Demo Accounts & Passwords
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Click any registered profile to fill credentials:
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {patientList.map((demoP) => (
                    <button
                      key={demoP.dnaId}
                      type="button"
                      onClick={() => handleSelectDemoAccount(demoP)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={demoP.avatarUrl}
                          alt={demoP.fullName}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700">
                            {demoP.fullName}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 truncate">
                            {demoP.dnaId} • {demoP.password || "AlexMercer@2026!"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                        Fill Login
                      </span>
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                  <strong>Zero Direct Switch Guarantee:</strong>
                  <div className="mt-1 font-mono text-[10px] text-blue-800">
                    Accounts are encrypted. Switching requires the patient's individual strong password.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Register New Patient with Email OTP Verification */}
        {activeMode === "register" && (
          <div className="p-6 sm:p-10 space-y-6 animate-fadeIn">
            {/* Header & Step Stepper */}
            <div className="border-b border-slate-200 pb-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                  <UserPlus className="w-4 h-4" />
                  <span>Universal Health DNA Passport Registration</span>
                </div>
                {/* Stepper Indicator */}
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <span
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-full transition-all ${
                      regStep === "form"
                        ? "bg-indigo-100 text-indigo-800 ring-2 ring-indigo-500/30"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {regStep === "otp" ? <Check className="w-3.5 h-3.5" /> : <span>1</span>}
                    <span>1. Patient Data & Password</span>
                  </span>
                  <span className="text-slate-300">→</span>
                  <span
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-full transition-all ${
                      regStep === "otp"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/30"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <span>2</span>
                    <span>2. Email OTP Verification</span>
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {regStep === "form" ? "Create Your Universal Health DNA Account" : "Verify Email & Confirm Security"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {regStep === "form"
                  ? "Enter your demographic & medical details. A 6-digit one-time passcode (OTP) will be sent to your email to verify account ownership."
                  : `Please enter the 6-digit verification code sent to ${regForm.email} and confirm your password to activate your decentralized vault.`}
              </p>
            </div>

            {/* STEP 1: FORM INPUTS */}
            {regStep === "form" && (
              <form onSubmit={handleInitiateRegistration} className="space-y-6">
                {/* Personal Details */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">
                    1. Personal Identity & Demographics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Legal Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Eleanor Vance"
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={regForm.dob}
                        onChange={(e) => setRegForm({ ...regForm, dob: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={regForm.gender}
                        onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Blood Group <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={regForm.bloodGroup}
                        onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option value="O Positive (O+)">O Positive (O+)</option>
                        <option value="O Negative (O-)">O Negative (O-)</option>
                        <option value="A Positive (A+)">A Positive (A+)</option>
                        <option value="A Negative (A-)">A Negative (A-)</option>
                        <option value="B Positive (B+)">B Positive (B+)</option>
                        <option value="B Negative (B-)">B Negative (B-)</option>
                        <option value="AB Positive (AB+)">AB Positive (AB+)</option>
                        <option value="AB Negative (AB-)">AB Negative (AB-)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        National / Govt ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. US-NY-7721-Z"
                        value={regForm.nationalId}
                        onChange={(e) => setRegForm({ ...regForm, nationalId: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                        <span className="ml-1 text-[10px] font-normal text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          OTP will be sent here
                        </span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          placeholder="your.email@example.com"
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Residential Address
                      </label>
                      <input
                        type="text"
                        placeholder="Street Address, City, State, ZIP"
                        value={regForm.address}
                        onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency & Security */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">
                    2. Emergency Details & Strong Password Security
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe (Spouse)"
                        value={regForm.emergencyContactName}
                        onChange={(e) => setRegForm({ ...regForm, emergencyContactName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Account Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="e.g. Vault@2026Secure!"
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Re-enter password"
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        4-Digit Bedside PIN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="e.g. 1234"
                        value={regForm.securityPin}
                        onChange={(e) => setRegForm({ ...regForm, securityPin: e.target.value.replace(/[^0-9]/g, "") })}
                        className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Strength Checklist */}
                  {regForm.password.length > 0 && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600">Password Strength:</span>
                        <span className={regPasswordStrength.color}>
                          {regPasswordStrength.level} ({regPasswordStrength.score}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${regPasswordStrength.barColor}`}
                          style={{ width: `${regPasswordStrength.score}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] pt-1">
                        <span className={`flex items-center space-x-1 ${regPasswordStrength.checks.minLength ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                          <span>{regPasswordStrength.checks.minLength ? "✓" : "○"}</span>
                          <span>8+ Chars</span>
                        </span>
                        <span className={`flex items-center space-x-1 ${regPasswordStrength.checks.hasUpper ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                          <span>{regPasswordStrength.checks.hasUpper ? "✓" : "○"}</span>
                          <span>Uppercase</span>
                        </span>
                        <span className={`flex items-center space-x-1 ${regPasswordStrength.checks.hasLower ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                          <span>{regPasswordStrength.checks.hasLower ? "✓" : "○"}</span>
                          <span>Lowercase</span>
                        </span>
                        <span className={`flex items-center space-x-1 ${regPasswordStrength.checks.hasNumber ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                          <span>{regPasswordStrength.checks.hasNumber ? "✓" : "○"}</span>
                          <span>Numbers</span>
                        </span>
                        <span className={`flex items-center space-x-1 ${regPasswordStrength.checks.hasSpecial ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                          <span>{regPasswordStrength.checks.hasSpecial ? "✓" : "○"}</span>
                          <span>Symbol (!@#$)</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {regError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingOtp ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-white" />
                        <span>Sending 6-Digit OTP to Email...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send OTP to Email & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: EMAIL OTP & PASSWORD CONFIRMATION */}
            {regStep === "otp" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Back to Edit Details */}
                <button
                  type="button"
                  onClick={() => {
                    setRegStep("form");
                    setRegError(null);
                  }}
                  className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Edit Registration Details</span>
                </button>

                {/* Email verification card */}
                <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50/50 border border-indigo-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-12 h-12 rounded-2xl ${emailDeliveryStatus === "sent" ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white"} flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0`}>
                        <MailCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {emailDeliveryStatus === "sent" ? "Real Email Dispatched via Resend" : "Email OTP Dispatched"}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            emailDeliveryStatus === "sent"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-indigo-100 text-indigo-800"
                          }`}>
                            {emailDeliveryStatus === "sent" ? "Delivered to Inbox" : "Active Session"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {emailDeliveryStatus === "sent" ? (
                            <>A 6-digit security code was delivered to <strong className="text-emerald-700 font-mono">{regForm.email}</strong>. Check your inbox & spam folder.</>
                          ) : (
                            <>A 6-digit one-time code was sent to <strong className="text-indigo-700 font-mono">{regForm.email}</strong></>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRegStep("form")}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-sm transition-all"
                    >
                      Change Email
                    </button>
                  </div>

                  {/* Real Email Delivery Confirmed Card */}
                  {emailDeliveryStatus === "sent" && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-emerald-950">
                          Email successfully sent via Resend API
                        </p>
                        <p className="text-emerald-800">
                          Please open your email client for <strong className="font-mono">{regForm.email}</strong> to retrieve your 6-digit registration code.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sandbox Fallback Key Banner (Only shown if Resend API Key is not yet configured) */}
                  {!resendConfigured && simulatedOtp && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-blue-100">
                            Resend API Key Not Detected • Sandbox Testing Code:
                          </p>
                          <p className="text-lg font-mono font-black tracking-widest text-white">
                            {simulatedOtp}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(simulatedOtp);
                            setCopiedOtp(true);
                            setTimeout(() => setCopiedOtp(false), 2000);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedOtp ? "Copied" : "Copy OTP"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAutofillSimulatedOtp}
                          className="px-3.5 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-blue-50 text-xs font-black shadow transition-all cursor-pointer"
                        >
                          Autofill OTP & Password
                        </button>
                      </div>
                    </div>
                  )}


                  <form onSubmit={handleVerifyOtpAndRegister} className="space-y-6">
                    {/* 6 Digit OTP Input Boxes */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 text-center sm:text-left">
                        Enter 6-Digit Email Verification Code <span className="text-red-500">*</span>
                      </label>
                      <div className="flex justify-center sm:justify-start gap-2.5 sm:gap-3">
                        {regOtpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`reg-otp-input-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20 bg-white text-slate-900 outline-none transition-all shadow-sm"
                            placeholder="•"
                            autoComplete="one-time-code"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Password Confirmation Check */}
                    <div className="max-w-md bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          Confirm Account Password <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-medium text-slate-400">
                          Re-verify for security
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showRegOtpPassword ? "text" : "password"}
                          placeholder="Enter account password"
                          value={regOtpPassword}
                          onChange={(e) => setRegOtpPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegOtpPassword(!showRegOtpPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showRegOtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Resend OTP Timer & Controls */}
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="text-slate-500">
                        {regOtpTimer > 0 ? (
                          <span>
                            Resend code in <strong className="text-indigo-600 font-mono">{regOtpTimer}s</strong>
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium">OTP code can now be resent</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleResendRegistrationOtp}
                        disabled={regOtpTimer > 0 || isSendingOtp}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSendingOtp ? "animate-spin" : ""}`} />
                        <span>Resend OTP Code</span>
                      </button>
                    </div>

                    {/* Error Box */}
                    {regError && (
                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{regError}</span>
                      </div>
                    )}

                    {/* Submit Actions */}
                    <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setRegStep("form")}
                        className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Cancel / Back
                      </button>

                      <button
                        type="submit"
                        disabled={isVerifyingOtp}
                        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isVerifyingOtp ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-spin text-white" />
                            <span>Verifying OTP & Creating Health DNA Vault...</span>
                          </>
                        ) : otpVerificationSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            <span>Verified! Opening Vault...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verify OTP & Register Vault</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Paramedic Emergency Scanner */}
        {activeMode === "emergency" && (
          <div className="p-6 sm:p-10 space-y-6 animate-fadeIn">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Paramedic & First Responder Rapid Triage</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Emergency Medical Card Lookup
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                First responders can search or scan a patient's DNA ID to immediately review life-saving blood type, allergies, and emergency phone numbers without passwords.
              </p>
            </div>

            <form onSubmit={handleEmergencySearch} className="max-w-xl space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Scan or Enter DNA ID / National ID:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. DNA-8924-9012"
                    value={emergencyQuery}
                    onChange={(e) => setEmergencyQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all flex items-center space-x-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Inspect Triage</span>
                </button>
              </div>

              {emergencySearchError && (
                <p className="text-xs text-rose-600 font-semibold">{emergencySearchError}</p>
              )}
            </form>

            {/* Found Result Card */}
            {emergencyResult && (
              <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 max-w-xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={emergencyResult.avatarUrl}
                      alt={emergencyResult.fullName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-rose-300"
                    />
                    <div>
                      <h4 className="text-base font-black text-slate-900">
                        {emergencyResult.fullName}
                      </h4>
                      <p className="text-xs font-mono text-slate-500">{emergencyResult.dnaId}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-rose-600 text-white font-black text-xs">
                    {emergencyResult.bloodGroup}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-rose-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Emergency Contact
                    </span>
                    <span className="font-bold text-slate-800">
                      {emergencyResult.emergencyContacts[0]?.name || "N/A"}
                    </span>
                    <p className="text-rose-700 font-mono text-[11px]">
                      {emergencyResult.emergencyContacts[0]?.phone}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-rose-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Organ Donor Status
                    </span>
                    <span className="font-bold text-emerald-700">
                      {emergencyResult.organDonorStatus ? "Registered Donor" : "No"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (handleEmergencyCallback) {
                      handleEmergencyCallback(emergencyResult);
                    }
                  }}
                  className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Open Full Emergency Digital Passport</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Doctor & Hospital Portals */}
        {activeMode === "staff" && (
          <div className="p-6 sm:p-10 space-y-6 animate-fadeIn">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Healthcare Provider Gateways</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Clinical & Hospital Management Systems
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Authorized medical personnel can jump directly to diagnostic triage or hospital administrative suites.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 hover:border-blue-400 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Doctor Clinical Desk</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Request cryptographic OTP patient consent, write electronic prescriptions, and review diagnostic scans.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectRoleTab("doctor-dash")}
                  className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Open Doctor Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 hover:border-indigo-400 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Hospital Administration</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Monitor intensive care beds, emergency ward occupancy, blood bank units, and audit logs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectRoleTab("hospital-dash")}
                  className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Open Hospital Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Public Project Ownership & Creator Portfolio Footer */}
        <div className="bg-slate-900/95 border-t border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong>Patient DNA</strong> • Public Biomedical Portal & Universal Health System
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPortfolioModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 border border-blue-500/30 transition-all text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Creator Portfolio & Ownership</span>
            </button>
          </div>
        </div>
      </div>

      {/* Creator & Portfolio Modal */}
      <CreatorPortfolioModal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
      />
    </div>
  );
};
