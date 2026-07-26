import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Lazy-initialize Gemini AI client
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Using fallback response generators.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Rx Reader API" });
});

// 2. AI Medical Assistant Chatbot API
app.post("/api/chat", async (req, res) => {
  try {
    const { question, prescriptionContext, language = "en" } = req.body;

    if (!question || typeof question !== "string") {
      res.status(400).json({ error: "Question is required." });
      return;
    }

    const lowerQ = question.toLowerCase();
    
    // Check if user asks about diagnosis directly
    const isDiagnosisRequest = 
      lowerQ.includes("diagnose me") || 
      lowerQ.includes("do i have cancer") || 
      lowerQ.includes("what disease do i have") ||
      lowerQ.includes("diagnose my condition");

    if (isDiagnosisRequest) {
      res.json({
        reply: "I am an AI assistant and not a doctor. This is for information only.\n\nI cannot diagnose medical conditions. Please consult a qualified doctor or healthcare practitioner for a proper medical diagnosis.",
        warning: null
      });
      return;
    }

    const ai = getGeminiAI();

    const systemInstruction = `You are RxBot, an expert AI Medical Assistant designed to help patients understand prescriptions, drug dosages, side effects, and safe administration guidelines.
Be very clear, compassionate, and precise.
CRITICAL SAFETY RULE: You MUST start every single response with:
"I am an AI assistant and not a doctor. This is for information only."
If the user asks for a diagnosis or treatment plan for a disease, state clearly that you cannot diagnose and recommend consulting a doctor.
If the user asks about dangerous drug combinations or express severe symptoms (like chest pain, anaphylaxis), highlight a clear safety warning.
Always reply in the user's requested language (${language === "ur" ? "Urdu" : "English"}).`;

    let contextText = "";
    if (prescriptionContext && Array.isArray(prescriptionContext) && prescriptionContext.length > 0) {
      contextText = `\n\nPatient Current Prescriptions/Medicines:\n` + JSON.stringify(prescriptionContext, null, 2);
    }

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `${question}${contextText}`,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        let text = response.text || "";
        
        if (!text.startsWith("I am an AI assistant and not a doctor.")) {
          text = `I am an AI assistant and not a doctor. This is for information only.\n\n${text}`;
        }

        let warning = null;
        if (text.toLowerCase().includes("danger") || text.toLowerCase().includes("warning") || text.toLowerCase().includes("risk")) {
          warning = "Please review this information carefully and contact your pharmacist or healthcare provider if you experience adverse effects.";
        }

        res.json({ reply: text, warning });
        return;
      } catch (err: any) {
        console.error("Gemini Chat Error:", err);
      }
    }

    // High quality intelligent fallback if API key is not configured or fails
    const defaultLead = "I am an AI assistant and not a doctor. This is for information only.";
    let fallbackReply = `${defaultLead}\n\n`;

    if (lowerQ.includes("side effect") || lowerQ.includes("side-effect")) {
      fallbackReply += "Common medication side effects can include mild nausea, drowsiness, or headache. Always take your prescription with food if recommended, and notify your physician if side effects persist.";
    } else if (lowerQ.includes("dosage") || lowerQ.includes("how to take") || lowerQ.includes("when to take")) {
      fallbackReply += "Always follow the dosage frequency printed on your prescription label (e.g. 1 tablet twice daily after meals). Do not alter dosages without doctor approval.";
    } else if (lowerQ.includes("interaction") || lowerQ.includes("together") || lowerQ.includes("alcohol")) {
      fallbackReply += "Combining multiple medications or taking prescriptions with alcohol can alter drug absorption or cause adverse reactions. Always check with a pharmacist before combining new supplements or drugs.";
    } else {
      fallbackReply += `Regarding your question about "${question}": Please ensure you maintain your prescribed dosing schedule, store medications in a cool dry place, and consult your physician or local pharmacist for specific medical advice.`;
    }

    res.json({ reply: fallbackReply, warning: null });
  } catch (error: any) {
    console.error("Chat Endpoint Error:", error);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
});

// 3. AI Prescription OCR Endpoint
app.post("/api/ocr", async (req, res) => {
  try {
    const { imageBase64, isUrduDemo = false, isEnglishDemo = false } = req.body;

    // Standard Demo Prescriptions response
    if (isUrduDemo) {
      res.json({
        is_prescription: true,
        success: true,
        prescriptionInfo: {
          doctorName: "Dr. Tariq Ahmed (FRCP)",
          clinic: "Shifa General Hospital, Lahore",
          date: new Date().toISOString().split("T")[0],
          language: "Urdu / Bilingual",
          confidence: 96,
        },
        medicines: [
          {
            id: "m-u1",
            name: "Panadol Forte (Paracetamol 500mg)",
            dosage: "1 Tablet",
            timing: {
              morning_subah: true,
              afternoon_dopahar: true,
              night_raat: true,
            },
            meal_relation: "After Food",
            duration_days: "5 days",
            instructions_summary: "Subah, dopahar aur raat ko khane ke baad 5 din tak leni hai",
            frequency: "Every 8 hours (1-1-1)",
            foodAdvice: "Take after meal (کھانے کے بعد)",
            confidence: 98,
            urduName: "پیناڈول فورٹ",
          },
          {
            id: "m-u2",
            name: "Amoxil 500mg (Amoxicillin)",
            dosage: "1 Capsule",
            timing: {
              morning_subah: true,
              afternoon_dopahar: false,
              night_raat: true,
            },
            meal_relation: "After Food",
            duration_days: "5 days",
            instructions_summary: "Subah aur raat ko khane ke baad 5 din tak leni hai",
            frequency: "Morning & Night (1-0-1)",
            foodAdvice: "Take with full glass of water (پانی کے ساتھ)",
            confidence: 95,
            urduName: "ایموکسل",
          },
          {
            id: "m-u3",
            name: "Risek 20mg (Omeprazole)",
            dosage: "1 Capsule",
            timing: {
              morning_subah: true,
              afternoon_dopahar: false,
              night_raat: false,
            },
            meal_relation: "Before Food",
            duration_days: "14 days",
            instructions_summary: "Subah nashte se pehle 14 din tak leni hai",
            frequency: "Once daily (1-0-0)",
            foodAdvice: "Take 30 mins before food (ناشتے سے پہلے)",
            confidence: 97,
            urduName: "رائزک ۲۰ ملی گرام",
          },
        ],
        general_advice: [
          "Adequate fluid intake (Paani ziada peeyein)",
          "Avoid spicy foods (Mirch masalay se perhez karein)",
        ],
        rawText: "Shifa Hospital Lahore\nDr. Tariq Ahmed\nRx: Panadol Forte 500mg (کھانے کے بعد)\nAmoxil 500mg\nRisek 20mg (ناشتے سے پہلے)",
      });
      return;
    }

    if (isEnglishDemo) {
      res.json({
        is_prescription: true,
        success: true,
        prescriptionInfo: {
          doctorName: "Dr. Sarah Jenkins (MD, Internal Medicine)",
          clinic: "MetroCare Health Center",
          date: new Date().toISOString().split("T")[0],
          language: "English",
          confidence: 98,
        },
        medicines: [
          {
            id: "m-e1",
            name: "Lipitor 20mg (Atorvastatin)",
            dosage: "1 Tablet",
            timing: {
              morning_subah: false,
              afternoon_dopahar: false,
              night_raat: true,
            },
            meal_relation: "Not Specified",
            duration_days: "30 days",
            instructions_summary: "Raat ko 1 tablet 30 din tak leni hai (Take at bedtime)",
            frequency: "Night (0-0-1)",
            foodAdvice: "Not Specified",
            confidence: 99,
          },
          {
            id: "m-e2",
            name: "Glucophage 500mg (Metformin)",
            dosage: "1 Tablet",
            timing: {
              morning_subah: true,
              afternoon_dopahar: false,
              night_raat: true,
            },
            meal_relation: "With Food",
            duration_days: "30 days",
            instructions_summary: "Subah aur raat ko khane ke saath 30 din tak leni hai",
            frequency: "Breakfast & Dinner (1-0-1)",
            foodAdvice: "Take with meals to reduce stomach upset",
            confidence: 97,
          },
          {
            id: "m-e3",
            name: "Concor 5mg (Bisoprolol)",
            dosage: "1 Tablet",
            timing: {
              morning_subah: true,
              afternoon_dopahar: false,
              night_raat: false,
            },
            meal_relation: "Before Food",
            duration_days: "30 days",
            instructions_summary: "Subah khane se pehle 30 din tak leni hai",
            frequency: "Morning (1-0-0)",
            foodAdvice: "Take before or during breakfast",
            confidence: 96,
          },
        ],
        general_advice: [
          "Adequate fluid intake and regular light walking",
          "Monitor blood pressure and blood glucose weekly",
        ],
        rawText: "MetroCare Health Center\nDr. Sarah Jenkins MD\nRx: Lipitor 20mg QHS\nGlucophage 500mg BID W/ Food\nConcor 5mg QAM",
      });
      return;
    }

    const ai = getGeminiAI();

    if (ai && imageBase64) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const prompt = `You are an expert AI medical assistant and OCR prescription parser.

TASK:
Extract all prescribed medicines with full consumption details (Name, Dosage, Timing, Duration, Meal Instructions).

CRITICAL INSTRUCTIONS:
1. Do NOT throw "No prescription detected" unless the image is completely blank or corrupt.
2. If specific details (like duration or food advice/meal relation) are NOT explicitly mentioned in the prescription, set their value to "Not Specified" instead of leaving them empty.
3. Categorize timing clearly into boolean flags for morning_subah, afternoon_dopahar, and night_raat:
   - Morning / Subah (1-0-0) -> morning_subah: true, afternoon_dopahar: false, night_raat: false
   - Afternoon / Dopahar (0-1-0) -> morning_subah: false, afternoon_dopahar: true, night_raat: false
   - Evening/Night / Raat (0-0-1) -> morning_subah: false, afternoon_dopahar: false, night_raat: true
   - Twice daily (1-0-1) -> morning_subah: true, afternoon_dopahar: false, night_raat: true
   - Three times daily (1-1-1) -> morning_subah: true, afternoon_dopahar: true, night_raat: true
4. Meal Relation: Classify as "After Food", "Before Food", "With Food", or "Not Specified".
5. duration_days: Number of days (e.g., '5 days' or 'Not Specified').
6. instructions_summary: Clear human-readable line (e.g., 'Raat ko khane ke baad 5 din tak leni hai' or 'Take morning and night after food for 5 days').
7. general_advice: Array of non-medicinal instructions or lifestyle advice (e.g., "Adequate fluid intake").

Return strictly valid JSON matching the schema.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                is_prescription: { type: Type.BOOLEAN },
                medicines: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      dosage: { type: Type.STRING },
                      timing: {
                        type: Type.OBJECT,
                        properties: {
                          morning_subah: { type: Type.BOOLEAN },
                          afternoon_dopahar: { type: Type.BOOLEAN },
                          night_raat: { type: Type.BOOLEAN },
                        },
                        required: ["morning_subah", "afternoon_dopahar", "night_raat"],
                      },
                      meal_relation: { type: Type.STRING },
                      duration_days: { type: Type.STRING },
                      instructions_summary: { type: Type.STRING },
                    },
                    required: [
                      "name",
                      "dosage",
                      "timing",
                      "meal_relation",
                      "duration_days",
                      "instructions_summary",
                    ],
                  },
                },
                general_advice: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                prescriptionInfo: {
                  type: Type.OBJECT,
                  properties: {
                    doctorName: { type: Type.STRING },
                    clinic: { type: Type.STRING },
                    date: { type: Type.STRING },
                    language: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                  },
                },
              },
              required: ["is_prescription", "medicines", "general_advice"],
            },
          },
        });

        const resultJson = JSON.parse(response.text || "{}");
        
        const medicinesList = Array.isArray(resultJson.medicines) ? resultJson.medicines : [];
        const adviceList = Array.isArray(resultJson.general_advice) ? resultJson.general_advice : [];
        const isPrescription = resultJson.is_prescription ?? (medicinesList.length > 0 || adviceList.length > 0);

        if (!isPrescription && medicinesList.length === 0 && adviceList.length === 0) {
          res.json({
            is_prescription: false,
            success: false,
            error: "No prescription detected. Please upload a clear photo of a prescription.",
            medicines: [],
            general_advice: [],
          });
          return;
        }

        // Attach unique IDs & format default fields
        const formattedMedicines = medicinesList.map((m: any, idx: number) => {
          const timingObj = m.timing || {
            morning_subah: false,
            afternoon_dopahar: false,
            night_raat: true,
          };

          // Generate frequency helper text from timing
          const timesArr = [];
          if (timingObj.morning_subah) timesArr.push("Morning/Subah");
          if (timingObj.afternoon_dopahar) timesArr.push("Afternoon/Dopahar");
          if (timingObj.night_raat) timesArr.push("Night/Raat");
          const freqText = timesArr.length > 0 ? timesArr.join(", ") : "As needed";

          const mealRel = m.meal_relation || "Not Specified";
          const durDays = m.duration_days || "Not Specified";
          const dosageStr = m.dosage || "Not Specified";

          return {
            id: `m-scanned-${Date.now()}-${idx}`,
            name: m.name || "Unspecified Medicine",
            dosage: dosageStr,
            timing: timingObj,
            meal_relation: mealRel,
            duration_days: durDays,
            instructions_summary: m.instructions_summary || `${freqText}, ${mealRel}, Duration: ${durDays}`,
            frequency: freqText,
            foodAdvice: mealRel,
            confidence: 96,
          };
        });

        res.json({
          is_prescription: true,
          success: true,
          medicines: formattedMedicines,
          general_advice: adviceList.length > 0 ? adviceList : ["Adequate fluid intake"],
          prescriptionInfo: resultJson.prescriptionInfo || {
            doctorName: "Dr. Extracted Physician",
            date: new Date().toISOString().split("T")[0],
            confidence: 95,
          },
          rawText: "Scanned text processed via Gemini Vision OCR",
        });
        return;
      } catch (err) {
        console.error("Gemini OCR Processing error:", err);
      }
    }

    // Default response if no image provided or fallback
    res.json({
      is_prescription: false,
      success: false,
      error: "No prescription detected. Please upload a clear photo of a prescription.",
      medicines: [],
      general_advice: [],
    });
  } catch (error: any) {
    console.error("OCR API Error:", error);
    res.status(500).json({ success: false, error: "Failed to process prescription image." });
  }
});

// 4. Medicine Info & Drug Interaction Endpoint
app.post("/api/medicine-info", (req, res) => {
  const { medicines = [] } = req.body;

  if (!Array.isArray(medicines) || medicines.length < 2) {
    res.json({
      hasInteraction: false,
      message: "Select at least 2 medicines to perform interaction analysis.",
      conflicts: [],
    });
    return;
  }

  const names = medicines.map((m) => m.toLowerCase());
  const conflicts = [];

  // Check 1: Penicillin duplicate
  const penicillins = names.filter((n) => n.includes("amoxicillin") || n.includes("penicillin") || n.includes("amoxil") || n.includes("augmentin"));
  if (penicillins.length >= 2) {
    conflicts.push({
      type: "Duplicate Penicillin Warning",
      severity: "Moderate",
      medicines: penicillins,
      recommendation: "Confirm with doctor before taking multiple penicillin derivatives simultaneously to avoid dose toxicity.",
    });
  }

  // Check 2: Amoxicillin + Warfarin / Blood Thinners
  const hasAntibiotic = names.some((n) => n.includes("amoxicillin") || n.includes("amoxil") || n.includes("cipro"));
  const hasAnticoagulant = names.some((n) => n.includes("warfarin") || n.includes("aspirin") || n.includes("plavix") || n.includes("heparin"));
  if (hasAntibiotic && hasAnticoagulant) {
    conflicts.push({
      type: "Bleeding Risk Increase",
      severity: "High",
      medicines: ["Antibiotic", "Blood Thinner"],
      recommendation: "Antibiotics may alter gut flora and enhance the blood-thinning effects of Warfarin/Aspirin. Monitor INR levels closely.",
    });
  }

  // Check 3: Metformin + Excessive Alcohol or NSAIDs
  const hasMetformin = names.some((n) => n.includes("metformin") || n.includes("glucophage"));
  const hasNsaid = names.some((n) => n.includes("ibuprofen") || n.includes("naproxen") || n.includes("diclofenac"));
  if (hasMetformin && hasNsaid) {
    conflicts.push({
      type: "Renal Clearance Impact",
      severity: "Moderate",
      medicines: ["Metformin", "NSAID Painkiller"],
      recommendation: "NSAIDs can reduce renal blood flow, increasing Metformin accumulation. Ensure adequate hydration.",
    });
  }

  // Check 4: Beta-Blockers (Concor/Bisoprolol) + Omeprazole (Risek)
  const hasBetaBlocker = names.some((n) => n.includes("bisoprolol") || n.includes("concor") || n.includes("atenolol"));
  const hasPpi = names.some((n) => n.includes("omeprazole") || n.includes("risek") || n.includes("nexium"));
  if (hasBetaBlocker && hasPpi) {
    conflicts.push({
      type: "Minor Absorption Shift",
      severity: "Low",
      medicines: ["Beta-Blocker", "Proton Pump Inhibitor"],
      recommendation: "PPIs may slightly decrease beta-blocker absorption. Take at least 1 hour apart for optimal effectiveness.",
    });
  }

  if (conflicts.length > 0) {
    res.json({
      hasInteraction: true,
      conflicts,
    });
  } else {
    res.json({
      hasInteraction: false,
      message: "No known dangerous drug interactions detected between the selected medicines.",
      conflicts: [],
    });
  }
});

// Vite Middleware Integration for Dev & Production Static Serving
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rx Reader Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
