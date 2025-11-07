import { NextResponse } from "next/server";
import connectDatabase from "@/lib/db";
import { UserModel } from "@/lib/models/User";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { userSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = userSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  await connectDatabase();

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: "E-mail já cadastrado" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({ email, passwordHash });

  setSessionCookie(user._id.toString());

  return NextResponse.json({ id: user._id.toString(), email: user.email });
}
