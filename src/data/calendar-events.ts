import type { Avatar } from "@/components/home/avatar-stack";

export type CalendarEvent = {
  id: string;
  /** Days from "today" (resolved at render time), so the seed data always sits near now. */
  dayOffset: number;
  hour: number;
  durationHours: number;
  title: string;
  subtitle: string;
  time: string;
  backgroundColor: string;
  avatars: Avatar[];
};

// Shared with event-form-sheet.tsx, which builds a CalendarEvent for
// whatever the user submits using the same palette/avatar/time formatting.
export const memoji = (n: number) => `https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_${n}.png`;

export const COLORS = ["#E6DFFB", "#F9EBC9", "#D5F6F0", "#DEE7FE", "#EFD6FA", "#FBE4EF", "#DFF7F0"];

const AVATAR_SEEDS = [4, 9, 18, 7, 15, 22, 3, 11, 26, 2, 19, 30, 6, 13, 24, 8, 17, 29, 1, 10, 21];

export function avatarsFrom(start: number, count: number): Avatar[] {
  return Array.from({ length: count }, (_, i) => ({
    uri: memoji(AVATAR_SEEDS[(start + i) % AVATAR_SEEDS.length]),
  }));
}

export function clockLabel(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  const period = h < 12 ? "AM" : "PM";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  const label = twelve < 10 ? `0${twelve}` : `${twelve}`;
  return `${label}.00 ${period}`;
}

let seedCount = 0;

function seed(
  dayOffset: number,
  hour: number,
  title: string,
  subtitle: string,
  colorIndex: number,
  opts: { avatarCount?: number; durationHours?: number } = {},
): CalendarEvent {
  const { avatarCount = 3, durationHours = 1 } = opts;
  const id = `evt-${seedCount}`;
  const avatarStart = seedCount * 2;
  seedCount += 1;
  return {
    id,
    dayOffset,
    hour,
    durationHours,
    title,
    subtitle,
    time: `${clockLabel(hour)} - ${clockLabel(hour + durationHours)}`,
    backgroundColor: COLORS[colorIndex % COLORS.length],
    avatars: avatarsFrom(avatarStart, avatarCount),
  };
}

// 50 seed events. `today` (hour 8 and hour 10) is deliberately overloaded with
// 5 and 4 events respectively to exercise the swipeable EventStack, alongside
// a 4-stack tomorrow and a 3-stack the day after — everything else is a single
// event or empty, the common case.
export const CALENDAR_EVENTS: CalendarEvent[] = [
  // -- a few days ago --
  seed(-3, 11, "Design system sync", "Marbl Design System", 3),
  seed(-2, 9, "Client sync", "Fintra Payments", 1),
  seed(-2, 15, "Retrospective", "Astha App Redesign", 4),
  seed(-1, 10, "Icon set review", "Arclight CRM", 2),
  seed(-1, 13, "Copy review", "Everline Booking", 0),

  // -- today: the busy day --
  seed(0, 7, "Stand-up", "Procreche Website Design", 6, { avatarCount: 2 }),
  seed(0, 8, "Competitive analysis", "Procreche Website Design", 0),
  seed(0, 8, "Sprint planning", "Loop Dashboard", 1),
  seed(0, 8, "Client sync", "Nimbus Analytics", 2),
  seed(0, 8, "Design critique", "Astha App Redesign", 3),
  seed(0, 8, "Vendor call", "Everline Booking", 4),
  seed(0, 9, "Onboarding flow review", "Wallet App Design", 5),
  seed(0, 10, "User research", "Procreche Web Application", 3),
  seed(0, 10, "Usability testing", "Banking App Design", 6),
  seed(0, 10, "Component audit", "Marbl Design System", 0),
  seed(0, 10, "Handoff to engineering", "Gideon Project", 1),
  seed(0, 13, "User journey", "Procreche Mobile App", 2),
  seed(0, 16, "Dark mode audit", "Solace Wellness App", 4),
  seed(0, 16, "Motion review", "Loop Dashboard", 5),
  seed(0, 18, "Stakeholder demo", "Fintra Payments", 6),

  // -- tomorrow --
  seed(1, 9, "Prototype walkthrough", "Arclight CRM", 0),
  seed(1, 11, "Accessibility pass", "Astha App Redesign", 1),
  seed(1, 11, "App store assets review", "Wallet App Design", 2),
  seed(1, 14, "Competitive analysis", "Nimbus Analytics", 3),
  seed(1, 14, "Sprint planning", "Everline Booking", 4),
  seed(1, 14, "Client sync", "Marbl Design System", 5),
  seed(1, 14, "Design critique", "Gideon Project", 6),
  seed(1, 17, "Copy review", "Solace Wellness App", 0),

  // -- day after tomorrow --
  seed(2, 8, "Stakeholder demo", "Banking App Design", 1),
  seed(2, 9, "Onboarding flow review", "Procreche Mobile App", 2),
  seed(2, 9, "Icon set review", "Loop Dashboard", 3),
  seed(2, 9, "Handoff to engineering", "Fintra Payments", 4),
  seed(2, 15, "User research", "Wallet App Design", 5),

  // -- rest of the week --
  seed(3, 10, "Usability testing", "Astha App Redesign", 6),
  seed(3, 13, "Design system sync", "Marbl Design System", 0),
  seed(3, 16, "Retrospective", "Gideon Project", 1),
  seed(4, 9, "Client sync", "Nimbus Analytics", 2),
  seed(4, 12, "Prototype walkthrough", "Everline Booking", 3),
  seed(5, 8, "Sprint planning", "Procreche Website Design", 4),
  seed(5, 14, "Accessibility pass", "Solace Wellness App", 5),
  seed(5, 17, "Component audit", "Banking App Design", 6),
  seed(6, 10, "Dark mode audit", "Loop Dashboard", 0),

  // -- next week --
  seed(7, 10, "Competitive analysis", "Fintra Payments", 1),
  seed(7, 11, "Motion review", "Arclight CRM", 2),
  seed(8, 9, "Design critique", "Wallet App Design", 3),
  seed(9, 13, "Copy review", "Marbl Design System", 4),
  seed(9, 15, "Client sync", "Procreche Mobile App", 5),
  seed(10, 8, "App store assets review", "Gideon Project", 6),
  seed(11, 16, "Handoff to engineering", "Astha App Redesign", 0),

  // -- further out --
  seed(13, 9, "Stand-up", "Nimbus Analytics", 1, { avatarCount: 2 }),
];
