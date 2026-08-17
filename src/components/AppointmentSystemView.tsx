import React, { useState } from "react";
import { Appointment, DoctorProfile } from "../types";
import {
  Calendar as CalendarIcon,
  Clock,
  Building,
  UserCheck,
  Ticket,
  Plus,
  CheckCircle2,
  MapPin,
  Sparkles,
  Edit2,
  Trash2,
  X,
  Search,
} from "lucide-react";

interface AppointmentSystemViewProps {
  appointments: Appointment[];
  doctors: DoctorProfile[];
  onBookAppointment: (appointment: Appointment) => void;
  onUpdateAppointments?: (appointments: Appointment[]) => void;
}

export const AppointmentSystemView: React.FC<AppointmentSystemViewProps> = ({
  appointments,
  doctors,
  onBookAppointment,
  onUpdateAppointments,
}) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Booking / Edit Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState("Apex National University Medical Center");
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState("2026-08-25");
  const [selectedTime, setSelectedTime] = useState("11:00 AM");
  const [selectedStatus, setSelectedStatus] = useState<Appointment["status"]>("Confirmed");
  const [symptomsNote, setSymptomsNote] = useState("");

  const selectedDoctorObj = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  const filteredAppointments = appointments.filter((apt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      apt.doctor.toLowerCase().includes(q) ||
      apt.hospital.toLowerCase().includes(q) ||
      apt.department.toLowerCase().includes(q) ||
      apt.status.toLowerCase().includes(q) ||
      (apt.symptomsNote && apt.symptomsNote.toLowerCase().includes(q))
    );
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setSelectedHospital("Apex National University Medical Center");
    setSelectedDoctorId(doctors[0]?.id || "");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedTime("11:00 AM");
    setSelectedStatus("Confirmed");
    setSymptomsNote("");
    setShowBookingForm(true);
  };

  const handleOpenEdit = (apt: Appointment) => {
    setEditingId(apt.id);
    setSelectedHospital(apt.hospital);
    const matchedDoc = doctors.find((d) => d.name === apt.doctor);
    if (matchedDoc) setSelectedDoctorId(matchedDoc.id);
    setSelectedDate(apt.date);
    setSelectedTime(apt.time);
    setSelectedStatus(apt.status);
    setSymptomsNote(apt.symptomsNote || "");
    setShowBookingForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to cancel and delete this appointment?")) {
      const updated = appointments.filter((a) => a.id !== id);
      if (onUpdateAppointments) {
        onUpdateAppointments(updated);
      }
    }
  };

  const handleStatusChange = (id: string, newStatus: Appointment["status"]) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    if (onUpdateAppointments) {
      onUpdateAppointments(updated);
    }
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const updatedList = appointments.map((apt) => {
        if (apt.id === editingId) {
          return {
            ...apt,
            hospital: selectedHospital,
            doctor: selectedDoctorObj.name,
            department: selectedDoctorObj.specialty,
            date: selectedDate,
            time: selectedTime,
            status: selectedStatus,
            symptomsNote,
          };
        }
        return apt;
      });
      if (onUpdateAppointments) {
        onUpdateAppointments(updatedList);
      }
    } else {
      const queueNum = appointments.length + 5;
      const newApt: Appointment = {
        id: `apt-${Date.now()}`,
        hospital: selectedHospital,
        doctor: selectedDoctorObj.name,
        department: selectedDoctorObj.specialty,
        date: selectedDate,
        time: selectedTime,
        queueNumber: queueNum,
        status: selectedStatus,
        tokenCode: `${selectedDoctorObj.specialty.substring(0, 4).toUpperCase()}-Q-00${queueNum}`,
        symptomsNote,
      };

      if (onUpdateAppointments) {
        onUpdateAppointments([newApt, ...appointments]);
      } else {
        onBookAppointment(newApt);
      }
    }

    setShowBookingForm(false);
    setSymptomsNote("");
    setEditingId(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
            <CalendarIcon className="w-7 h-7 text-indigo-600" />
            <span>APPOINTMENT & QUEUE SYSTEM</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Book consultations • Real-time live queue tokens • Department routing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-44 sm:w-56"
            />
          </div>

          <button
            onClick={handleOpenNew}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </button>
        </div>
      </div>

      {/* Booking / Edit Form Card */}
      {showBookingForm && (
        <form
          onSubmit={handleSaveBooking}
          className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-100 shadow-xl space-y-6 animate-fadeIn relative"
        >
          <button
            type="button"
            onClick={() => setShowBookingForm(false)}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            {editingId ? "Edit Scheduled Appointment" : "Schedule Specialist Consultation"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Medical Center</label>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="Apex National University Medical Center">
                  Apex National University Medical Center
                </option>
                <option value="Saint Jude Memorial Hospital">Saint Jude Memorial Hospital</option>
                <option value="City Care Specialty Clinic">City Care Specialty Clinic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Doctor & Specialty</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Appointment Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Preferred Time Slot</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:45 AM">11:45 AM</option>
                <option value="02:15 PM">02:15 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Appointment Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-2">Chief Symptoms or Notes</label>
              <input
                type="text"
                placeholder="e.g. Follow-up consultation"
                value={symptomsNote}
                onChange={(e) => setSymptomsNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowBookingForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
            >
              {editingId ? "Update Appointment" : "Confirm Appointment & Generate Token"}
            </button>
          </div>
        </form>
      )}

      {/* Appointments List & Tokens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAppointments.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-200/80 text-slate-500 space-y-3">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No appointments found</p>
            <p className="text-xs">Click "Book New Appointment" to schedule a consultation.</p>
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value as any)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border outline-none cursor-pointer ${
                        apt.status === "Confirmed"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : apt.status === "In-Progress"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : apt.status === "Completed"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-rose-100 text-rose-800 border-rose-300"
                      }`}
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="In-Progress">In-Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => handleOpenEdit(apt)}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      title="Edit Appointment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(apt.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Delete / Cancel Appointment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2">{apt.doctor}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{apt.department}</p>
                </div>

                {/* Queue Token Badge */}
                <div className="p-3 rounded-2xl bg-indigo-950 text-white text-center shadow-lg border border-indigo-800 min-w-[100px]">
                  <span className="text-[9px] uppercase tracking-wider text-indigo-300 block font-bold">
                    Queue Token
                  </span>
                  <span className="text-sm font-black font-mono text-cyan-300 block mt-0.5">
                    #{apt.queueNumber}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    {apt.tokenCode}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <p className="flex items-center space-x-2">
                  <Building className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{apt.hospital}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {apt.date} at <strong>{apt.time}</strong>
                  </span>
                </p>
                {apt.symptomsNote && (
                  <p className="text-slate-500 italic mt-1">Note: "{apt.symptomsNote}"</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
