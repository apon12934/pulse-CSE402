import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env["GEMINI_API_KEY"] ?? "";

const ai = new GoogleGenAI({ apiKey: API_KEY });

function buildSchedulingSystemPrompt(nowISO: string): string {
  return `You are Pulse, an AI scheduling assistant. Your job is to build and adjust a user's daily timeline.

CURRENT WALL-CLOCK TIME: ${nowISO}

RULES:
1. "Anchors" are IMMOVABLE events (classes, meetings). Never move them — keep their exact startTime and endTime.
2. "Fluid Blocks" are flexible tasks. Slot them into gaps around Anchors.
3. CRITICAL: Never schedule any task to start before the CURRENT WALL-CLOCK TIME shown above. All new slots must be in the future.
4. Default scheduling window is 07:00 to 23:00 local time. Never go outside this window unless an Anchor forces it.
5. Honor the user's reported energy level:
   - High energy → schedule demanding/focus tasks (studying, deep work)
   - Medium energy → moderate tasks (emails, planning)
   - Low energy → passive tasks (reading, light admin)
6. Always leave at least a 10-minute buffer between tasks.
7. Prioritize tasks by their priority field (higher number = more important).
8. If there are no anchors, start scheduling from the current time (rounded up to the next 15-min mark) or 09:00, whichever is later.

RESPONSE FORMAT:
Return ONLY valid JSON. No markdown, no explanation. The JSON must be an array of objects:
[
  {
    "title": "string",
    "type": "Anchor" | "Fluid",
    "startTime": "ISO 8601 datetime",
    "endTime": "ISO 8601 datetime",
    "energyLevel": "High" | "Medium" | "Low",
    "priority": number,
    "status": "Upcoming"
  }
]`;
}

const RESCHEDULE_SYSTEM_PROMPT = `You are Pulse's rescheduling engine. A task has overrun its allocated time. You must recalculate the remaining tasks for the day.

RULES:
1. The overrun task's new end time is provided. Accept it as fact.
2. NEVER move Anchor tasks. If there's a conflict with an Anchor, trim or drop the Fluid task.
3. Compress breaks to a minimum of 5 minutes if needed.
4. If a low-priority Fluid task cannot fit, mark its status as "Overdue" and set startTime/endTime to null.
5. Preserve the original order of remaining tasks where possible.
6. Keep energy-level alignment intact — don't put a High-energy task in a Low-energy slot.

RESPONSE FORMAT:
Return ONLY valid JSON. Same array format as the scheduler. Include ALL remaining tasks for the day (not just the changed ones), with updated times.`;

function buildChatSystemPrompt(nowISO: string, date: string): string {
  return `You are Pulse, an intelligent, conversational AI scheduling assistant.
The user will chat with you about their day. Your goal is to draft their schedule.
CURRENT DATE: ${date}. CURRENT WALL-CLOCK TIME: ${nowISO}.

RULES:
1. Act like a real person. Ask clarifying questions if information is vague.
2. If the user provides enough info, generate a draft schedule.
3. CRITICAL: All fixedStartTime values must be after ${nowISO}. Never schedule in the past.
4. Default to a 07:00-23:00 scheduling window.
5. Only set status to "approved" when the user EXPLICITLY approves ("looks good", "yes", "do it").

RESPONSE FORMAT:
Return ONLY valid JSON. No markdown wrappers.
{
  "reply": "Your natural language response to the user.",
  "status": "chatting" | "draft" | "approved",
  "tasks": [
    {
      "title": "string",
      "type": "Anchor" | "Fluid",
      "durationMinutes": number,
      "fixedStartTime": "ISO 8601 datetime" | null,
      "priority": number,
      "energyLevel": "High" | "Medium" | "Low"
    }
  ]
}`;
}

export type ScheduleItem = {
  title: string;
  type: "Anchor" | "Fluid";
  startTime: string | null;
  endTime: string | null;
  energyLevel: "High" | "Medium" | "Low";
  priority: number;
  status: "Upcoming" | "Running" | "Completed" | "Overdue";
};

export type ParsedChatInput = {
  reply: string;
  status: "chatting" | "draft" | "approved";
  tasks?: {
    title: string;
    type: "Anchor" | "Fluid";
    durationMinutes: number;
    fixedStartTime: string | null;
    priority: number;
    energyLevel: "High" | "Medium" | "Low";
  }[];
};

/**
 * Call Gemini with a system prompt and user message. Returns raw parsed JSON.
 */
async function callGemini<T>(systemPrompt: string, userMessage: string): Promise<T> {
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";
  const cleanedText = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleanedText) as T;
}

/**
 * Generate an initial daily schedule from a list of anchors and fluid tasks.
 */
export async function generateSchedule(
  anchors: ScheduleItem[],
  fluidTasks: ScheduleItem[],
  date: string,
  userEnergyLevel: string,
): Promise<ScheduleItem[]> {
  const nowISO = new Date().toISOString();
  const userMessage = JSON.stringify({
    date,
    currentTime: nowISO,
    userEnergyLevel,
    anchors,
    fluidTasks,
  });

  return callGemini<ScheduleItem[]>(buildSchedulingSystemPrompt(nowISO), userMessage);
}

/**
 * Reschedule remaining tasks after a task overruns its time.
 * "Domino Effect" — cascade adjustments through the rest of the day.
 */
export async function reschedule(
  overrunTaskTitle: string,
  newEndTime: string,
  remainingTasks: ScheduleItem[],
  date: string,
): Promise<ScheduleItem[]> {
  const userMessage = JSON.stringify({
    date,
    overrunTask: { title: overrunTaskTitle, newEndTime },
    remainingTasks,
  });

  return callGemini<ScheduleItem[]>(RESCHEDULE_SYSTEM_PROMPT, userMessage);
}

/**
 * Converse naturally using chat history.
 */
export async function converseSchedule(
  messages: { role: "user" | "model"; content: string }[],
  date: string,
): Promise<ParsedChatInput> {
  const nowISO = new Date().toISOString();
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents,
    config: {
      systemInstruction: buildChatSystemPrompt(nowISO, date),
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";
  try {
    const cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as ParsedChatInput;
  } catch (e) {
    console.error("Failed to parse Gemini JSON output:", text);
    return {
      reply: "I had trouble formatting that. Could you repeat?",
      status: "chatting",
    };
  }
}

