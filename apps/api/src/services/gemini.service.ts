import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env["GEMINI_API_KEY"] ?? "";

const ai = new GoogleGenAI({ apiKey: API_KEY });

function buildSchedulingSystemPrompt(nowISO: string): string {
  return `You are Pulse, an AI scheduling assistant. Your job is to build and adjust a user's daily timeline.

CURRENT WALL-CLOCK TIME: ${nowISO}

RULES:
1. All tasks are flexible. You have full control to shift, shrink, or move any task to build a perfect schedule.
2. CRITICAL: Never schedule any task to start before the CURRENT WALL-CLOCK TIME shown above. All new slots must be in the future.
3. Default scheduling window is 07:00 to 23:00 local time. Never go outside this window.
4. Honor the user's reported energy level:
   - High energy → schedule demanding/focus tasks (studying, deep work)
   - Medium energy → moderate tasks (emails, planning)
   - Low energy → passive tasks (reading, light admin)
5. Always leave at least a 10-minute buffer between tasks.
6. Prioritize tasks by their priority field (higher number = more important).
7. Start scheduling from the current time (rounded up to the next 15-min mark) or 09:00, whichever is later.

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
2. ALL tasks are flexible. Push back, shrink, or move following tasks to absorb the delay.
3. SEMANTIC REASONING: Read the 'title' of the tasks and use real-world human logic. Do not treat them as generic mathematical blocks.
4. INTELLIGENT OVERLAP: If a short task overruns into a massive 4+ hour block (like 'Work' or 'Study'), ALLOW them to overlap. People take breaks/meals during work. Do NOT push the entire massive block down.
5. Compress breaks to a minimum of 5 minutes if needed.
6. If a low-priority task cannot fit, mark its status as "Overdue" and set startTime/endTime to null.
7. Preserve the original order of remaining tasks where possible.
8. Keep energy-level alignment intact — don't put a High-energy task in a Low-energy slot.

RESPONSE FORMAT:
Return ONLY valid JSON. Same array format as the scheduler. Include ALL remaining tasks for the day (not just the changed ones), with updated times.`;

const REORDER_SYSTEM_PROMPT = `You are Pulse's scheduling engine. The user has manually REORDERED their tasks for the day.

RULES:
1. You are provided with the tasks in their NEW EXACT ORDER. You MUST preserve this exact sequence.
2. Calculate new start and end times for all tasks so they fit back-to-back in this exact order.
3. Keep their original durations intact.
4. Leave a 5-10 minute buffer between tasks.
5. The first task should start at its currently provided startTime, or if that's in the past, start from the CURRENT WALL-CLOCK TIME.
6. All tasks are flexible, but their ORDER is strict.

RESPONSE FORMAT:
Return ONLY valid JSON. Same array format as the scheduler. Include ALL tasks with their new times.`;

const MOVE_SYSTEM_PROMPT = `You are Pulse's scheduling engine. The user has manually MOVED a task to a new exact time.

RULES:
1. The moved task's new startTime and endTime are provided. Accept them as fact and DO NOT move this task.
2. Reschedule the remaining tasks around it.
3. SEMANTIC REASONING: Read the 'title' of the tasks and use real-world human logic. If 'Lunch Break' overlaps with 'Work', they can happen simultaneously. If 'Gym' overlaps with 'Meeting', they are mutually exclusive.
4. INTELLIGENT OVERLAPPING: If a short task (like a meal, break, or quick errand) is moved to overlap with a long continuous block (like 'Work' or 'Study'), DO NOT push the long block down. ALLOW them to overlap, meaning the short task happens *during* the long task. 
5. ONLY push tasks down if their semantic meanings dictate they are mutually exclusive.
6. Keep original durations intact where possible, but you can compress low priority tasks.
7. Leave a 5-10 minute buffer between mutually exclusive tasks.
8. Preserve the original chronological order of the remaining tasks as much as possible.

RESPONSE FORMAT:
Return ONLY valid JSON. Same array format as the scheduler. Include ALL tasks (including the moved one) with their new times.`;

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

function buildWeeklySystemPrompt(): string {
  return `You are Pulse, an AI life coach and scheduling assistant. The user wants to build a recurring WEEKLY routine.

RULES:
1. Ask about the user's lifestyle: wake time, sleep time, work/school hours, exercise habits, meal times, hobbies.
2. Once you have enough context, propose a full 7-day weekly schedule.
3. Treat weekdays (Mon-Fri) and weekends (Sat-Sun) differently — weekends can be lighter.
4. Each task must be realistic and repeatable every week.
5. Cover essential daily blocks: Morning Routine, Meals, Work/Study, Breaks, Exercise, Wind-Down.
6. Only set status to "weekly_approved" when the user EXPLICITLY approves.
7. dayOfWeek: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
8. Times use 24h format: startHour 7 startMinute 30 = 7:30 AM.

RESPONSE FORMAT — Return ONLY valid JSON:
{
  "reply": "Your natural language response",
  "status": "chatting" | "weekly_draft" | "weekly_approved",
  "weeklyTasks": [
    {
      "title": "string",
      "type": "Anchor" | "Fluid",
      "energyLevel": "High" | "Medium" | "Low",
      "priority": number,
      "dayOfWeek": number,
      "startHour": number,
      "startMinute": number,
      "endHour": number,
      "endMinute": number
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
  status: "chatting" | "draft" | "approved" | "weekly_draft" | "weekly_approved";
  tasks?: {
    title: string;
    type: "Anchor" | "Fluid";
    durationMinutes: number;
    fixedStartTime: string | null;
    priority: number;
    energyLevel: "High" | "Medium" | "Low";
  }[];
  weeklyTasks?: {
    title: string;
    type: "Anchor" | "Fluid";
    energyLevel: "High" | "Medium" | "Low";
    priority: number;
    dayOfWeek: number;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  }[];
};

/**
 * Call Gemini with a system prompt and user message. Returns raw parsed JSON.
 */
async function callGemini<T>(systemPrompt: string, userMessage: string): Promise<T> {
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
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
 * Reorder tasks based on a new sequence provided by the user.
 */
export async function reorderSchedule(
  orderedTasks: ScheduleItem[],
  date: string,
): Promise<ScheduleItem[]> {
  const nowISO = new Date().toISOString();
  const userMessage = JSON.stringify({
    date,
    currentTime: nowISO,
    orderedTasks,
  });

  return callGemini<ScheduleItem[]>(REORDER_SYSTEM_PROMPT, userMessage);
}

/**
 * Move a task to a new time and reschedule the rest around it.
 */
export async function moveSchedule(
  movedTask: { title: string; newStartTime: string; newEndTime: string },
  remainingTasks: ScheduleItem[],
  date: string,
): Promise<ScheduleItem[]> {
  const userMessage = JSON.stringify({
    date,
    movedTask,
    remainingTasks,
  });

  return callGemini<ScheduleItem[]>(MOVE_SYSTEM_PROMPT, userMessage);
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

/**
 * Converse to build a weekly recurring routine.
 */
export async function converseWeekly(
  messages: { role: "user" | "model"; content: string }[],
): Promise<ParsedChatInput> {
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents,
    config: {
      systemInstruction: buildWeeklySystemPrompt(),
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";
  try {
    const cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as ParsedChatInput;
  } catch (e) {
    console.error("Failed to parse weekly Gemini output:", text);
    return {
      reply: "I had trouble formatting that. Could you rephrase?",
      status: "chatting",
    };
  }
}
