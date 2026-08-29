import type { Avatar } from "@/components/home/avatar-stack";
import { avatarsFrom } from "@/data/calendar-events";

export type Task = {
  id: string;
  title: string;
  /** Days from "today" (resolved at render time) — negative is overdue. */
  daysFromToday: number;
  time: string;
  progress: number;
  paletteIndex: number;
  avatars: Avatar[];
};

export type Activity = {
  id: string;
  title: string;
  label?: string;
  /** Days from "today" (resolved at render time) — negative is overdue. */
  daysFromToday: number;
  progress: number;
  paletteIndex: number;
  avatars?: Avatar[];
};

// Shared bg/accent/dark trio so a task's ring and an activity's progress bar
// read as the same "project color" language used across the app.
export const PALETTE = [
  { bg: "#DEE7FE", accent: "#8A9CD7", dark: "#4A5FA8" }, // blue
  { bg: "#F9EBC9", accent: "#E4C87B", dark: "#B08D34" }, // gold
  { bg: "#D5F6F0", accent: "#86C8B7", dark: "#1F8A6E" }, // teal
  { bg: "#EFD6FA", accent: "#BC97CF", dark: "#7A4F91" }, // purple
  { bg: "#FBE4EF", accent: "#C97FB0", dark: "#C25E8B" }, // pink
];

// The "range" a task/activity's due date falls into, resolved against the
// real "today" wherever it's read — see bucketForDays() in plan.tsx.
export type PlanRange = "overdue" | "today" | "week" | "later";

export function bucketForDays(daysFromToday: number): PlanRange {
  if (daysFromToday < 0) return "overdue";
  if (daysFromToday === 0) return "today";
  if (daysFromToday <= 6) return "week";
  return "later";
}

let taskSeed = 0;
function task(
  title: string,
  daysFromToday: number,
  time: string,
  progress: number,
  paletteIndex: number,
): Task {
  const id = `task-${taskSeed}`;
  const avatars = avatarsFrom(taskSeed * 3, 3);
  taskSeed += 1;
  return { id, title, daysFromToday, time, progress, paletteIndex, avatars };
}

let activitySeed = 0;
function activity(
  title: string,
  daysFromToday: number,
  progress: number,
  paletteIndex: number,
  label?: string,
  avatarCount = 3,
): Activity {
  const id = `activity-${activitySeed}`;
  const avatars = avatarCount > 0 ? avatarsFrom(activitySeed * 2 + 1, avatarCount) : undefined;
  activitySeed += 1;
  return { id, title, label, daysFromToday, progress, paletteIndex, avatars };
}

export const TASKS: Task[] = [
  task("Banking App Design", -2, "9.00 AM - 1.00 PM", 82, 2),
  task("Wallet App Design", -1, "2.30 PM - 6.30 PM", 64, 4),
  task("Gideon Project", 0, "10.00 AM - 12.00 PM", 40, 3),
  task("Astha App Redesign", 0, "1.00 PM - 4.00 PM", 25, 0),
  task("Slack App Redesign", 1, "9.30 AM - 11.30 AM", 50, 1),
  task("Loop Dashboard", 2, "3.00 PM - 5.00 PM", 30, 2),
  task("Nimbus Analytics", 3, "11.00 AM - 1.00 PM", 15, 4),
  task("Fintra Payments", 4, "2.00 PM - 4.30 PM", 10, 0),
  task("Arclight CRM", 5, "9.00 AM - 10.30 AM", 5, 1),
  task("Everline Booking", 6, "1.30 PM - 3.30 PM", 0, 3),
  task("Marbl Design System", 8, "10.00 AM - 12.00 PM", 0, 2),
  task("Solace Wellness App", 10, "9.00 AM - 11.00 AM", 0, 4),
  task("Procreche Website Design", 12, "2.00 PM - 4.00 PM", 0, 0),
  task("Procreche Mobile App", 14, "11.00 AM - 1.00 PM", 0, 1),
];

export const ACTIVITIES: Activity[] = [
  activity("Astha App Redesign", -3, 90, 0, undefined, 3),
  activity("Slack App Redesign", -1, 75, 1, "User interview", 3),
  activity("Gideon Project", 0, 55, 3, undefined, 0),
  activity("Loop Dashboard", 0, 35, 2, undefined, 3),
  activity("Nimbus Analytics", 1, 20, 4, "Client review", 2),
  activity("Fintra Payments", 2, 10, 0, undefined, 3),
  activity("Arclight CRM", 4, 0, 1, undefined, 0),
  activity("Everline Booking", 6, 0, 2, "Kickoff", 3),
  activity("Marbl Design System", 9, 0, 3, undefined, 2),
  activity("Solace Wellness App", 11, 0, 4, undefined, 0),
];
