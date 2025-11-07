import { NextResponse } from "next/server";
import connectDatabase from "@/lib/db";
import { ProjectModel } from "@/lib/models/Project";
import { getSessionFromCookies } from "@/lib/session";
import { entitySchema } from "@/lib/validators";

async function getProject(projectId: string, ownerId: string) {
  await connectDatabase();
  return ProjectModel.findOne({ _id: projectId, ownerId });
}

export async function GET(
  _request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const project = await getProject(params.projectId, session.userId);
  if (!project) {
    return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    entities: project.entities.map((entity: (typeof project.entities)[number]) => ({
      ...entity.toObject(),
      _id: entity._id.toString(),
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = entitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const project = await getProject(params.projectId, session.userId);
  if (!project) {
    return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
  }

  project.entities.push(parsed.data);
  await project.save();
  const newEntity = project.entities[project.entities.length - 1];

  return NextResponse.json(
    { ...newEntity.toObject(), _id: newEntity._id.toString() },
    { status: 201 }
  );
}
