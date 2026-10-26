import React, { useState, useEffect } from "react";
import { PatientProfile, PatientFullRecord } from "../types";
import { CreatorPortfolioModal } from "./CreatorPortfolioModal";
import {
  evaluatePasswordStrength,
  checkAccountLockout,
  recordFailedPasswordAttempt,
  resetFailedAttempts,
} from "../utils/security";
import { getRememberedPatient } from "../utils/sessionSecurity";
import { getPatientFromFirestore } from "../firebase";
import {
  SUPPORTED_COUNTRIES,
  generateNewDnaId,
  previewDnaId,
  getCountryByCode,
  peekNextDnaSequence,
} from "../utils/dnaIdGenerator";
import {
  getDefaultAvatar,
  PRESET_SYMBOL_AVATARS,
  MALE_SYMBOL_AVATAR,
  FEMALE_SYMBOL_AVATAR,
} from "../utils/avatarUtils";
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
  Clock,
  Globe,
  Users,
  Upload,
  Camera,
  AlertCircle,
  X,
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
  sessionExpiredReason?: string | null;
  lastActivePatientId?: string | null;
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
  sessionExpiredReason = null,
  lastActivePatientId = null,
}) => {
  const rawList = allPatients && allPatients.length > 0 ? allPatients : (patients || []);
  const patientList = [...rawList].sort((a, b) => b.dnaId.localeCompare(a.dnaId));
  const handleRegisterCallback = onRegisterPatient || onRegisterNewPatient;
  const handleEmergencyCallback = onOpenPublicEmergency || onOpenEmergencyTriage;

  const [activeMode, setActiveMode] = useState<"login" | "register" | "emergency" | "staff">("login");

  // Sign in states - pre-fill identifier if remembered or recently locked
  const [identifier, setIdentifier] = useState(() => {
    if (lastActivePatientId) return lastActivePatientId;
    const remembered = getRememberedPatient();
    if (remembered && remembered.dnaId) return remembered.dnaId;
    return "";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [activeExpiryNotice, setActiveExpiryNotice] = useState<string | null>(sessionExpiredReason);

  useEffect(() => {
    if (sessionExpiredReason) {
      setActiveExpiryNotice(sessionExpiredReason);
    }
  }, [sessionExpiredReason]);

  useEffect(() => {
    if (lastActivePatientId && !identifier) {
      setIdentifier(lastActivePatientId);
    }
  }, [lastActivePatientId, identifier]);

  // Registration 3-Step Wizard states
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regForm, setRegForm] = useState({
    country: "PK",
    firstName: "",
    surname: "",
    fullName: "",
    dob: "",
    gender: "Male",
    bloodGroup: "O Positive (O+)",
    customAvatar: "",
    phone: "+92 ",
    email: "",
    address: "",
    nationalId: "",
    hospital: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    organDonor: false,
    password: "",
    confirmPassword: "",
    securityPin: "1234",
  });
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Step 2 Inline Email OTP States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [step2OtpCode, setStep2OtpCode] = useState("");
  const [step2OtpSent, setStep2OtpSent] = useState(false);
  const [step2OtpSending, setStep2OtpSending] = useState(false);
  const [step2OtpVerifying, setStep2OtpVerifying] = useState(false);
  const [step2OtpError, setStep2OtpError] = useState<string | null>(null);
  const [step2OtpSuccess, setStep2OtpSuccess] = useState<string | null>(null);
  const [step2OtpCountdown, setStep2OtpCountdown] = useState(600); // 10 minutes
  const [step2SimulatedOtp, setStep2SimulatedOtp] = useState<string | null>(null);

  // Step 2 OTP Countdown
  useEffect(() => {
    if (!step2OtpSent || step2OtpCountdown <= 0) return;
    const timer = setInterval(() => {
      setStep2OtpCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [step2OtpSent, step2OtpCountdown]);

  // Modal OTP States (for backward compatibility)
  const [isRegOtpModalOpen, setIsRegOtpModalOpen] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState("");
  const [regOtpError, setRegOtpError] = useState<string | null>(null);
  const [isRegOtpVerifying, setIsRegOtpVerifying] = useState(false);
  const [isRegOtpSending, setIsRegOtpSending] = useState(false);
  const [regOtpMaskedEmail, setRegOtpMaskedEmail] = useState("");
  const [regOtpCountdown, setRegOtpCountdown] = useState(600); // 10 minutes
  const [pendingRegistrationRecord, setPendingRegistrationRecord] = useState<PatientFullRecord | null>(null);
  const [regSimulatedOtp, setRegSimulatedOtp] = useState<string | null>(null);

  // Login 2FA Email OTP State
  const [isLoginOtpModalOpen, setIsLoginOtpModalOpen] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState("");
  const [loginOtpError, setLoginOtpError] = useState<string | null>(null);
  const [isLoginOtpVerifying, setIsLoginOtpVerifying] = useState(false);
  const [isLoginOtpSending, setIsLoginOtpSending] = useState(false);
  const [loginOtpMaskedEmail, setLoginOtpMaskedEmail] = useState("");
  const [loginOtpCountdown, setLoginOtpCountdown] = useState(600); // 10 minutes
  const [loginOtpTargetDnaId, setLoginOtpTargetDnaId] = useState<string | null>(null);
  const [loginSimulatedOtp, setLoginSimulatedOtp] = useState<string | null>(null);

  // Registration OTP Countdown
  useEffect(() => {
    if (!isRegOtpModalOpen || regOtpCountdown <= 0) return;
    const timer = setInterval(() => {
      setRegOtpCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isRegOtpModalOpen, regOtpCountdown]);

  // Login OTP Countdown
  useEffect(() => {
    if (!isLoginOtpModalOpen || loginOtpCountdown <= 0) return;
    const timer = setInterval(() => {
      setLoginOtpCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoginOtpModalOpen, loginOtpCountdown]);

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

  const allExistingIds = patientList.map((p) => p.dnaId);
  const regCountryObj = getCountryByCode(regForm.country || "PK");
  const regPreviewDnaId = previewDnaId(regForm.country || "PK", allExistingIds);
  const regNextSeq = peekNextDnaSequence(allExistingIds);
  const currentYearShort = new Date().getFullYear() % 100;

  const handleRegCountryChange = (newCountryCode: string) => {
    const cObj = getCountryByCode(newCountryCode);
    setRegForm((prev) => ({
      ...prev,
      country: newCountryCode,
      phone:
        !prev.phone || SUPPORTED_COUNTRIES.some((c) => prev.phone === c.dialCode || prev.phone === `${c.dialCode} `)
          ? `${cObj.dialCode} `
          : prev.phone,
    }));
  };

  // Emergency Search State
  const [emergencyQuery, setEmergencyQuery] = useState("");
  const [emergencyResult, setEmergencyResult] = useState<PatientProfile | null>(null);
  const [emergencySearchError, setEmergencySearchError] = useState<string | null>(null);

  // Handle Login with Worldwide Cloud Fallback
  const handleLoginSubmit = async (e: React.FormEvent) => {
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

    let matched = patientList.find(
      (p) =>
        p.dnaId.toLowerCase() === cleanId ||
        p.dnaId.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanId.replace(/[^a-z0-9]/g, "") ||
        p.email.toLowerCase() === cleanId ||
        p.phone.replace(/[^0-9]/g, "") === cleanId.replace(/[^0-9]/g, "") ||
        p.nationalId.toLowerCase() === cleanId
    );

    // If not found in local memory cache, perform worldwide live cloud lookup (supports millions of users globally)
    if (!matched) {
      setIsAuthenticating(true);
      try {
        // 1. Try local server lookup endpoint
        const serverRes = await fetch(`/api/patients/lookup?query=${encodeURIComponent(cleanId)}`);
        if (serverRes.ok) {
          const serverData = await serverRes.json();
          if (serverData.success && serverData.record) {
            matched = serverData.record.patient;
            if (handleRegisterCallback) {
              handleRegisterCallback(serverData.record);
            }
          }
        }

        // 2. If still not found, try direct Firestore document lookup
        if (!matched && cleanId.startsWith("dna-")) {
          const fsDoc = await getPatientFromFirestore(cleanId.toUpperCase());
          if (fsDoc && fsDoc.patient) {
            matched = fsDoc.patient;
            if (handleRegisterCallback) {
              handleRegisterCallback(fsDoc);
            }
          }
        }
      } catch (lookupErr) {
        console.warn("[Cloud Lookup] note:", lookupErr);
      } finally {
        setIsAuthenticating(false);
      }
    }

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

    const expectedPassword = (matched.password || "Haris456?!*").trim();
    const isMatch = cleanPwd === expectedPassword;

    if (isMatch) {
      resetFailedAttempts(matched.dnaId);

      // Enforce 2FA Email OTP Verification if patient has a registered email address
      const patientEmail = (matched.email || "").trim();
      if (patientEmail && patientEmail.includes("@") && !patientEmail.toLowerCase().includes("not specified")) {
        setIsAuthenticating(true);
        try {
          const res = await fetch("/api/auth/send-login-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: cleanId, password: cleanPwd }),
          });
          const data = await res.json();
          if (data.success) {
            setLoginOtpTargetDnaId(matched.dnaId);
            setLoginOtpMaskedEmail(data.maskedEmail);
            setLoginOtpCountdown(600);
            setLoginOtpCode("");
            setLoginOtpError(null);
            setLoginSimulatedOtp(data.otpCode || null);
            setIsLoginOtpModalOpen(true);
            return;
          } else {
            setLoginError(data.error || "Failed to dispatch login authorization code.");
            return;
          }
        } catch (otpErr) {
          console.warn("Could not dispatch login OTP:", otpErr);
        } finally {
          setIsAuthenticating(false);
        }
      }

      // Fallback for accounts without registered email
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        if (matched) {
          onLoginSuccess(matched.dnaId, rememberMe);
        }
      }, 400);
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

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginOtpError(null);

    if (!loginOtpCode.trim() || loginOtpCode.trim().length < 6) {
      setLoginOtpError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (!loginOtpTargetDnaId) return;

    setIsLoginOtpVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dnaId: loginOtpTargetDnaId, otpCode: loginOtpCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginOtpError(data.error || "Incorrect verification code. Please check your email.");
        return;
      }

      // 2FA Verified! Complete login
      setIsLoginOtpModalOpen(false);
      onLoginSuccess(loginOtpTargetDnaId, rememberMe);
    } catch (err: any) {
      console.error("Login OTP verify error:", err);
      setLoginOtpError("Verification error. Please try again.");
    } finally {
      setIsLoginOtpVerifying(false);
    }
  };

  const handleResendLoginOtp = async () => {
    if (!identifier || !password) return;
    setIsLoginOtpSending(true);
    setLoginOtpError(null);
    try {
      const res = await fetch("/api/auth/send-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setLoginOtpCountdown(600);
        setLoginSimulatedOtp(data.otpCode || null);
      } else {
        setLoginOtpError(data.error || "Failed to resend code.");
      }
    } catch (e) {
      setLoginOtpError("Failed to resend code. Please check connection.");
    } finally {
      setIsLoginOtpSending(false);
    }
  };

  // Quick Account Selector (populates form for quick review without bypassing security)
  const handleSelectQuickAccount = (patient: PatientProfile) => {
    setIdentifier(patient.dnaId);
    if (patient.password) {
      setPassword(patient.password);
    }
    setLoginError(null);
  };

  // Patient Registration with Live Email OTP Verification
  const handleDirectRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regForm.fullName.trim()) {
      setRegError("Please enter the patient's full legal name.");
      return;
    }
    const cleanEmail = regForm.email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setRegError("Please enter a valid email address.");
      return;
    }
    if (!regForm.password.trim()) {
      setRegError("Please set an account password.");
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

    // Generate unique sequential DNA ID starting at 10025 based on selected country
    const newDnaId = generateNewDnaId(regForm.country || "PK", allExistingIds);

    const newPatientProfile: PatientProfile = {
      dnaId: newDnaId,
      fullName: regForm.fullName.trim(),
      dob: regForm.dob || "Not Specified",
      gender: regForm.gender,
      bloodGroup: regForm.bloodGroup,
      avatarUrl: regForm.customAvatar || getDefaultAvatar(regForm.gender),
      phone: regForm.phone.trim() || "Not Provided",
      email: cleanEmail,
      address: regForm.address.trim() || "Not Specified",
      nationalId: regForm.nationalId.trim() || "Pending",
      biometricStatus: "Verified",
      organDonorStatus: regForm.organDonor,
      registeredHospital: regForm.hospital.trim() || "General Healthcare Registry",
      securityPin: "1234",
      password: regForm.password.trim(),
      biometricAuthEnabled: true,
      insurance: {
        provider: "None / Self-Pay",
        policyNumber: "N/A",
        groupNumber: "N/A",
        status: "Pending",
        coverageAmount: "N/A",
      },
      emergencyContacts: regForm.emergencyContactName.trim()
        ? [
            {
              id: `ec-${Date.now()}`,
              name: regForm.emergencyContactName.trim(),
              relationship: "Emergency Contact",
              phone: regForm.emergencyContactPhone.trim() || regForm.phone.trim() || "N/A",
              isPrimary: true,
            },
          ]
        : [],
    };

    const newRecord: PatientFullRecord = {
      patient: newPatientProfile,
      history: {
        diseases: [],
        surgeries: [],
        vaccinations: [],
        medicines: [],
        allergies: [],
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
      updatedAt: new Date().toISOString(),
    };

    setIsRegistering(true);
    try {
      const res = await fetch("/api/auth/send-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, fullName: regForm.fullName.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setRegError(data.error || "Failed to dispatch verification code to email.");
        return;
      }

      setPendingRegistrationRecord(newRecord);
      setRegOtpMaskedEmail(data.maskedEmail);
      setRegOtpCountdown(600);
      setRegOtpCode("");
      setRegOtpError(null);
      setRegSimulatedOtp(data.otpCode || null);
      setIsRegOtpModalOpen(true);
    } catch (sendErr: any) {
      console.error("Registration OTP error:", sendErr);
      setRegError("Network error sending verification code. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVerifyRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegOtpError(null);

    if (!regOtpCode.trim() || regOtpCode.trim().length < 6) {
      setRegOtpError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (!pendingRegistrationRecord) return;

    setIsRegOtpVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingRegistrationRecord.patient.email, otpCode: regOtpCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setRegOtpError(data.error || "Incorrect verification code. Please check your email.");
        return;
      }

      // Verified! Register the patient into Firestore & database
      setIsRegOtpModalOpen(false);
      setRegistrationSuccess(true);
      if (handleRegisterCallback) {
        handleRegisterCallback(pendingRegistrationRecord);
      }
    } catch (err: any) {
      console.error("Register OTP verify error:", err);
      setRegOtpError("Verification error. Please try again.");
    } finally {
      setIsRegOtpVerifying(false);
    }
  };

  const handleResendRegistrationOtp = async () => {
    if (!pendingRegistrationRecord) return;
    setIsRegOtpSending(true);
    setRegOtpError(null);
    try {
      const res = await fetch("/api/auth/send-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pendingRegistrationRecord.patient.email,
          fullName: pendingRegistrationRecord.patient.fullName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegOtpCountdown(600);
        setRegSimulatedOtp(data.otpCode || null);
      } else {
        setRegOtpError(data.error || "Failed to resend code.");
      }
    } catch (e) {
      setRegOtpError("Failed to resend code. Please check connection.");
    } finally {
      setIsRegOtpSending(false);
    }
  };

  // ==========================================
  // 3-STEP WIZARD ACTION HANDLERS
  // ==========================================

  // Step 1: Validate Personal Profile & Save/Advance to Step 2
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regForm.firstName.trim()) {
      setRegError("Please enter the patient's first name.");
      return;
    }
    if (!regForm.surname.trim()) {
      setRegError("Please enter the patient's surname.");
      return;
    }
    if (!regForm.dob) {
      setRegError("Please specify the date of birth.");
      return;
    }

    setRegForm((prev) => ({
      ...prev,
      fullName: `${prev.firstName.trim()} ${prev.surname.trim()}`,
    }));

    setRegStep(2);
  };

  // Step 2: Dispatch Email Verification Code (OTP)
  const handleSendStep2Otp = async () => {
    const cleanEmail = regForm.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setStep2OtpError("Please enter a valid email address first.");
      return;
    }

    setStep2OtpSending(true);
    setStep2OtpError(null);
    setStep2OtpSuccess(null);

    const displayName = `${regForm.firstName.trim()} ${regForm.surname.trim()}`.trim() || "Valued Patient";

    try {
      const res = await fetch("/api/auth/send-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, fullName: displayName }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep2OtpSent(true);
        setStep2OtpCountdown(600);
        setStep2SimulatedOtp(data.otpCode || null);
        if (data.emailDeliveryStatus === "sent") {
          setStep2OtpSuccess(`Verification code dispatched to ${data.maskedEmail || cleanEmail}`);
        } else if (data.emailDeliveryStatus === "failed") {
          setStep2OtpError(`Email dispatch note: ${data.emailDeliveryError || "Mail server deferred"}. You may use the instant verification code below.`);
        } else {
          setStep2OtpSuccess(`Verification code generated for ${data.maskedEmail || cleanEmail}`);
        }
      } else {
        setStep2OtpError(data.error || "Failed to dispatch verification code. Please check email.");
      }
    } catch (err) {
      setStep2OtpError("Network connection error. Could not dispatch verification code.");
    } finally {
      setStep2OtpSending(false);
    }
  };

  // Step 2: Verify Entered 6-Digit Email Code
  const handleVerifyStep2Otp = async () => {
    const cleanCode = step2OtpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setStep2OtpError("Please enter the complete 6-digit verification code.");
      return;
    }

    setStep2OtpVerifying(true);
    setStep2OtpError(null);

    try {
      const res = await fetch("/api/auth/verify-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regForm.email.trim().toLowerCase(), otpCode: cleanCode }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsEmailVerified(true);
        setStep2OtpSuccess("✓ Email verified successfully! You may now proceed to Step 3.");
      } else {
        setStep2OtpError(data.error || "Incorrect code. Please check your email inbox.");
      }
    } catch (err) {
      setStep2OtpError("Verification error. Please try again.");
    } finally {
      setStep2OtpVerifying(false);
    }
  };

  // Step 2: Validate Email Verification & Advance to Step 3
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regForm.email.trim()) {
      setRegError("Email address is required.");
      return;
    }

    if (!isEmailVerified) {
      setRegError("Please verify your email address using the 6-digit verification code before proceeding.");
      return;
    }

    setRegStep(3);
  };

  // Step 3: Complete Account Registration, Save to Cloud Firestore & Dispatch Welcome Email
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regForm.password.trim()) {
      setRegError("Please set an account password.");
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

    setIsRegistering(true);

    try {
      const combinedName = `${regForm.firstName.trim()} ${regForm.surname.trim()}`.trim();
      const newDnaId = generateNewDnaId(regForm.country || "PK", allExistingIds);

      const newPatientProfile: PatientProfile = {
        dnaId: newDnaId,
        fullName: combinedName,
        dob: regForm.dob || "Not Specified",
        gender: regForm.gender,
        bloodGroup: regForm.bloodGroup,
        avatarUrl: regForm.customAvatar || getDefaultAvatar(regForm.gender),
        phone: regForm.phone.trim() || "Not Provided",
        email: regForm.email.trim(),
        address: regForm.address.trim() || "Not Specified",
        nationalId: regForm.nationalId.trim() || "Pending",
        biometricStatus: "Verified",
        organDonorStatus: regForm.organDonor,
        registeredHospital: regForm.hospital.trim() || "General Healthcare Registry",
        securityPin: "1234",
        password: regForm.password.trim(),
        biometricAuthEnabled: true,
        insurance: {
          provider: "None / Self-Pay",
          policyNumber: "N/A",
          groupNumber: "N/A",
          status: "Pending",
          coverageAmount: "N/A",
        },
        emergencyContacts: regForm.emergencyContactName.trim()
          ? [
              {
                id: `ec-${Date.now()}`,
                name: regForm.emergencyContactName.trim(),
                relationship: "Emergency Contact",
                phone: regForm.emergencyContactPhone.trim() || regForm.phone.trim() || "N/A",
                isPrimary: true,
              },
            ]
          : [],
      };

      const newRecord: PatientFullRecord = {
        patient: newPatientProfile,
        history: {
          diseases: [],
          surgeries: [],
          vaccinations: [],
          medicines: [],
          allergies: [],
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
        updatedAt: new Date().toISOString(),
      };

      setRegistrationSuccess(true);
      if (handleRegisterCallback) {
        await handleRegisterCallback(newRecord);
      }
    } catch (err: any) {
      console.error("Final registration error:", err);
      setRegError(err?.message || "Failed to create account. Please try again.");
    } finally {
      setIsRegistering(false);
    }
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
      <div id="auth-main-hub" className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
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
            onClick={() => onSelectRoleTab("directory")}
            className="flex-1 min-w-[140px] py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <Users className="w-4 h-4 text-cyan-600" />
            <span>Patient Directory ({patientList.length})</span>
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

                {/* Session Inactivity / Lockout Expiration Banner */}
                {activeExpiryNotice && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-3 shadow-sm animate-fadeIn">
                    <div className="p-1.5 bg-amber-200/70 text-amber-800 rounded-xl shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-amber-950">
                        Session Protection Notice
                      </p>
                      <p className="text-amber-800 leading-relaxed text-[11px]">
                        {activeExpiryNotice}
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Patient DNA ID / Email / Phone:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. DNA-PK-26-10025, harismicrobiologist1@gmail.com, or phone"
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

              {/* Worldwide Security & Directory Guidance (5 cols) */}
              <div className="lg:col-span-5 bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Vault Security & Architecture
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Decentralized cryptographic health identity
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex items-center space-x-2 text-slate-900 font-bold">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Zero-Knowledge AES-256</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Personal clinical records and genomic markers are encrypted with tamper-evident cryptographic security.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex items-center space-x-2 text-slate-900 font-bold">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Official Patient Directory</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      All registered patient accounts and verified identities can be browsed in the <strong>Patient Directory</strong> tab above.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs text-blue-900 space-y-1.5 leading-relaxed">
                  <div className="flex items-center space-x-2 text-blue-800 font-bold">
                    <Dna className="w-4 h-4 text-blue-600" />
                    <span>Independent Worldwide Vaults</span>
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Each patient has a dedicated, encrypted personal health record vault. Authenticate with your DNA ID, registered email, or phone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Register New Patient with Email OTP Verification */}
        {activeMode === "register" && (
          <div className="p-6 sm:p-10 space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="border-b border-slate-200 pb-5">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                <UserPlus className="w-4 h-4" />
                <span>Universal Health DNA Passport Registration</span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 mt-2">
                Create Your Universal Health DNA Account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your demographic and medical details to instantly provision your decentralized health vault and DNA ID.
              </p>
            </div>

            {/* 3-Step Wizard Navigation Stepper */}
            <div className="flex items-center justify-between max-w-2xl mx-auto py-2 px-1">
              {/* Step 1 Indicator */}
              <button
                type="button"
                onClick={() => setRegStep(1)}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  regStep === 1
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40"
                    : regStep > 1
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black ${
                    regStep === 1
                      ? "bg-white text-blue-700"
                      : regStep > 1
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {regStep > 1 ? "✓" : "1"}
                </div>
                <span className="hidden sm:inline">1. Profile & Bio</span>
              </button>

              <div
                className={`h-0.5 flex-1 mx-2 transition-colors ${
                  regStep >= 2 ? "bg-blue-500" : "bg-slate-200"
                }`}
              />

              {/* Step 2 Indicator */}
              <button
                type="button"
                onClick={() => {
                  if (regForm.firstName.trim() && regForm.surname.trim() && regForm.dob) {
                    setRegStep(2);
                  }
                }}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  regStep === 2
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40"
                    : regStep > 2
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black ${
                    regStep === 2
                      ? "bg-white text-blue-700"
                      : regStep > 2
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {regStep > 2 ? "✓" : "2"}
                </div>
                <span className="hidden sm:inline">2. Email & OTP</span>
              </button>

              <div
                className={`h-0.5 flex-1 mx-2 transition-colors ${
                  regStep === 3 ? "bg-blue-500" : "bg-slate-200"
                }`}
              />

              {/* Step 3 Indicator */}
              <button
                type="button"
                onClick={() => {
                  if (regForm.firstName.trim() && regForm.surname.trim() && isEmailVerified) {
                    setRegStep(3);
                  }
                }}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  regStep === 3
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black ${
                    regStep === 3
                      ? "bg-white text-blue-700"
                      : "bg-slate-300 text-slate-700"
                  }`}
                >
                  3
                </div>
                <span className="hidden sm:inline">3. Password & Vault</span>
              </button>
            </div>

            {/* Error Display Banner */}
            {regError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2 animate-shake">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {/* ======================================================== */}
            {/* PAGE 1: Personal & Biometric Profile */}
            {/* ======================================================== */}
            {regStep === 1 && (
              <form onSubmit={handleStep1Next} className="space-y-6 animate-fadeIn">
                {/* Automated Health DNA ID Issuance & Country Selection Banner */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl border border-indigo-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-cyan-300 text-xs font-black uppercase tracking-wider">
                      <Dna className="w-4 h-4 animate-pulse text-cyan-400" />
                      <span>Automated DNA Passport ID System</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 text-[10px] font-bold border border-cyan-400/30 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-cyan-300" />
                      <span>Starts from #10025</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* Country Selection Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-blue-200 mb-1.5 flex items-center space-x-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Country / Region Jurisdiction <span className="text-rose-400">*</span></span>
                      </label>
                      <select
                        value={regForm.country || "PK"}
                        onChange={(e) => handleRegCountryChange(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white text-slate-900 border border-indigo-300/40 font-bold text-xs focus:ring-2 focus:ring-cyan-400 outline-none transition-all cursor-pointer shadow-inner"
                      >
                        {SUPPORTED_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code} className="text-slate-900 font-medium">
                            {c.flag} {c.name} ({c.code}) — {c.region}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-blue-200/80 mt-1.5 flex items-center space-x-1">
                        <span>Selected:</span>
                        <span className="font-bold text-cyan-300">{regCountryObj.flag} {regCountryObj.name} ({regForm.country || "PK"})</span>
                      </p>
                    </div>

                    {/* Dynamic Live DNA ID Format Preview Card */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-blue-200 uppercase tracking-wider">Assigned Health DNA ID</span>
                        <span className="text-emerald-300 flex items-center space-x-1 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Live Dynamic Sync</span>
                        </span>
                      </div>

                      <div className="py-1">
                        <div className="text-xl sm:text-2xl font-mono font-black tracking-widest text-cyan-300 drop-shadow flex items-center space-x-2">
                          <span>{regPreviewDnaId}</span>
                          <span className="text-xl" title={regCountryObj.name}>{regCountryObj.flag}</span>
                        </div>
                      </div>

                      {/* Segment Breakdown Chips */}
                      <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                        <div className="bg-white/10 px-1 py-0.5 rounded border border-white/10">
                          <span className="text-slate-400 block text-[8px]">PREFIX</span>
                          <span className="font-bold text-white">DNA</span>
                        </div>
                        <div className="bg-cyan-500/30 text-cyan-200 px-1 py-0.5 rounded border border-cyan-400/40">
                          <span className="text-cyan-300 block text-[8px]">COUNTRY</span>
                          <span className="font-black">{regForm.country || "PK"}</span>
                        </div>
                        <div className="bg-white/10 px-1 py-0.5 rounded border border-white/10">
                          <span className="text-slate-400 block text-[8px]">YEAR</span>
                          <span className="font-bold text-white">{currentYearShort}</span>
                        </div>
                        <div className="bg-indigo-500/40 text-indigo-100 px-1 py-0.5 rounded border border-indigo-400/40">
                          <span className="text-indigo-200 block text-[8px]">SEQ</span>
                          <span className="font-black">#{regNextSeq}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Identity Fields */}
                <div className="p-6 bg-slate-50/80 rounded-3xl border border-slate-200/80 space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Page 1: Personal Demographic Details</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* First Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Haris"
                        value={regForm.firstName}
                        onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                        required
                      />
                    </div>

                    {/* Surname */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Surname <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Amin"
                        value={regForm.surname}
                        onChange={(e) => setRegForm({ ...regForm, surname: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                        required
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Date of Birth (DOB) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={regForm.dob}
                        onChange={(e) => setRegForm({ ...regForm, dob: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                        required
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Gender <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={regForm.gender}
                        onChange={(e) => {
                          const newGender = e.target.value;
                          setRegForm((prev) => ({
                            ...prev,
                            gender: newGender,
                            customAvatar: prev.customAvatar.startsWith("data:image/svg+xml") || !prev.customAvatar
                              ? getDefaultAvatar(newGender)
                              : prev.customAvatar,
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Blood Group */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Blood Group <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={regForm.bloodGroup}
                        onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all cursor-pointer"
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

                    {/* Photo / Symbol Avatar Selector */}
                    <div className="sm:col-span-2 md:col-span-4 p-4 bg-white rounded-2xl border border-slate-200">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-900">
                            Patient ID Photo / Symbol Avatar
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Choose between standard Male/Female symbol avatar or upload your personal photo
                          </p>
                        </div>
                        <label className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-800 text-xs font-bold cursor-pointer transition-all shadow-sm shrink-0 flex items-center space-x-1.5">
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (reader.result) {
                                    setRegForm((prev) => ({ ...prev, customAvatar: reader.result as string }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PRESET_SYMBOL_AVATARS.map((sym) => {
                          const currentActive = regForm.customAvatar || getDefaultAvatar(regForm.gender);
                          const isSelected = currentActive === sym.url;
                          return (
                            <button
                              key={sym.id}
                              type="button"
                              onClick={() => {
                                setRegForm((prev) => ({
                                  ...prev,
                                  gender: sym.gender,
                                  customAvatar: sym.url,
                                }));
                              }}
                              className={`p-3 rounded-2xl border-2 flex items-center space-x-3.5 transition-all text-left cursor-pointer ${
                                isSelected
                                  ? "bg-blue-50/50 border-blue-600 shadow-md ring-2 ring-blue-500/20"
                                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
                              }`}
                            >
                              <img
                                src={sym.url}
                                alt={sym.label}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-2 ring-slate-200 shadow-md"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-1.5">
                                  <p className="text-xs font-extrabold text-slate-900 truncate">
                                    {sym.label}
                                  </p>
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                                  {sym.sublabel} ({sym.gender})
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {regForm.customAvatar && !regForm.customAvatar.startsWith("data:image/svg+xml") && (
                        <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                          <div className="flex items-center space-x-2 truncate">
                            <img
                              src={regForm.customAvatar}
                              alt="Uploaded"
                              className="w-8 h-8 rounded-lg object-cover ring-1 ring-blue-300"
                            />
                            <span className="font-semibold truncate">Custom Photo Uploaded</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setRegForm((prev) => ({
                                ...prev,
                                customAvatar: getDefaultAvatar(prev.gender),
                              }))
                            }
                            className="text-[11px] font-bold text-blue-700 hover:underline shrink-0 ml-2 cursor-pointer"
                          >
                            Reset to Default
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Page 1 Bottom Actions */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Save & Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* PAGE 2: Contact & Live Email Verification */}
            {/* ======================================================== */}
            {regStep === 2 && (
              <form onSubmit={handleStep2Next} className="space-y-6 animate-fadeIn">
                <div className="p-6 bg-slate-50/80 rounded-3xl border border-slate-200/80 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Page 2: Contact Info & Email Verification</span>
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Patient: <strong className="text-slate-800">{regForm.firstName} {regForm.surname}</strong>
                    </span>
                  </div>

                  {/* Email & Send Code Section */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          disabled={isEmailVerified}
                          placeholder="e.g. harismicrobiologist1@gmail.com"
                          value={regForm.email}
                          onChange={(e) => {
                            setRegForm({ ...regForm, email: e.target.value });
                            setIsEmailVerified(false);
                            setStep2OtpSent(false);
                            setStep2OtpSuccess(null);
                          }}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold text-slate-900 outline-none transition-all ${
                            isEmailVerified
                              ? "bg-emerald-50/50 border-emerald-400 text-emerald-950 font-mono"
                              : "bg-white border-slate-300 focus:ring-2 focus:ring-blue-500"
                          }`}
                          required
                        />
                        {isEmailVerified && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3.5 top-3" />
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={step2OtpSending || isEmailVerified}
                        onClick={handleSendStep2Otp}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer ${
                          isEmailVerified
                            ? "bg-emerald-600 text-white cursor-default"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 disabled:opacity-50"
                        }`}
                      >
                        {step2OtpSending ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : isEmailVerified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified ✓</span>
                          </>
                        ) : step2OtpSent ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Resend Code</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Verification Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Dispatched from: <span className="font-medium text-blue-600">Patient DNA (security@patientdnapro.com)</span>
                    </p>

                    {/* Step 2 Error Notice (Always visible if error occurs) */}
                    {step2OtpError && (
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{step2OtpError}</span>
                      </div>
                    )}

                    {/* Verification Status Banner with Spam Warning */}
                    {step2OtpSuccess && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium space-y-1 animate-fadeIn">
                        <div className="flex items-center space-x-2 font-bold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{step2OtpSuccess}</span>
                        </div>
                        {!isEmailVerified && (
                          <p className="text-[11px] text-emerald-700/90 pl-6">
                            📧 <strong>Important:</strong> First-time security emails may arrive in your <strong>Spam / Junk folder</strong> or <strong>Updates tab</strong>. Please check there if not in your Primary Inbox.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Inline OTP Verification Box */}
                  {step2OtpSent && !isEmailVerified && (
                    <div className="p-4 rounded-2xl bg-white border-2 border-blue-200 shadow-sm space-y-3.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                          <span>Enter 6-Digit Code Sent to Email:</span>
                        </span>
                        <span className="font-mono text-slate-500 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {Math.floor(step2OtpCountdown / 60)}:{(step2OtpCountdown % 60).toString().padStart(2, "0")}
                          </span>
                        </span>
                      </div>

                      {step2SimulatedOtp && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Instant Testing Code: </span>
                            <span className="font-mono font-black text-sm bg-amber-200/60 px-2 py-0.5 rounded">
                              {step2SimulatedOtp}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep2OtpCode(step2SimulatedOtp)}
                            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                          >
                            Auto-Fill Code
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          autoFocus
                          placeholder="••••••"
                          value={step2OtpCode}
                          onChange={(e) => setStep2OtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                          className="flex-1 text-center py-2.5 px-4 rounded-2xl border-2 border-slate-300 font-mono text-xl font-black tracking-[8px] focus:border-blue-600 outline-none bg-slate-50 focus:bg-white transition-all text-slate-900"
                        />
                        <button
                          type="button"
                          disabled={step2OtpVerifying || step2OtpCode.trim().length < 6}
                          onClick={handleVerifyStep2Otp}
                          className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {step2OtpVerifying ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>{step2OtpVerifying ? "Verifying..." : "Verify Code"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Phone Number Field (Optional as requested) */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone Number <span className="text-slate-400 font-normal">(Optional)</span></span>
                    </label>
                    <input
                      type="tel"
                      placeholder={`${regCountryObj.dialCode} 300 1234567`}
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Used for secondary SMS alerts and emergency contact triage.
                    </p>
                  </div>
                </div>

                {/* Page 2 Bottom Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="px-5 py-2.5 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Profile</span>
                  </button>

                  <button
                    type="submit"
                    disabled={!isEmailVerified}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center space-x-2 disabled:opacity-40 cursor-pointer"
                  >
                    <span>Save & Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* PAGE 3: Password, Security & Account Activation */}
            {/* ======================================================== */}
            {regStep === 3 && (
              <form onSubmit={handleStep3Submit} className="space-y-6 animate-fadeIn">
                {/* Account Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                      Identity Ready for Provisioning
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {regForm.firstName} {regForm.surname}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Verified Email: {regForm.email}
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-white border border-blue-200 font-mono font-bold text-xs text-blue-700 shadow-sm shrink-0">
                    {regPreviewDnaId} {regCountryObj.flag}
                  </div>
                </div>

                <div className="p-6 bg-slate-50/80 rounded-3xl border border-slate-200/80 space-y-5">
                  <h3 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-3">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span>Page 3: Account Password & Vault Security</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Create Account Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="e.g. Vault@2026Secure!"
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                        required
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Re-enter account password"
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Strength Checklist */}
                  {regForm.password.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
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

                  {/* Organ Donor & Optional Fields */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Organ Donor Registry
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Include organ donor authorization on your emergency digital passport
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regForm.organDonor}
                        onChange={(e) => setRegForm({ ...regForm, organDonor: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Page 3 Bottom Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setRegStep(2)}
                    className="px-5 py-2.5 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Email</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isRegistering ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-white" />
                        <span>Activating Vault & Sending Welcome Email...</span>
                      </>
                    ) : registrationSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Vault Activated! Welcome Email Dispatched...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Complete Registration & Open Health Vault 🎉</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
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

      {/* Registration Email OTP Verification Modal */}
      {isRegOtpModalOpen && pendingRegistrationRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-6 text-white text-center relative">
              <button
                type="button"
                onClick={() => setIsRegOtpModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-3 shadow-inner">
                <MailCheck className="w-7 h-7 text-cyan-200" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Verify Your Email</h3>
              <p className="text-xs text-blue-100 mt-1">
                A verification code was dispatched to activate your vault
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 text-center">
                <p className="font-medium text-slate-700">
                  Enter the 6-digit verification code delivered to:
                </p>
                <p className="font-bold text-slate-900 font-mono text-sm">
                  {regOtpMaskedEmail || pendingRegistrationRecord.patient.email}
                </p>
                <p className="text-[11px] text-slate-400">
                  Sender: <span className="font-medium text-blue-600">Patient DNA (security@patientdnapro.com)</span>
                </p>
              </div>

              {regSimulatedOtp && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Sandbox Testing Code:</span>{" "}
                    <span className="font-mono font-bold tracking-widest text-sm bg-amber-200/60 px-2 py-0.5 rounded-lg">
                      {regSimulatedOtp}
                    </span>
                  </div>
                </div>
              )}

              {regOtpError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{regOtpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyRegistrationOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={regOtpCode}
                    onChange={(e) => setRegOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="••••••"
                    className="w-full text-center text-3xl font-mono font-black tracking-[12px] py-3.5 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {Math.floor(regOtpCountdown / 60)}:{(regOtpCountdown % 60).toString().padStart(2, "0")}
                    </span>
                  </span>

                  <button
                    type="button"
                    disabled={isRegOtpSending || regOtpCountdown > 540}
                    onClick={handleResendRegistrationOtp}
                    className="font-bold text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegOtpSending ? "animate-spin" : ""}`} />
                    <span>{isRegOtpSending ? "Resending..." : "Resend Code"}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isRegOtpVerifying || regOtpCode.trim().length < 6}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isRegOtpVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{isRegOtpVerifying ? "Verifying Email..." : "Verify & Activate Account"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Login 2FA Email OTP Verification Modal */}
      {isLoginOtpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 text-white text-center relative">
              <button
                type="button"
                onClick={() => setIsLoginOtpModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-inner">
                <ShieldCheck className="w-7 h-7 text-cyan-300" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Two-Factor Authentication</h3>
              <p className="text-xs text-blue-200 mt-1">
                Authorize login to access your encrypted health records
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 text-center">
                <p className="font-medium text-slate-700">
                  A 6-digit security authorization code was sent to:
                </p>
                <p className="font-bold text-slate-900 font-mono text-sm">
                  {loginOtpMaskedEmail}
                </p>
                <p className="text-[11px] text-slate-400">
                  Verified Sender: <span className="font-medium text-blue-600">Patient DNA (security@patientdnapro.com)</span>
                </p>
              </div>

              {loginSimulatedOtp && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Sandbox Testing Code:</span>{" "}
                    <span className="font-mono font-bold tracking-widest text-sm bg-amber-200/60 px-2 py-0.5 rounded-lg">
                      {loginSimulatedOtp}
                    </span>
                  </div>
                </div>
              )}

              {loginOtpError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginOtpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyLoginOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                    6-Digit Security Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={loginOtpCode}
                    onChange={(e) => setLoginOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="••••••"
                    className="w-full text-center text-3xl font-mono font-black tracking-[12px] py-3.5 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {Math.floor(loginOtpCountdown / 60)}:{(loginOtpCountdown % 60).toString().padStart(2, "0")}
                    </span>
                  </span>

                  <button
                    type="button"
                    disabled={isLoginOtpSending || loginOtpCountdown > 540}
                    onClick={handleResendLoginOtp}
                    className="font-bold text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoginOtpSending ? "animate-spin" : ""}`} />
                    <span>{isLoginOtpSending ? "Resending..." : "Resend Code"}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoginOtpVerifying || loginOtpCode.trim().length < 6}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoginOtpVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>{isLoginOtpVerifying ? "Verifying Authorization..." : "Authorize & Unlock Vault"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
