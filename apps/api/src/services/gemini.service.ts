import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env["GEMINI_API_KEY"] ?? "";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SCHEDULING_SYSTEM_PROMPT = `You are Pulse, an AI scheduling assistant. Your job is to build and adjust a user's daily timeline.

RULES:
1. "Anchors" are IMMOVABLE events (classes, meetings). Never move them.
2. "Fluid Blocks" are flexible tasks the user wants to accomplish. Slot them into gaps around Anchors.
3. Honor the user's reported energy level:
   - High energy → schedule demanding/focus tasks (studying, deep work)
   - Medium energy → moderate tasks (emails, planning)
   - Low energy → passive tasks (reading, light admin)
4. Always leave at least a 10-minute buffer between tasks.
5. Never schedule anything before the user's earliest anchor or after midnight.
6. Prioritize tasks by their priority field (higher number = more important).

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

const CHAT_PARSE_SYSTEM_PROMPT = `You are Pulse's natural language parser. The user sends informal messages about their day. Extract structured task data.

RULES:
1. Identify tasks, their approximate durations, and any timing constraints.
2. Detect energy cues: "I'm tired" → Low, "feeling great" → High, neutral → Medium.
3. Detect priority cues: "important", "must do", "critical" → high priority (7-10). "maybe", "if I have time" → low priority (1-3). Default → medium (4-6).
4. Detect task type: anything with a fixed time ("class at 2pm", "meeting at 10") → Anchor. Everything else → Fluid.

RESPONSE FORMAT:
Return ONLY valid JSON:
{
  "energyLevel": "High" | "Medium" | "Low",
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
  energyLevel: "High" | "Medium" | "Low";
  tasks: {
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
    model: "gemini-2.5-flash",
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";
  return JSON.parse(text) as T;
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
  const userMessage = JSON.stringify({
    date,
    userEnergyLevel,
    anchors,
    fluidTasks,
  });

  return callGemini<ScheduleItem[]>(SCHEDULING_SYSTEM_PROMPT, userMessage);
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
 * Parse natural language chat input into structured task data.
 */
export async function parseChatInput(
  message: string,
  date: string,
): Promise<ParsedChatInput> {
  const userMessage = JSON.stringify({ message, date });
  return callGemini<ParsedChatInput>(CHAT_PARSE_SYSTEM_PROMPT, userMessage);
}
