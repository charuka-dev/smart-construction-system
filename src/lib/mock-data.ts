import type {
  Expense,
  Message,
  Project,
  ProgressLog,
  QualityInspection,
  SafetyIssue,
  User,
} from "./types";

const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

export const seedUsers: User[] = [
  {
    id: "u-contractor",
    name: "Marco Reyes",
    email: "contractor@demo.com",
    password: "demo",
    role: "contractor",
    status: "active",
    contactNo: "+1 555 0100",
  },
  {
    id: "u-supervisor",
    name: "Priya Shah",
    email: "supervisor@demo.com",
    password: "demo",
    role: "supervisor",
    status: "active",
    contactNo: "+1 555 0200",
  },
  {
    id: "u-supervisor-2",
    name: "Daniel Okafor",
    email: "daniel@demo.com",
    password: "demo",
    role: "supervisor",
    status: "active",
    contactNo: "+1 555 0201",
  },
  {
    id: "u-client",
    name: "Elena Voss",
    email: "client@demo.com",
    password: "demo",
    role: "client",
    status: "active",
    contactNo: "+1 555 0300",
    currentAddress: "412 Linden Ave, Portland OR",
    siteAddress: "88 Ridgeway Lane, Hillsboro OR",
  },
  {
    id: "u-client-2",
    name: "Theodore Kahn",
    email: "theo@demo.com",
    password: "demo",
    role: "client",
    status: "active",
    contactNo: "+1 555 0301",
    currentAddress: "12 Mill St, Seattle WA",
    siteAddress: "740 Hawthorne Rd, Tacoma WA",
  },
];

export const seedProjects: Project[] = [
  {
    id: "p-1",
    name: "Voss Residence — Ridgeway",
    clientId: "u-client",
    supervisorId: "u-supervisor",
    status: "in_progress",
    estimatedCost: 285000,
    budget: 310000,
    blueprintImageUrl:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=70",
    createdAt: daysAgo(40),
    milestones: [
      { id: "m1", projectId: "p-1", title: "Foundation", dueDate: daysAgo(20), status: "done" },
      { id: "m2", projectId: "p-1", title: "Framing", dueDate: daysAgo(5), status: "done" },
      { id: "m3", projectId: "p-1", title: "Electrical rough-in", dueDate: daysAgo(-7), status: "in_progress" },
      { id: "m4", projectId: "p-1", title: "Interior finish", dueDate: daysAgo(-25), status: "pending" },
    ],
    rooms: [
      {
        id: "r-living",
        name: "Living Room",
        polygon: [[0, 0], [6, 0], [6, 5], [0, 5]],
        areaM2: 30,
        status: "in_progress",
        wallColor: "#e8dfd1",
        tileStyle: "wood_oak",
        cupboardStyle: "oak",
      },
      {
        id: "r-kitchen",
        name: "Kitchen",
        polygon: [[6, 0], [10.5, 0], [10.5, 4], [6, 4]],
        areaM2: 18,
        status: "in_progress",
        wallColor: "#f1eadb",
        tileStyle: "marble_white",
        cupboardStyle: "white_matte",
      },
      {
        id: "r-bed",
        name: "Master Bedroom",
        polygon: [[0, 5], [5, 5], [5, 9.5], [0, 9.5]],
        areaM2: 22.5,
        status: "not_started",
        wallColor: "#d8d2c2",
        tileStyle: "ceramic_blue",
        cupboardStyle: "walnut",
      },
      {
        id: "r-bath",
        name: "Bathroom",
        polygon: [[5, 5], [7.5, 5], [7.5, 8], [5, 8]],
        areaM2: 7.5,
        status: "not_started",
        wallColor: "#dfe7ea",
        tileStyle: "slate_grey",
        cupboardStyle: "none",
      },
    ],
  },
  {
    id: "p-2",
    name: "Kahn Workshop — Hawthorne",
    clientId: "u-client-2",
    supervisorId: "u-supervisor-2",
    status: "approved",
    estimatedCost: 142000,
    budget: 155000,
    blueprintImageUrl:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=70",
    createdAt: daysAgo(12),
    milestones: [
      { id: "m21", projectId: "p-2", title: "Site prep", dueDate: daysAgo(-3), status: "in_progress" },
      { id: "m22", projectId: "p-2", title: "Slab pour", dueDate: daysAgo(-14), status: "pending" },
    ],
    rooms: [
      {
        id: "r-shop",
        name: "Workshop Bay",
        polygon: [[0, 0], [8, 0], [8, 6], [0, 6]],
        areaM2: 48,
        status: "not_started",
        wallColor: "#cfd0cd",
        tileStyle: "slate_grey",
        cupboardStyle: "none",
      },
      {
        id: "r-office",
        name: "Office",
        polygon: [[8, 0], [12, 0], [12, 4], [8, 4]],
        areaM2: 16,
        status: "not_started",
        wallColor: "#e6e1d3",
        tileStyle: "wood_oak",
        cupboardStyle: "oak",
      },
    ],
  },
  {
    id: "p-3",
    name: "Mercer Loft Renovation",
    clientId: "u-client",
    supervisorId: null,
    status: "pending",
    estimatedCost: 78000,
    budget: 0,
    blueprintImageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=70",
    createdAt: daysAgo(2),
    milestones: [],
    rooms: [
      {
        id: "r-loft",
        name: "Main Loft",
        polygon: [[0, 0], [9, 0], [9, 6], [0, 6]],
        areaM2: 54,
        status: "not_started",
        wallColor: "#ece6d6",
        tileStyle: "wood_oak",
        cupboardStyle: "walnut",
      },
    ],
  },
];

export const seedExpenses: Expense[] = [
  { id: "e1", projectId: "p-1", category: "materials", description: "Lumber delivery", amount: 4200, date: today },
  { id: "e2", projectId: "p-1", category: "labor", description: "Framing crew (4)", amount: 2800, date: today },
  { id: "e3", projectId: "p-1", category: "equipment", description: "Lift rental", amount: 450, date: today },
  { id: "e4", projectId: "p-1", category: "materials", description: "Electrical conduit", amount: 980, date: daysAgo(1) },
  { id: "e5", projectId: "p-1", category: "labor", description: "Electrician", amount: 1600, date: daysAgo(1) },
  { id: "e6", projectId: "p-1", category: "materials", description: "Drywall pallet", amount: 3100, date: daysAgo(7) },
  { id: "e7", projectId: "p-1", category: "labor", description: "Drywall crew", amount: 2400, date: daysAgo(7) },
  { id: "e8", projectId: "p-1", category: "materials", description: "Concrete", amount: 5800, date: daysAgo(20) },
  { id: "e9", projectId: "p-2", category: "materials", description: "Site survey", amount: 1200, date: daysAgo(10) },
];

export const seedProgress: ProgressLog[] = [
  { id: "pl1", projectId: "p-1", roomId: "r-living", note: "Framed north wall, ready for electrical.", status: "in_progress", date: today, loggedBy: "u-supervisor" },
  { id: "pl2", projectId: "p-1", roomId: "r-kitchen", note: "Cabinet rough placements set.", status: "in_progress", date: today, loggedBy: "u-supervisor" },
  { id: "pl3", projectId: "p-1", roomId: "r-bath", note: "Plumbing rough-in started.", status: "in_progress", date: daysAgo(2), loggedBy: "u-supervisor" },
];

export const seedQuality: QualityInspection[] = [
  { id: "q1", projectId: "p-1", roomId: "r-kitchen", status: "ok", notes: "Cabinets aligned within tolerance.", date: today, supervisorId: "u-supervisor" },
  { id: "q2", projectId: "p-1", roomId: "r-bath", status: "issue", notes: "Drain slope below spec — re-doing on Friday.", date: daysAgo(1), supervisorId: "u-supervisor" },
];

export const seedSafety: SafetyIssue[] = [
  { id: "s1", projectId: "p-1", date: daysAgo(3), description: "Scaffolding bracket loose on south face.", reasonWorkStopped: "Halted exterior work 2hr for re-tension.", resolved: true },
  { id: "s2", projectId: "p-1", date: daysAgo(9), description: "Heavy rain — site flooding risk.", reasonWorkStopped: "Stopped pour, tarped slab.", resolved: true },
];

export const seedMessages: Message[] = [
  { id: "msg1", projectId: "p-1", fromUserId: "u-client", toUserId: "u-contractor", content: "Can we shift the kitchen island 30cm east?", timestamp: daysAgo(1) },
  { id: "msg2", projectId: "p-1", fromUserId: "u-contractor", toUserId: "u-client", content: "Confirmed — Priya will update tomorrow's layout.", timestamp: daysAgo(1) },
  { id: "msg3", projectId: "p-1", fromUserId: "u-supervisor", toUserId: "u-contractor", content: "Drain re-do scheduled Friday AM.", timestamp: today },
];
