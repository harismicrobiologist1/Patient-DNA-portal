import React, { useState, useEffect } from "react";
import { GeneticMarker } from "../types";
import {
  Globe,
  Dna,
  Watch,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Activity,
  Heart,
  Zap,
  Download,
  Share2,
} from "lucide-react";

interface FutureModulesViewProps {
  markers: GeneticMarker[];
}

export const FutureModulesView: React.FC<FutureModulesViewProps> = ({ markers }) => {
  const [activeSubTab, setActiveSubTab] = useState<"genetics" | "wearables" | "passport" | "research">("genetics");

  // Live Smartwatch simulation
  const [liveBpm, setLiveBpm] = useState(72);
  const [liveSpO2, setLiveSpO2] = useState(99);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBpm(70 + Math.floor(Math.random() * 6));
      setLiveSpO2(98 + (Math.random() > 0.5 ? 1 : 0));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
                FUTURE HEALTH LABS
              </span>
              <span className="text-xs text-slate-400">Next-Gen Medical Identity</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              INNOVATION & GENOMIC MODULES
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "genetics", label: "Genetics & DNA" },
              { id: "wearables", label: "Smartwatch Live Sync" },
              { id: "passport", label: "Global Health Passport" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeSubTab === tab.id
                    ? "bg-purple-500 text-slate-950 shadow-md"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Genetics & DNA Sub-Tab */}
      {activeSubTab === "genetics" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Dna className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pharmacogenomic & Inherited DNA Markers</h2>
              <p className="text-xs text-slate-500">
                Precision medicine profiling for drug metabolism and genetic risk evaluation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(markers || []).map((marker, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-purple-700 text-base">{marker.gene}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      marker.riskCategory === "Elevated"
                        ? "bg-amber-100 text-amber-800"
                        : marker.riskCategory === "Protected"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {marker.riskCategory}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900">{marker.trait}</p>
                  <p className="text-xs text-slate-500 font-mono">Variant: {marker.variant}</p>
                </div>

                <p className="text-xs text-slate-700 pt-2 border-t border-slate-200/60">
                  {marker.clinicalSignificance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wearables Live Sync Sub-Tab */}
      {activeSubTab === "wearables" && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <Watch className="w-6 h-6 text-cyan-400 animate-pulse" />
              <div>
                <h2 className="text-lg font-bold text-white">LIVE WEARABLE TELEMETRY STREAM</h2>
                <p className="text-xs text-slate-400">Apple Watch / Fitbit Live Vitals Bridge</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE SENSOR SYNC</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 text-center space-y-2">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500 mx-auto animate-pulse" />
              <span className="text-xs text-slate-400 font-bold uppercase block">Heart Rate</span>
              <p className="text-3xl font-black font-mono text-white">{liveBpm} <span className="text-xs text-slate-400 font-normal">BPM</span></p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 text-center space-y-2">
              <Activity className="w-8 h-8 text-cyan-400 mx-auto" />
              <span className="text-xs text-slate-400 font-bold uppercase block">SpO2 Oxygen</span>
              <p className="text-3xl font-black font-mono text-white">{liveSpO2} <span className="text-xs text-slate-400 font-normal">%</span></p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 text-center space-y-2">
              <Zap className="w-8 h-8 text-emerald-400 mx-auto" />
              <span className="text-xs text-slate-400 font-bold uppercase block">ECG Rhythm</span>
              <p className="text-lg font-bold text-emerald-400">Sinus Rhythm (Normal)</p>
            </div>
          </div>
        </div>
      )}

      {/* Global Health Passport Sub-Tab */}
      {activeSubTab === "passport" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <Globe className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">GLOBAL HEALTH PASSPORT EXPORT</h2>
              <p className="text-xs text-slate-500">
                WHO & ICAO compliant border health clearance document
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                INTERNATIONAL MEDICAL PASSPORT
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                VERIFIED BORDER CLEARANCE
              </span>
            </div>

            <div className="text-xs space-y-1">
              <p className="text-slate-300">Holder: <strong className="text-white">Alex R. Mercer</strong></p>
              <p className="text-slate-300">Universal ID: <strong className="text-cyan-300 font-mono">DNA-8924-9012</strong></p>
              <p className="text-slate-300">Vaccination Clearance: <strong className="text-emerald-300">Comirnaty mRNA Booster Active</strong></p>
            </div>

            <button
              onClick={() => alert("Global Health Passport exported as digitally signed PDF!")}
              className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Health Passport PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
