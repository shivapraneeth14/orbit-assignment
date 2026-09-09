import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const AVATAR_COLORS = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#14b8a6"];

function pickColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

async function main() {
  console.log("🌱 Seeding ORBIT...");

  const passwordHash = await bcrypt.hash("demo1234", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@orbit.dev" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@orbit.dev",
      passwordHash,
      avatarColor: pickColor("Demo User"),
    },
  });

  const teammate = await prisma.user.upsert({
    where: { email: "teammate@orbit.dev" },
    update: {},
    create: {
      name: "Teammate One",
      email: "teammate@orbit.dev",
      passwordHash,
      avatarColor: pickColor("Teammate One"),
    },
  });

  // Default workspace for demo user
  const workspace = await prisma.workspace.upsert({
    where: { id: "ws_demo" },
    update: { name: "Orbit Engineering" },
    create: {
      id: "ws_demo",
      name: "Orbit Engineering",
      ownerId: demoUser.id,
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: { workspaceId: workspace.id, userId: demoUser.id },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: demoUser.id,
      role: "OWNER",
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: { workspaceId: workspace.id, userId: teammate.id },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: teammate.id,
      role: "MEMBER",
    },
  });

  // Projects
  const mobileProject = await prisma.project.upsert({
    where: { id: "prj_mobile" },
    update: { name: "Mobile App" },
    create: {
      id: "prj_mobile",
      workspaceId: workspace.id,
      name: "Mobile App",
      description: "Orbit's native mobile client for iOS and Android.",
      color: "#3b4cff",
    },
  });

  const webProject = await prisma.project.upsert({
    where: { id: "prj_web" },
    update: { name: "Website Redesign" },
    create: {
      id: "prj_web",
      workspaceId: workspace.id,
      name: "Website Redesign",
      description: "Refreshing the marketing site and landing pages.",
      color: "#0ea5e9",
    },
  });

  const daysFromNow = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  const taskData = [
    // Mobile App tasks
    {
      projectId: mobileProject.id,
      title: "Set up repository and CI pipeline",
      description: "Create the app monorepo and wire up CI for iOS and Android builds.",
      status: "DONE",
      priority: "HIGH",
      assigneeId: demoUser.id,
      dueDate: daysFromNow(-12),
    },
    {
      projectId: mobileProject.id,
      title: "Design onboarding flow",
      description: "Sketch the first-run experience with signup and workspace creation.",
      status: "DONE",
      priority: "MEDIUM",
      assigneeId: teammate.id,
      dueDate: daysFromNow(-9),
    },
    {
      projectId: mobileProject.id,
      title: "Implement task board view",
      description: "Port the kanban board from web to mobile with drag-and-drop.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      assigneeId: demoUser.id,
      dueDate: daysFromNow(2),
    },
    {
      projectId: mobileProject.id,
      title: "Push notifications for mentions",
      description: "Local + remote notifications when a user is assigned or mentioned.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: teammate.id,
      dueDate: daysFromNow(5),
    },
    {
      projectId: mobileProject.id,
      title: "Offline sync for focused sessions",
      description: "Queue task mutations and replay when connectivity returns.",
      status: "IN_REVIEW",
      priority: "MEDIUM",
      assigneeId: demoUser.id,
      dueDate: daysFromNow(7),
    },
    {
      projectId: mobileProject.id,
      title: "App store submission",
      description: "Prepare screenshots, metadata, and submit to TestFlight and Play beta.",
      status: "TODO",
      priority: "HIGH",
      assigneeId: null,
      dueDate: daysFromNow(14),
    },
    {
      projectId: mobileProject.id,
      title: "Analytics dashboard",
      description: "Show weekly active users and feature adoption inside the app.",
      status: "TODO",
      priority: "LOW",
      assigneeId: teammate.id,
      dueDate: daysFromNow(21),
    },
    // Website Redesign tasks
    {
      projectId: webProject.id,
      title: "Audit current site content",
      description: "Inventory every page and asset so nothing gets lost in the redesign.",
      status: "DONE",
      priority: "MEDIUM",
      assigneeId: demoUser.id,
      dueDate: daysFromNow(-15),
    },
    {
      projectId: webProject.id,
      title: "Create new design system",
      description: "Typography, color tokens, and component library for the new site.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      assigneeId: teammate.id,
      dueDate: daysFromNow(3),
    },
    {
      projectId: webProject.id,
      title: "Build landing page in Next.js",
      description: "Implement the hero and feature sections with the new design system.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: demoUser.id,
      dueDate: daysFromNow(6),
    },
    {
      projectId: webProject.id,
      title: "Write migration redirects",
      description: "301 map old URLs to new ones to preserve SEO equity.",
      status: "IN_REVIEW",
      priority: "MEDIUM",
      assigneeId: null,
      dueDate: daysFromNow(4),
    },
    {
      projectId: webProject.id,
      title: "Set up CMS for blog",
      description: "Move the engineering blog onto the new platform.",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: teammate.id,
      dueDate: daysFromNow(9),
    },
  ];

  // Reset demo tasks so re-running the seed is idempotent
  await prisma.task.deleteMany({
    where: { projectId: { in: [mobileProject.id, webProject.id] } },
  });

  for (const t of taskData) {
    await prisma.task.create({
      data: {
        projectId: t.projectId,
        title: t.title,
        description: t.description,
        status: t.status as never,
        priority: t.priority as never,
        assigneeId: t.assigneeId,
        dueDate: t.dueDate,
      },
    });
  }

  console.log(`✔ Created demo user: demo@orbit.dev (password: demo1234)`);
  console.log(`✔ Workspace: ${workspace.name}`);
  console.log(`✔ Projects: ${mobileProject.name}, ${webProject.name}`);
  console.log(`✔ Tasks seeded: ${taskData.length}`);
  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });