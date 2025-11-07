import { NextResponse } from "next/server";
import connectDatabase from "@/lib/db";
import { UserModel } from "@/lib/models/User";
import { getSessionFromCookies } from "@/lib/session";

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  await connectDatabase();

  const user = await UserModel.findById(session.userId).select("email");
  if (!user) {
    return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ id: user._id.toString(), email: user.email });
}
