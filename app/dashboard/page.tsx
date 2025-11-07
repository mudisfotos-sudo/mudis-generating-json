import crypto from "crypto";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import connectDatabase from "@/lib/db";
import { ProjectModel } from "@/lib/models/Project";
import { UserModel } from "@/lib/models/User";
import { getSessionFromCookies } from "@/lib/session";

type ProjectEntityRecord = Record<string, unknown> & {
  _id?: { toString(): string };
};

type ProjectDocumentRecord = {
  _id: { toString(): string };
  name: string;
  description?: string;
  entities?: ProjectEntityRecord[];
  updatedAt?: Date;
  createdAt?: Date;
};

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

  const userRecord = user as ({ email: string } & Record<string, unknown>) | null;

  if (!userRecord) {
    redirect("/login");
  }

  const serializedProjects = (projects as ProjectDocumentRecord[]).map((project) => ({
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
    <DashboardClient initialProjects={serializedProjects} userEmail={userRecord.email} />
  );
}
