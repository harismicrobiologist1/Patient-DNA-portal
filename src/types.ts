export type UserRole = "patient" | "doctor" | "admin" | "emergency";

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber: string;
  status: "Active" | "Pending" | "Expired";
  coverageAmount: string;
}

export interface PatientProfile {
  dnaId: string;
  fullName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  avatarUrl: string;
  phone: string;
  email: string;
  address: string;
  nationalId: string;
  biometricStatus: "Verified" | "Pending Verification";
  emergencyContacts: EmergencyContact[];
  insurance: InsuranceInfo;
  organDonorStatus: boolean;
  registeredHospital: string;
  securityPin?: string; // 4-digit Account Security PIN (e.g. "1234")
  password?: string; // Account Password created during registration for self-login
}

export interface DiseaseRecord {
  id: string;
  name: string;
  diagnosedDate: string;
  status: "Active" | "Managed" | "In Remission" | "Resolved";
  doctor: string;
  severity: "High" | "Moderate" | "Low";
}

export interface SurgeryRecord {
  id: string;
  procedure: string;
  hospital: string;
  surgeon: string;
  date: string;
  outcome: string;
  notes: string;
}

export interface VaccinationRecord {
  id: string;
  vaccine: string;
  doseNumber: string;
  date: string;
  administeredBy: string;
  nextDueDate?: string;
  batchNo: string;
}

export interface AllergyRecord {
  id: string;
  allergen: string;
  reaction: string;
  severity: "Critical" | "Severe" | "Moderate" | "Mild";
  onsetDate: string;
}

export interface MedicineRecord {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  duration: string;
  prescribedBy: string;
  purpose: string;
  refillsRemaining: number;
}

export interface FamilyHistoryRecord {
  id: string;
  condition: string;
  relation: string;
  onsetAge: string;
  riskFactor: "High" | "Moderate" | "Low";
}

export interface ChronicIllnessRecord {
  id: string;
  condition: string;
  diagnosedYear: string;
  carePlan: string;
  currentControlStatus: "Optimal" | "Sub-optimal" | "Requires Adjustment";
}

export interface LifestyleInfo {
  smokingStatus: "Non-smoker" | "Former smoker" | "Current smoker";
  alcoholConsumption: "None" | "Occasional" | "Moderate" | "Heavy";
  physicalActivity: "Sedentary" | "Light (1-2 days/wk)" | "Active (3-5 days/wk)" | "Athletic";
  sleepAvgHours: number;
  dietType: "Balanced" | "Vegetarian" | "Low Carb" | "Keto" | "Diabetic-Friendly";
}

export interface MedicalHistory {
  diseases: DiseaseRecord[];
  surgeries: SurgeryRecord[];
  vaccinations: VaccinationRecord[];
  medicines: MedicineRecord[];
  allergies: AllergyRecord[];
  familyHistory: FamilyHistoryRecord[];
  chronicIllnesses: ChronicIllnessRecord[];
  lifestyle: LifestyleInfo;
}

export interface VitalsData {
  bp: string;
  heartRate: number;
  tempCelsius: number;
  spO2: number;
  respRate: number;
  weightKg: number;
  heightCm: number;
}

export interface ClinicalRecord {
  id: string;
  date: string;
  recordType: "OPD Visit" | "Inpatient Admission" | "Surgical Operation" | "ICU Stay";
  hospitalName: string;
  attendingDoctor: string;
  department: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentGiven: string;
  dischargeSummary?: string;
  followUpNotes: string;
  vitals: VitalsData;
}

export interface LabResultItem {
  testItem: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
}

export interface LabReport {
  id: string;
  date: string;
  category: "Blood Test" | "X-Ray" | "MRI" | "CT Scan" | "ECG" | "Ultrasound";
  testName: string;
  facility: string;
  orderedBy: string;
  status: "Completed" | "Pending Review";
  keyFindings: string;
  specimenType?: string;
  numericResults: LabResultItem[];
  imagingPreviewType?: "chest_xray" | "brain_mri" | "cardiac_ecg" | "abdominal_us";
}

export interface Prescription {
  id: string;
  date: string;
  doctorName: string;
  department: string;
  hospital: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions: string;
    refillAvailable: boolean;
  }[];
  digitalSignature: string;
  qrCodeToken: string;
}

export interface Appointment {
  id: string;
  hospital: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  queueNumber: number;
  status: "Confirmed" | "In-Progress" | "Completed" | "Cancelled";
  tokenCode: string;
  symptomsNote?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  securityHash: string;
}

export interface GeneticMarker {
  gene: string;
  variant: string;
  trait: string;
  riskCategory: "Low" | "Elevated" | "Protected" | "Pharmacogenomic Note";
  clinicalSignificance: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  licenseNumber: string;
  experienceYears: number;
  rating: number;
  avatarUrl: string;
  availableDays: string[];
}

export interface DoctorAuthSession {
  patientDnaId: string;
  doctorName: string;
  sessionToken?: string;
  token?: string;
  authorizedAt?: string;
  verifiedAt?: number;
  expiresAt: string | number;
}

export interface PatientFullRecord {
  patient: PatientProfile;
  history: MedicalHistory;
  clinicalRecords: ClinicalRecord[];
  labReports: LabReport[];
  prescriptions: Prescription[];
  appointments: Appointment[];
}


