import crypto from "crypto";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import connectDatabase from "@/lib/db";
import { ProjectModel } from "@/lib/models/Project";
import { UserModel } from "@/lib/models/User";
import { getSessionFromCookies } from "@/lib/session";

export default async function DashboardPage() {
  const session = getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  await connectDatabase();

  const [projects, user] = await Promise.all([
    ProjectModel.find({ ownerId: session.userId })
      .sort({ updatedAt: -1 })
      .lean(),
    UserModel.findById(session.userId).lean(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const serializedProjects = projects.map((project) => ({
    id: project._id.toString(),
    name: project.name,
    description: project.description ?? "",
    entities: (project.entities ?? []).map((entity) => ({
      ...entity,
      _id: entity._id?.toString() ?? crypto.randomUUID(),
    })),
    updatedAt: project.updatedAt?.toISOString(),
    createdAt: project.createdAt?.toISOString(),
  }));

  return (
    <DashboardClient initialProjects={serializedProjects} userEmail={user.email} />
  );
}
