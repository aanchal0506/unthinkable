import { GoogleGenAI, Type } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";

const TIMEOUT_MS = 15_000;

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI | null => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return client;
};

type LLMResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface PreVisitSummary {
  urgency: "LOW" | "MEDIUM" | "HIGH";
  chiefComplaint: string;
  suggestedQuestions: string[];
};

const generatePreVisitSummary = async (
  symptoms: string
): Promise<LLMResult<PreVisitSummary>> => {
  const gemini = getClient();

  if (!gemini) {
    return {
      ok: false,
      error: "LLM is not configured (GEMINI_API_KEY missing)",
    };
  }

  const prompt = `
Analyse the following patient symptoms.

Symptoms:
${symptoms}

Generate:
1. An urgency level: LOW, MEDIUM, or HIGH
2. A short chief complaint
3. Exactly three useful questions the patient could ask the doctor.

Do not diagnose the patient.
Do not invent symptoms.
`;

  try {
    const response = await Promise.race([
      gemini.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              urgency: {
                type: Type.STRING,
                enum: ["LOW", "MEDIUM", "HIGH"],
              },
              chiefComplaint: {
                type: Type.STRING,
              },
              suggestedQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
            },
            required: [
              "urgency",
              "chiefComplaint",
              "suggestedQuestions",
            ],
          },
        },
      }),

      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Gemini request timed out")),
          TIMEOUT_MS
        )
      ),
    ]);

    if (!response.text) {
      throw new Error("Model returned no text content");
    }

    const parsed = JSON.parse(response.text);

    const urgency = String(parsed.urgency || "").toUpperCase();

    if (!["LOW", "MEDIUM", "HIGH"].includes(urgency)) {
      throw new Error(`Unexpected urgency value: ${parsed.urgency}`);
    }

    if (
      !parsed.chiefComplaint ||
      !Array.isArray(parsed.suggestedQuestions)
    ) {
      throw new Error("Model response missing required fields");
    }

    return {
      ok: true,
      data: {
        urgency: urgency as "LOW" | "MEDIUM" | "HIGH",
        chiefComplaint: String(parsed.chiefComplaint),
        suggestedQuestions: parsed.suggestedQuestions
          .slice(0, 3)
          .map((q: unknown) => String(q)),
      },
    };
  } catch (error: any) {
    console.error(
      "[llm] Pre-visit summary generation failed:",
      error?.message || error
    );

    return {
      ok: false,
      error: error?.message || "Unknown LLM error",
    };
  }
};

const generatePostVisitSummary = async (
  clinicalNotes: string,
  prescriptions: {
    medication: string;
    dosage: string;
    frequency: string;
    duration?: string | null;
    instructions?: string | null;
  }[],
  followUpInstructions?: string
): Promise<LLMResult<string>> => {
  const gemini = getClient();

  if (!gemini) {
    return {
      ok: false,
      error: "LLM is not configured (GEMINI_API_KEY missing)",
    };
  }

  const prescriptionText = prescriptions.length
    ? prescriptions
        .map(
          (p) =>
            `- ${p.medication} ${p.dosage}, ${p.frequency}${
              p.duration ? ` for ${p.duration}` : ""
            }${p.instructions ? ` (${p.instructions})` : ""}`
        )
        .join("\n")
    : "None prescribed.";

  const notes = `${clinicalNotes}

Prescriptions:
${prescriptionText}${
    followUpInstructions
      ? `\n\nFollow-up instructions: ${followUpInstructions}`
      : ""
  }`;

  const prompt = `
Convert the following clinical notes into a patient-friendly summary.

Clinical information:
${notes}

Requirements:
- Use plain, warm, non-technical language.
- Use short paragraphs or bullet points.
- Clearly explain the medication schedule.
- Clearly explain follow-up steps.
- Do not invent any medication, dosage, diagnosis, or instruction.
- Only use information provided in the clinical notes.
`;

  try {
    const response = await Promise.race([
      gemini.models.generateContent({
        model: MODEL,
        contents: prompt,
      }),

      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Gemini request timed out")),
          TIMEOUT_MS
        )
      ),
    ]);

    if (!response.text || !response.text.trim()) {
      throw new Error("Model returned no text content");
    }

    return {
      ok: true,
      data: response.text.trim(),
    };
  } catch (error: any) {
    console.error(
      "[llm] Post-visit summary generation failed:",
      error?.message || error
    );

    return {
      ok: false,
      error: error?.message || "Unknown LLM error",
    };
  }
};

export {
  generatePreVisitSummary,
  generatePostVisitSummary,
};