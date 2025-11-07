import crypto from "crypto";

const { AUTH_SECRET = "dev-secret" } = process.env;

function sign(payload: string) {
  const hmac = crypto.createHmac("sha256", AUTH_SECRET);
  hmac.update(payload);
  return hmac.digest("hex");
}

export function createSessionToken(userId: string, expiresInHours = 12) {
  const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;
  const payload = `${userId}.${expiresAt}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifySessionToken(token: string) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [userId, expiresAt, signature] = decoded.split(".");
    if (!userId || !expiresAt || !signature) {
      return null;
    }

    const payload = `${userId}.${expiresAt}`;
    const expectedSignature = sign(payload);
    if (signature.length !== expectedSignature.length) {
      return null;
    }
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    if (Number.isNaN(Number(expiresAt)) || Number(expiresAt) < Date.now()) {
      return null;
    }

    return { userId };
  } catch (error) {
    return null;
  }
}
