import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// In-memory / File-backed Database Store
const DATA_FILE_PATH = path.join(__dirname, "patients_database_store.json");

// In-memory active OTP codes store: key = `${doctorName}-${patientDnaId}`
interface OtpEntry {
  code: string;
  patientDnaId: string;
  patientName: string;
  doctorName: string;
  expiresAt: number;
  maskedEmail: string;
  maskedPhone: string;
}
const activeOtps = new Map<string, OtpEntry>();

// Lazy init Gemini AI instance
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ----------------------------------------------------
// Lifetime Database Persistence Endpoints
// ----------------------------------------------------
app.get("/api/database/load", (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const dataStr = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(dataStr);
      return res.json({ success: true, database: parsed.database, auditLogs: parsed.auditLogs || [] });
    }
    return res.json({ success: true, database: null, auditLogs: null });
  } catch (err: any) {
    console.error("Error reading database store:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/database/save", (req, res) => {
  try {
    const { database, auditLogs } = req.body;
    if (!database) {
      return res.status(400).json({ success: false, error: "Database payload missing" });
    }
    fs.writeFileSync(
      DATA_FILE_PATH,
      JSON.stringify({ database, auditLogs, updatedAt: new Date().toISOString() }, null, 2),
      "utf-8"
    );
    return res.json({ success: true, message: "Database permanently saved to lifetime disk storage" });
  } catch (err: any) {
    console.error("Error writing database store:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// Doctor Patient OTP Consent Endpoints
// ----------------------------------------------------
app.post("/api/auth/request-doctor-otp", (req, res) => {
  try {
    const { patientDnaId, patientName, patientEmail, patientPhone, doctorName, department, hospital } = req.body;

    if (!patientDnaId) {
      return res.status(400).json({ success: false, error: "patientDnaId is required" });
    }

    // Generate random 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Mask contact for privacy
    const email = patientEmail || "patient@healthdna.org";
    const phone = patientPhone || "+1 (555) 019-0000";

    const parts = email.split("@");
    const namePart = parts[0] || "patient";
    const maskedEmail = `${namePart.substring(0, 2)}***${namePart.substring(namePart.length - 1)}@${parts[1] || "healthdna.org"}`;
    const maskedPhone = phone.replace(/(\d{3})\d{4}(\d{2})/, "$1****$2");

    const key = `${doctorName || "Dr. Marcus Vance"}-${patientDnaId}`;
    const otpEntry: OtpEntry = {
      code: generatedOtp,
      patientDnaId,
      patientName: patientName || "Patient",
      doctorName: doctorName || "Dr. Marcus Vance",
      expiresAt,
      maskedEmail,
      maskedPhone,
    };
    activeOtps.set(key, otpEntry);

    return res.json({
      success: true,
      otpCode: generatedOtp, // returned for demonstration & client simulation notification
      expiresAt,
      maskedEmail,
      maskedPhone,
      message: `OTP securely dispatched to ${maskedEmail} and ${maskedPhone}`,
    });
  } catch (err: any) {
    console.error("Error requesting doctor OTP:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/verify-doctor-otp", (req, res) => {
  try {
    const { patientDnaId, doctorName, otpCode } = req.body;
    const key = `${doctorName || "Dr. Marcus Vance"}-${patientDnaId}`;
    const entry = activeOtps.get(key);

    if (!entry) {
      return res.status(400).json({ success: false, error: "No active OTP request found for this patient. Please request a new OTP." });
    }

    if (Date.now() > entry.expiresAt) {
      activeOtps.delete(key);
      return res.status(400).json({ success: false, error: "OTP has expired. Please generate a new one." });
    }

    if (entry.code !== String(otpCode).trim()) {
      return res.status(400).json({ success: false, error: "Invalid OTP code entered. Please verify with patient." });
    }

    // Success! Consume OTP
    activeOtps.delete(key);

    const token = `AUTH-DR-CONSENT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return res.json({
      success: true,
      verified: true,
      sessionToken: token,
      expiresInMinutes: 60,
      message: "Patient consent successfully verified via OTP.",
    });
  } catch (err: any) {
    console.error("Error verifying doctor OTP:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// AI API Routes
app.post("/api/ai/symptom-analysis", async (req, res) => {
  try {
    const { symptoms, age, gender, medicalHistory, vitals } = req.body;
    const ai = getGeminiAI();

    const prompt = `You are an expert AI Clinical Diagnostic Assistant for the "Patient DNA" Universal Health System.
Analyze the following patient parameters:
- Primary Symptoms: ${symptoms || "Not provided"}
- Patient Age: ${age || "Unknown"}
- Gender: ${gender || "Unknown"}
- Existing Medical History: ${JSON.stringify(medicalHistory || [])}
- Current Vitals: ${JSON.stringify(vitals || {})}

Provide a comprehensive clinical analysis in JSON format with the following keys:
- summary: brief summary of findings (string)
- possibleConditions: array of objects { condition: string, probability: "High" | "Moderate" | "Low", reasoning: string, urgencyLevel: "Emergency" | "Urgent" | "Routine" }
- recommendedTests: array of strings (suggested lab tests / diagnostic imaging)
- redFlags: array of strings (warning signs requiring immediate emergency room visit)
- clinicalAdvice: array of strings (immediate non-prescriptive supportive measures)

Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Symptom analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze symptoms",
      details: error.message || String(error),
    });
  }
});

app.post("/api/ai/drug-interaction", async (req, res) => {
  try {
    const { medicines } = req.body; // array of strings or objects { name, dosage }
    const ai = getGeminiAI();

    const prompt = `You are a Senior Clinical Pharmacologist AI for "Patient DNA".
Analyze interactions between these medicines:
${JSON.stringify(medicines)}

Provide detailed analysis in JSON format with keys:
- overallRiskLevel: "High" | "Moderate" | "Low" | "Safe"
- summary: string summary of overall drug safety profile
- interactions: array of objects { severity: "Severe" | "Moderate" | "Minor", drugA: string, drugB: string, mechanism: string, clinicalEffect: string, recommendation: string }
- foodContraindications: array of strings (foods/beverages to avoid, e.g. Grapefruit Juice, Alcohol, Dairy)
- monitoringAdvice: array of strings (lab values or physical symptoms to monitor)

Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Drug interaction error:", error);
    res.status(500).json({
      error: "Failed to check drug interactions",
      details: error.message || String(error),
    });
  }
});

app.post("/api/ai/disease-prediction", async (req, res) => {
  try {
    const { patientProfile, medicalHistory, labResults, lifestyle } = req.body;
    const ai = getGeminiAI();

    const prompt = `You are an AI Health Risk Prediction Engine for "Patient DNA".
Evaluate health risks based on patient data:
Profile: ${JSON.stringify(patientProfile || {})}
Medical History: ${JSON.stringify(medicalHistory || [])}
Lab Results: ${JSON.stringify(labResults || [])}
Lifestyle: ${JSON.stringify(lifestyle || {})}

Provide disease risk prediction in JSON with keys:
- healthScore: number (0 to 100, where 100 is optimal health)
- riskFactors: array of objects { category: "Cardiovascular" | "Metabolic" | "Respiratory" | "Genetics" | "Renal", scorePercent: number (0-100), riskLevel: "High" | "Moderate" | "Low", keyInsights: string }
- preventiveActions: array of objects { title: string, description: string, priority: "High" | "Medium" | "Low" }
- dnaGeneticInsights: string summary of genetic & inherited predispositions based on family history

Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Disease prediction error:", error);
    res.status(500).json({
      error: "Failed to predict disease risk",
      details: error.message || String(error),
    });
  }
});

app.post("/api/ai/medication-analysis", async (req, res) => {
  try {
    const { medicineName, proposedDose, duration, patientProfile, medicalHistory, prescriptions, clinicalRecords, labReports } = req.body;
    const ai = getGeminiAI();

    const prompt = `You are a Chief Clinical Pharmacologist and Antimicrobial Stewardship AI for "Patient DNA".
The user is searching/evaluating a medication: "${medicineName}" (Proposed Dosage: "${proposedDose || 'Standard'}", Duration: "${duration || 'Standard'}").

Analyze this medication against the patient's complete longitudinal medical history:
- Patient Profile: ${JSON.stringify(patientProfile || {})}
- Known Diseases & Allergies: ${JSON.stringify(medicalHistory || {})}
- Past & Current Prescriptions: ${JSON.stringify(prescriptions || [])}
- Past Clinical Encounter Records & Treatments: ${JSON.stringify(clinicalRecords || [])}
- Diagnostic Lab & Imaging Reports: ${JSON.stringify(labReports || [])}

Perform an in-depth analysis focusing specifically on:
1. Drug-Drug and Drug-Disease Interactions.
2. Drug Resistance & Tolerance Risk (evaluating prior antibiotic/medication exposure, frequent or previous high-dose usage, cross-resistance).
3. Efficacy & Dose Effectiveness (analyzing if previous high doses reduce efficacy, tolerance buildup, recommended dosage adjustment, and clearance).
4. Safer Alternatives if high risk or resistance is detected.

Respond in JSON format with the following structure:
{
  "medicationName": "${medicineName}",
  "overallSuitabilityScore": number (0-100 score, where 100 is completely safe and effective),
  "riskRating": "Low Risk" | "Moderate Risk" | "High Risk / Caution" | "Contraindicated",
  "pharmacologicalSummary": string (clear clinical synthesis of the findings),
  "drugInteractions": [
    {
      "target": string (e.g. "Interaction with Amoxicillin" or "Contraindication with Chronic Kidney Disease"),
      "severity": "Severe" | "Moderate" | "Minor",
      "mechanism": string,
      "clinicalEffect": string,
      "recommendation": string
    }
  ],
  "resistanceAndTolerance": {
    "resistanceRiskLevel": "High" | "Moderate" | "Low" | "Minimal",
    "priorExposureAnalysis": string (detailed analysis of how past prescription history, previous high doses, or repeated courses affect resistance or receptor sensitivity),
    "crossResistanceWarnings": [string]
  },
  "doseEfficacyAndAdjustment": {
    "estimatedEfficacy": string (e.g. "90% Effective" or "Reduced Efficacy (60%) due to previous high-dose exposure"),
    "doseAdjustmentAdvice": string (specific recommended dosage modification or caution),
    "metabolismAndClearance": string (organ clearance considerations based on patient's renal/hepatic history)
  },
  "monitoringParameters": [string] (lab/vital parameters to monitor during treatment),
  "saferAlternatives": [string] (alternative drug options if risk/resistance is high)
}

Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.15,
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Medication analysis error:", error);
    res.status(500).json({
      error: "Failed to perform medication analysis",
      details: error.message || String(error),
    });
  }
});

app.post("/api/ai/clinical-suggestions", async (req, res) => {
  try {
    const { doctorNotes, chiefComplaint, currentDiagnosis, patientRecord } = req.body;
    const ai = getGeminiAI();

    const prompt = `You are a Clinical Decision Support AI assisting a Doctor in the "Patient DNA" system.
Context:
- Chief Complaint: ${chiefComplaint || "N/A"}
- Doctor's Notes: ${doctorNotes || "N/A"}
- Working Diagnosis: ${currentDiagnosis || "N/A"}
- Patient Summary: ${JSON.stringify(patientRecord || {})}

Provide clinical suggestions in JSON format with keys:
- differentialDiagnoses: array of strings
- suggestedMedications: array of objects { medicine: string, standardDosage: string, route: string, duration: string, rationale: string }
- followUpTimeline: string
- recommendedWorkup: array of strings
- keyWarnings: array of strings

Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Clinical suggestions error:", error);
    res.status(500).json({
      error: "Failed to generate clinical suggestions",
      details: error.message || String(error),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Patient DNA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
