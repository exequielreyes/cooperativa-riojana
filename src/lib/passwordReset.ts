import crypto from "crypto";

/**
 * Genera un token aleatorio (256 bits de entropía) para el link que recibe
 * el usuario por email, y su hash SHA-256 para guardar en la base.
 *
 * Guardamos solo el hash: si alguien accediera a un backup de la base, no
 * podría usar esos valores para resetear contraseñas (igual que nunca se
 * guardan las contraseñas en texto plano).
 */
export function generarTokenReseteo() {
  const tokenPlano = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashearToken(tokenPlano);
  return { tokenPlano, tokenHash };
}

export function hashearToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const RESETEO_EXPIRA_EN_MINUTOS = 60;
