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
  { params }: { params: { projectId: string; entityId: string } }
) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const project = await getProject(params.projectId, session.userId);
  if (!project) {
    return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
  }

  const entity = project.entities.id(params.entityId);
  if (!entity) {
    return NextResponse.json({ message: "Entidade não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ...entity.toObject(), _id: entity._id.toString() });
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; entityId: string } }
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

  const entity = project.entities.id(params.entityId);
  if (!entity) {
    return NextResponse.json({ message: "Entidade não encontrada" }, { status: 404 });
  }

  Object.assign(entity, parsed.data);
  await project.save();

  return NextResponse.json({ ...entity.toObject(), _id: entity._id.toString() });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { projectId: string; entityId: string } }
) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const project = await getProject(params.projectId, session.userId);
  if (!project) {
    return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
  }

  const entity = project.entities.id(params.entityId);
  if (!entity) {
    return NextResponse.json({ message: "Entidade não encontrada" }, { status: 404 });
  }

  entity.deleteOne();
  await project.save();

  return NextResponse.json({ success: true });
}
