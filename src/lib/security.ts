import { randomInt } from "crypto";

const LOWER = "abcdefghijkmnopqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const NUMBERS = "23456789";
const SYMBOLS = "!@#$%";
const ALL = LOWER + UPPER + NUMBERS + SYMBOLS;

/**
 * Genera una contraseña segura, no predecible y con alta entropía garantizada
 * utilizando el generador criptográfico seguro de Node.js (crypto.randomInt).
 * Asegura la inclusión de mayúsculas, minúsculas, números y símbolos.
 */
export function generarPasswordSegura(longitud = 12): string {
  const passwordChars: string[] = [
    LOWER[randomInt(0, LOWER.length)],
    UPPER[randomInt(0, UPPER.length)],
    NUMBERS[randomInt(0, NUMBERS.length)],
    SYMBOLS[randomInt(0, SYMBOLS.length)],
  ];

  for (let i = passwordChars.length; i < longitud; i++) {
    passwordChars.push(ALL[randomInt(0, ALL.length)]);
  }

  // Barajado criptográfico Fisher-Yates
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    const temp = passwordChars[i];
    passwordChars[i] = passwordChars[j];
    passwordChars[j] = temp;
  }

  return passwordChars.join("");
}

/**
 * Rate limiter simple en memoria para mitigar ataques de fuerza bruta
 * e inundación de peticiones (DoS/correo masivo) en endpoints sensibles.
 */
type RateLimitRecord = { count: number; resetTime: number };
const rateLimits = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimits.get(key);

  if (!record || now > record.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}
