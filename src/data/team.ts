import type { Avatar } from "@/components/home/avatar-stack";

const memoji = (n: number) => `https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_${n}.png`;

export type TeamMember = {
  id: string;
  name: string;
  avatar: Avatar;
};

// The people selectable in EventFormSheet — a small fixed roster rather than
// a directory, matching the scope of this app's other mock data.
export const TEAM_MEMBERS: TeamMember[] = [
  { id: "amelia", name: "Amelia", avatar: { uri: memoji(4) } },
  { id: "noah", name: "Noah", avatar: { uri: memoji(9) } },
  { id: "sofia", name: "Sofia", avatar: { uri: memoji(18) } },
  { id: "liam", name: "Liam", avatar: { uri: memoji(7) } },
  { id: "mia", name: "Mia", avatar: { uri: memoji(15) } },
  { id: "ethan", name: "Ethan", avatar: { uri: memoji(22) } },
  { id: "ava", name: "Ava", avatar: { uri: memoji(3) } },
  { id: "lucas", name: "Lucas", avatar: { uri: memoji(11) } },
];
