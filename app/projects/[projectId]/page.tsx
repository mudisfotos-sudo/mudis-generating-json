import crypto from "crypto";
import { notFound, redirect } from "next/navigation";
import { ProjectWorkspace } from "@/components/ProjectWorkspace";
import connectDatabase from "@/lib/db";
import { ProjectModel } from "@/lib/models/Project";
import { getSessionFromCookies } from "@/lib/session";

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const session = getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  await connectDatabase();
  const project = await ProjectModel.findOne({
    _id: params.projectId,
    ownerId: session.userId,
  })
    .lean()
    .catch(() => null);

  if (!project) {
    notFound();
  }

  const entities = (project.entities ?? []).map((entity: any) => ({
    ...entity,
    _id: entity._id?.toString() ?? crypto.randomUUID(),
  }));

  return (
    <ProjectWorkspace
      projectId={params.projectId}
      name={project.name}
      description={project.description ?? ""}
      initialEntities={entities}
    />
  );
}
