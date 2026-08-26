import React, { useState, useEffect, useRef } from "react";
import { PatientProfile, EmergencyContact } from "../types";
import { evaluatePasswordStrength } from "../utils/security";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  CreditCard,
  Heart,
  Plus,
  Trash2,
  Edit2,
  Check,
  QrCode,
  Fingerprint,
  Building,
  Calendar,
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  LogOut,
  Info,
  CheckCircle2,
} from "lucide-react";

interface PatientProfileViewProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: PatientProfile) => void;
  onOpenDigitalId: () => void;
  onLogout?: () => void;
  onOpenFhirCryptoVault?: () => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300",
];

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patient,
  onUpdatePatient,
  onOpenDigitalId,
  onLogout,
  onOpenFhirCryptoVault,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState(patient.avatarUrl);
  const [formData, setFormData] = useState<PatientProfile>(patient);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password & Security Management State
  const [newPassword, setNewPassword] = useState(patient.password || "Patient@123");
  const [confirmPassword, setConfirmPassword] = useState(patient.password || "Patient@123");
  const [newPin, setNewPin] = useState(patient.securityPin || "1234");
  const [showPassword, setShowPassword] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  useEffect(() => {
    setFormData(patient);
    setTempAvatarUrl(patient.avatarUrl);
    setNewPassword(patient.password || "Patient@123");
    setConfirmPassword(patient.password || "Patient@123");
    setNewPin(patient.securityPin || "1234");
  }, [patient]);

  const newPasswordStrength = evaluatePasswordStrength(newPassword);

  const handleUpdateSecurityCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!newPasswordStrength.isValidStrong) {
      setPwdError("Strong Password Required: Minimum 8 characters with uppercase, lowercase, numbers, and a special character (!@#$).");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("Passwords do not match. Please verify.");
      return;
    }

    const updated: PatientProfile = {
      ...patient,
      password: newPassword.trim(),
      securityPin: newPin.trim() || "1234",
    };

    onUpdatePatient(updated);
    setPwdSuccess("Strong Password & Security PIN updated successfully!");
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setPwdSuccess(null);
    }, 1500);
  };

  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: "",
    relationship: "",
    phone: "",
    isPrimary: false,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePatient(formData);
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const resultStr = reader.result as string;
          setTempAvatarUrl(resultStr);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPhoto = () => {
    const updated = { ...formData, avatarUrl: tempAvatarUrl };
    setFormData(updated);
    onUpdatePatient(updated);
    setIsPhotoModalOpen(false);
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) return;
    const contact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: newContact.name,
      relationship: newContact.relationship || "Relative",
      phone: newContact.phone,
      isPrimary: newContact.isPrimary || false,
    };
    const updated = {
      ...formData,
      emergencyContacts: [...formData.emergencyContacts, contact],
    };
    setFormData(updated);
    onUpdatePatient(updated);
    setNewContact({ name: "", relationship: "", phone: "", isPrimary: false });
  };

  const handleDeleteContact = (id: string) => {
    const updated = {
      ...formData,
      emergencyContacts: formData.emergencyContacts.filter((c) => c.id !== id),
    };
    setFormData(updated);
    onUpdatePatient(updated);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Profile Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="relative group">
            <img
              src={patient.avatarUrl}
              alt={patient.fullName}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-blue-100 shadow-md border border-slate-200 transition-all group-hover:brightness-90"
            />
            {/* Edit Photo Overlay Badge */}
            <button
              onClick={() => {
                setTempAvatarUrl(patient.avatarUrl);
                setIsPhotoModalOpen(true);
              }}
              className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex flex-col items-center justify-center text-white text-[10px] font-bold space-y-1 backdrop-blur-[2px]"
              title="Click to change profile picture"
            >
              <Camera className="w-5 h-5 text-cyan-300" />
              <span>Change Photo</span>
            </button>

            <button
              onClick={() => {
                setTempAvatarUrl(patient.avatarUrl);
                setIsPhotoModalOpen(true);
              }}
              className="absolute -top-2 -right-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-md border-2 border-white transition-transform hover:scale-110"
              title="Edit Profile Picture"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenDigitalId}
              className="absolute -bottom-2 -right-2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg border-2 border-white transition-transform hover:scale-110"
              title="View Digital QR ID"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {patient.fullName}
              </h1>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                {patient.dnaId}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center space-x-2">
              <span>National ID: {patient.nationalId}</span>
              <span>•</span>
              <span className="text-slate-700 font-semibold">{patient.registeredHospital}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-xs">
                Blood Group: {patient.bloodGroup}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center space-x-1">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Biometric: {patient.biometricStatus}</span>
              </span>
              {patient.organDonorStatus && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>Organ Donor</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
          {onOpenFhirCryptoVault && (
            <button
              onClick={onOpenFhirCryptoVault}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              title="Open Zero-Knowledge AES-256 Vault & HL7 FHIR Exporter"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              <span>Zero-Knowledge & FHIR R4</span>
            </button>
          )}
          <button
            onClick={() => {
              setTempAvatarUrl(patient.avatarUrl);
              setIsPhotoModalOpen(true);
            }}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 border border-cyan-300 font-bold text-xs transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-cyan-600" />
            <span>Change Photo</span>
          </button>
          <button
            onClick={onOpenDigitalId}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>Digital ID Card</span>
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
          </button>
          {onLogout && (
            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all shadow-sm group"
              title="Log out of this patient account"
            >
              <LogOut className="w-4 h-4 text-rose-600 group-hover:-translate-x-0.5 transition-transform" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Details Form/Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2 border-b border-slate-100 pb-4">
              <User className="w-5 h-5 text-blue-600" />
              <span>Personal Information</span>
            </h2>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                    <input
                      type="text"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">National ID Number</label>
                    <input
                      type="text"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Universal DNA ID Token</label>
                    <input
                      type="text"
                      value={formData.dnaId}
                      onChange={(e) => setFormData({ ...formData, dnaId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Registered Primary Hospital</label>
                    <input
                      type="text"
                      value={formData.registeredHospital}
                      onChange={(e) => setFormData({ ...formData, registeredHospital: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Insurance Provider</label>
                    <input
                      type="text"
                      value={formData.insurance.provider}
                      onChange={(e) => setFormData({ ...formData, insurance: { ...formData.insurance, provider: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Insurance Policy Number</label>
                    <input
                      type="text"
                      value={formData.insurance.policyNumber}
                      onChange={(e) => setFormData({ ...formData, insurance: { ...formData.insurance, policyNumber: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Insurance Coverage Amount</label>
                    <input
                      type="text"
                      value={formData.insurance.coverageAmount}
                      onChange={(e) => setFormData({ ...formData, insurance: { ...formData.insurance, coverageAmount: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="organDonorCheckProfile"
                    checked={formData.organDonorStatus}
                    onChange={(e) => setFormData({ ...formData, organDonorStatus: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="organDonorCheckProfile" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Registered Organ Donor Status
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Profile Picture URL</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTempAvatarUrl(formData.avatarUrl);
                        setIsPhotoModalOpen(true);
                      }}
                      className="text-cyan-600 hover:text-cyan-700 text-[11px] font-bold flex items-center space-x-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload or Choose Preset</span>
                    </button>
                  </label>
                  <div className="flex items-center space-x-3">
                    <img
                      src={formData.avatarUrl}
                      alt="Avatar Preview"
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Phone Number
                  </span>
                  <p className="font-semibold text-slate-800 flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span>{patient.phone}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Email Address
                  </span>
                  <p className="font-semibold text-slate-800 flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>{patient.email}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Residential Address
                  </span>
                  <p className="font-semibold text-slate-800 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>{patient.address}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Registered Primary Center
                  </span>
                  <p className="font-semibold text-slate-800 flex items-center space-x-2">
                    <Building className="w-4 h-4 text-blue-500" />
                    <span>{patient.registeredHospital}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Emergency Contacts Management */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2 border-b border-slate-100 pb-4">
              <Phone className="w-5 h-5 text-red-600" />
              <span>Emergency Contacts</span>
            </h2>

            <div className="space-y-3 mb-6">
              {patient.emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{contact.name}</span>
                        <span className="text-xs text-slate-500">({contact.relationship})</span>
                        {contact.isPrimary && (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">
                        {contact.phone}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-2 hover:bg-slate-200 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Contact Row */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Add New Emergency Contact</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g. Spouse, Parent)"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleAddContact}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Insurance & Identity Verification */}
        <div className="space-y-6">
          {/* Insurance Overview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Health Insurance</span>
            </h3>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  {patient.insurance.provider}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  {patient.insurance.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Policy Number</p>
                <p className="font-mono text-base font-bold tracking-wider text-white">
                  {patient.insurance.policyNumber}
                </p>
              </div>
              <div className="pt-2 border-t border-indigo-800/80 text-xs text-indigo-200">
                <p>Group: {patient.insurance.groupNumber}</p>
                <p className="text-[11px] text-slate-300 mt-0.5">{patient.insurance.coverageAmount}</p>
              </div>
            </div>
          </div>

          {/* Security & Identity Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>Security & Identity</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Active & Protected
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-semibold">Universal DNA ID:</span>
                <span className="font-mono font-bold text-blue-600">{patient.dnaId}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-semibold">Vault Security Gateway:</span>
                <span className="font-bold text-slate-800 flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Password Encrypted</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-semibold">National Health Sync:</span>
                <span className="font-bold text-blue-700">Connected</span>
              </div>
            </div>
          </div>

          {/* Account Password & Self-Login Protection Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
              <h3 className="text-base font-bold text-amber-950 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <span>Account Password & Credentials</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Active</span>
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-amber-200/80">
                <div>
                  <span className="text-slate-600 font-semibold block">Patient Self-Login Password:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">••••••••••</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Change Password</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-amber-200/80">
                <div>
                  <span className="text-slate-600 font-semibold block">4-Digit Security PIN:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {patient.securityPin || "1234"}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-lg">
                  Bedside / Kiosk PIN
                </span>
              </div>

              {onLogout && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-950">
                  <div>
                    <span className="text-slate-800 font-bold block">Patient Session</span>
                    <span className="text-[11px] text-slate-500">Sign out of {patient.fullName}'s account</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out of Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 relative animate-in fade-in zoom-in-95 duration-200 my-8">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Update Account Password</h3>
                <p className="text-xs text-slate-500">
                  Manage self-login credentials for {patient.fullName}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateSecurityCredentials} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">New Password: <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="e.g. Health@Vault2026!"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                {/* Strength Meter & Checklist */}
                {newPassword.length > 0 && (
                  <div className="mt-2 space-y-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-600">Password Strength:</span>
                      <span className={`font-black ${newPasswordStrength.color}`}>
                        {newPasswordStrength.level} ({newPasswordStrength.score}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${newPasswordStrength.barColor}`}
                        style={{ width: `${newPasswordStrength.score}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] pt-1">
                      <span className={`flex items-center space-x-1 ${newPasswordStrength.checks.minLength ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                        <span>{newPasswordStrength.checks.minLength ? "✓" : "○"}</span>
                        <span>8+ Characters</span>
                      </span>
                      <span className={`flex items-center space-x-1 ${newPasswordStrength.checks.hasUpper ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                        <span>{newPasswordStrength.checks.hasUpper ? "✓" : "○"}</span>
                        <span>Uppercase (A-Z)</span>
                      </span>
                      <span className={`flex items-center space-x-1 ${newPasswordStrength.checks.hasLower ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                        <span>{newPasswordStrength.checks.hasLower ? "✓" : "○"}</span>
                        <span>Lowercase (a-z)</span>
                      </span>
                      <span className={`flex items-center space-x-1 ${newPasswordStrength.checks.hasNumber ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                        <span>{newPasswordStrength.checks.hasNumber ? "✓" : "○"}</span>
                        <span>Numbers (0-9)</span>
                      </span>
                      <span className={`col-span-2 flex items-center space-x-1 ${newPasswordStrength.checks.hasSpecial ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                        <span>{newPasswordStrength.checks.hasSpecial ? "✓" : "○"}</span>
                        <span>Special Symbol (!@#$...)</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm New Password: <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">4-Digit Quick PIN:</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="1234"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {pwdError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-xs">
                  {pwdError}
                </div>
              )}

              {pwdSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-xs flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md transition-all flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Password & PIN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Photo Change Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in-95 duration-200 my-8">
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-700">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Change Profile Photo</h2>
                <p className="text-xs text-slate-500">
                  Update photo for <strong className="text-slate-700">{patient.fullName}</strong> ({patient.dnaId})
                </p>
              </div>
            </div>

            {/* Photo Preview Card */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="relative">
                <img
                  src={tempAvatarUrl || patient.avatarUrl}
                  alt="Preview"
                  className="w-28 h-28 rounded-3xl object-cover ring-4 ring-cyan-500/30 shadow-lg border-2 border-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300";
                  }}
                />
                <div className="absolute -bottom-2 right-0 bg-cyan-600 text-white p-1.5 rounded-xl shadow border-2 border-white">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">Live Avatar Preview</span>
            </div>

            {/* Option 1: File Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Option 1: Upload Image File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-cyan-300 hover:border-cyan-500 bg-cyan-50/50 hover:bg-cyan-50 text-cyan-800 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-cyan-600" />
                <span>Upload From Your Computer / Device</span>
              </button>
            </div>

            {/* Option 2: Custom URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Option 2: Paste Image URL</label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={tempAvatarUrl}
                  onChange={(e) => setTempAvatarUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Option 3: Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Option 3: Choose Preset Medical Avatar</label>
              <div className="grid grid-cols-5 gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTempAvatarUrl(url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      tempAvatarUrl === url
                        ? "border-cyan-500 ring-2 ring-cyan-500/40 scale-105"
                        : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPhoto}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 relative animate-in fade-in zoom-in-95 duration-150 my-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                Log Out of Patient Profile?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                You are currently logged into <strong>{patient.fullName}</strong>'s medical vault ({patient.dnaId}).
                Logging out will lock confidential medical records.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left flex items-center space-x-3">
              <img
                src={patient.avatarUrl}
                alt={patient.fullName}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-rose-200"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">{patient.fullName}</p>
                <p className="text-[10px] font-mono text-slate-500 truncate">{patient.dnaId}</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  if (onLogout) onLogout();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Yes, Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
