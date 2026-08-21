import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserCheck,
  Globe,
  ExternalLink,
  Award,
  FlaskConical,
  Mail,
  Edit3,
  Check,
  X,
  Sparkles,
  Code2,
  HeartPulse,
  Pill,
} from "lucide-react";

interface CreatorPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PORTFOLIO_STORAGE_KEY = "patient_dna_creator_portfolio_url";

export function CreatorPortfolioModal({ isOpen, onClose }: CreatorPortfolioModalProps) {
  const [portfolioUrl, setPortfolioUrl] = useState<string>(() => {
    return localStorage.getItem(PORTFOLIO_STORAGE_KEY) || "https://patient-dna-por.vercel.app";
  });
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(portfolioUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (saved) {
        setPortfolioUrl(saved);
        setTempUrl(saved);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    let clean = tempUrl.trim();
    if (clean && !clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = "https://" + clean;
    }
    setPortfolioUrl(clean);
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, clean);
    setIsEditingUrl(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portfolioUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 p-6 sm:p-8">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Public Health Tech Project</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Project Creator & Ownership
            </h2>
          </div>
        </div>

        {/* Creator Info Card */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Haris Amin</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Lead Pharmacist & Health Architect
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Pharmacist & Clinical Health Informatics Innovator
              </p>
            </div>
            <div className="p-2 rounded-xl bg-slate-700/50 text-slate-300">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Architect & Author of the <strong>Patient DNA</strong> Universal Lifetime Healthcare Platform. 
            Built to deliver universal patient identity, emergency medical passports, AI clinical diagnostics, 
            pharmacological drug-drug interaction safety, and antimicrobial stewardship.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="truncate">harismicrobiologist1@gmail.com</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
              <HeartPulse className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Clinical Pharmacy & Informatics</span>
            </div>
          </div>
        </div>

        {/* Portfolio Link Manager */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Portfolio / Personal Website URL</span>
            </label>
            <button
              onClick={() => setIsEditingUrl(!isEditingUrl)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingUrl ? "Cancel" : "Edit Link"}</span>
            </button>
          </div>

          {isEditingUrl ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://yourportfolio.com or github.com/username"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-blue-500/50 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSaveUrl}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <a
                href={portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-blue-400 hover:underline truncate mr-2 flex items-center space-x-1"
              >
                <span className="truncate">{portfolioUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 hover:text-white shrink-0"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>

        {/* SEO & Public Verification Footer Note */}
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Google Search & Knowledge Graph Indexed:</strong> Structured Schema.org metadata has been declared for this application and its author. Google and web crawlers recognize <strong>Haris Amin (Pharmacist)</strong> as the creator and owner of this verified healthcare portal.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
