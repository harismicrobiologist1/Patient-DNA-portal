import React, { useEffect, useState } from "react";
import { Clock, ShieldAlert, Lock, RefreshCw, AlertTriangle, User } from "lucide-react";

interface SessionInactivityModalProps {
  isOpen: boolean;
  secondsRemaining: number;
  onExtendSession: () => void;
  onLockNow: () => void;
  patientName?: string;
  totalTimeoutMinutes: number;
}

export const SessionInactivityModal: React.FC<SessionInactivityModalProps> = ({
  isOpen,
  secondsRemaining,
  onExtendSession,
  onLockNow,
  patientName,
  totalTimeoutMinutes,
}) => {
  const [pulseWarning, setPulseWarning] = useState(false);

  useEffect(() => {
    if (isOpen && secondsRemaining <= 10) {
      setPulseWarning(true);
    } else {
      setPulseWarning(false);
    }
  }, [isOpen, secondsRemaining]);

  if (!isOpen) return null;

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / 30) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 my-auto">
        {/* Top Visual Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-10 text-white pointer-events-none">
            <Lock className="w-32 h-32" />
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-2">
            <div
              className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-lg transition-transform ${
                pulseWarning ? "animate-bounce scale-110" : "animate-pulse"
              }`}
            >
              <Clock className="w-7 h-7" />
            </div>

            <span className="px-3 py-0.5 rounded-full bg-white/25 text-white font-mono text-[10px] font-bold tracking-wider uppercase border border-white/30">
              HIPAA INACTIVITY TIMEOUT
            </span>

            <h3 className="text-xl font-black tracking-tight text-white">
              Are you still there?
            </h3>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold text-slate-800">
              Session auto-lock in progress for{" "}
              <strong className="text-slate-950 font-bold">
                {patientName || "Current Patient"}
              </strong>
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              To protect sensitive health records and comply with clinical privacy standards, your session will automatically lock after {totalTimeoutMinutes} minutes of inactivity.
            </p>
          </div>

          {/* Countdown Display Card */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-mono font-black text-xl border border-amber-300">
                {secondsRemaining}s
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-amber-900 block">
                  Automatic Lock Countdown
                </span>
                <span className="text-[11px] text-amber-700">
                  Click below to keep your active vault open
                </span>
              </div>
            </div>

            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-1000 ${
                  secondsRemaining <= 10 ? "bg-rose-500" : "bg-amber-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Warning Active</span>
              <span>Auto-Lock at 0s</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onExtendSession}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <RefreshCw className="w-4 h-4 text-cyan-200" />
              <span>Stay Logged In</span>
            </button>

            <button
              onClick={onLockNow}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Lock Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
