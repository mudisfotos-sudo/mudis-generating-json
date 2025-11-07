import { NextResponse } from "next/server";
import connectDatabase from "@/lib/db";
import { UserModel } from "@/lib/models/User";
import { verifyPassword } from "@/lib/password";
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

  const user = await UserModel.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: "Credenciais inválidas" }, { status: 401 });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ message: "Credenciais inválidas" }, { status: 401 });
  }

  setSessionCookie(user._id.toString());

  return NextResponse.json({ id: user._id.toString(), email: user.email });
}
