import { NextResponse } from "next/server";
import connectDatabase from "@/lib/db";
import { ProjectModel } from "@/lib/models/Project";
import { getSessionFromCookies } from "@/lib/session";
import { projectSchema } from "@/lib/validators";

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
    id: project._id.toString(),
    name: project.name,
    description: project.description,
    entities: project.entities?.map((entity: any) => ({
      ...entity,
      _id: entity._id?.toString(),
    })),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
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

  project.name = parsed.data.name;
  project.description = parsed.data.description;
  project.entities = parsed.data.entities;
  await project.save();

  return NextResponse.json({
    id: project._id.toString(),
    name: project.name,
    description: project.description,
    entities: project.entities?.map((entity: any) => ({
      ...entity,
      _id: entity._id?.toString(),
    })),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  await connectDatabase();
  const result = await ProjectModel.deleteOne({
    _id: params.projectId,
    ownerId: session.userId,
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
