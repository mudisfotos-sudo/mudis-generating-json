import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { createSessionToken, verifySessionToken } from "./token";

const SESSION_COOKIE = "erp-json-session";

export function setSessionCookie(userId: string) {
  const token = createSessionToken(userId);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

export function getSessionFromRequest(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;
  if (!cookieValue) {
    return null;
  }
  return verifySessionToken(cookieValue);
}

export function getSessionFromCookies() {
  const cookieValue = cookies().get(SESSION_COOKIE)?.value;
  if (!cookieValue) {
    return null;
  }
  return verifySessionToken(cookieValue);
}
