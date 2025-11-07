import crypto from "crypto";
import { notFound, redirect } from "next/navigation";
import { ProjectWorkspace } from "@/components/ProjectWorkspace";
import connectDatabase from "@/lib/db";
import { ProjectModel } from "@/lib/models/Project";
import { UserModel } from "@/lib/models/User";
import { getSessionFromCookies } from "@/lib/session";

type ProjectEntityRecord = Record<string, unknown> & {
  _id?: { toString(): string };
};

type ProjectRecord = {
  name: string;
  description?: string;
  entities?: ProjectEntityRecord[];
};

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const session = getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  await connectDatabase();

  const [project, user] = await Promise.all([
    ProjectModel.findOne({
      _id: params.projectId,
      ownerId: session.userId,
    })
      .lean()
      .catch(() => null),
    UserModel.findById(session.userId).lean(),
  ]);

  if (!project) {
    notFound();
  }

  const userRecord = user as ({ email: string } & Record<string, unknown>) | null;

  if (!userRecord) {
    redirect("/login");
  }

  const projectRecord = project as unknown as ProjectRecord;

  const entities = (projectRecord.entities ?? []).map((entity) => ({
    ...entity,
    _id: entity._id?.toString() ?? crypto.randomUUID(),
  }));

  return (
    <ProjectWorkspace
      projectId={params.projectId}
      name={projectRecord.name}
      description={projectRecord.description ?? ""}
      initialEntities={entities}
      userEmail={userRecord.email}
    />
  );
}
