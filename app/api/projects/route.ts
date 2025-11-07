import { NextResponse } from "next/server";
import connectDatabase from "@/lib/db";
import { ProjectModel } from "@/lib/models/Project";
import { getSessionFromCookies } from "@/lib/session";
import { projectSchema } from "@/lib/validators";

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  await connectDatabase();

  const projects = await ProjectModel.find({ ownerId: session.userId }).sort({
    updatedAt: -1,
  });

  return NextResponse.json(
    projects.map((project) => ({
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      entities: project.entities?.map((entity: any) => ({
        ...entity,
        _id: entity._id?.toString(),
      })),
      updatedAt: project.updatedAt,
      createdAt: project.createdAt,
    }))
  );
}

export async function POST(request: Request) {
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

  await connectDatabase();

  const project = await ProjectModel.create({
    ...parsed.data,
    ownerId: session.userId,
  });

  return NextResponse.json(
    {
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      entities: project.entities,
    },
    { status: 201 }
  );
}
