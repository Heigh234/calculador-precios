import type { FieldErrors, ProductInput } from "@/lib/types"

export const NOMBRE_MAX_LENGTH = 120

/**
 * Convierte el texto de un input en número. Acepta coma o punto como separador
 * decimal y separadores de miles con espacio. Devuelve null si no es un número válido.
 */
export function parseNumberField(raw: string | number | null | undefined): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null
  if (raw == null) return null
  const cleaned = String(raw).trim().replace(/\s/g, "").replace(",", ".")
  if (cleaned === "") return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

/** Igual que parseNumberField pero un valor vacío significa 0 (campo opcional). */
export function parseOptionalNumberField(raw: string | number | null | undefined): number | null {
  if (typeof raw === "string" && raw.trim() === "") return 0
  if (raw == null) return 0
  return parseNumberField(raw)
}

export type ValidationResult =
  | { ok: true; value: ProductInput }
  | { ok: false; errors: FieldErrors }

/**
 * Valida los campos que ingresa el usuario. Se ejecuta en el cliente (para pintar
 * errores por campo) y OTRA VEZ en el servidor (nunca confiar en el cliente).
 */
export function validateProductInput(input: Partial<ProductInput>): ValidationResult {
  const errors: FieldErrors = {}

  const nombre = typeof input.nombre === "string" ? input.nombre.trim() : ""
  if (nombre === "") {
    errors.nombre = "El nombre es obligatorio."
  } else if (nombre.length > NOMBRE_MAX_LENGTH) {
    errors.nombre = `El nombre no puede superar ${NOMBRE_MAX_LENGTH} caracteres.`
  }

  const precio_usd = parseNumberField(input.precio_usd as number)
  if (precio_usd === null || precio_usd < 0) {
    errors.precio_usd = "Ingresa un precio válido."
  }

  const cantidad = parseNumberField(input.cantidad as number)
  if (cantidad === null || cantidad <= 0) {
    errors.cantidad = "La cantidad debe ser mayor que 0."
  }

  const porcentaje = parseOptionalNumberField(input.porcentaje as number)
  if (porcentaje === null || porcentaje < 0) {
    errors.porcentaje = "Ingresa un porcentaje válido."
  }

  const tasa = parseNumberField(input.tasa as number)
  if (tasa === null || tasa <= 0) {
    errors.tasa = "La tasa debe ser mayor que 0."
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    value: {
      nombre,
      precio_usd: precio_usd as number,
      cantidad: cantidad as number,
      porcentaje: porcentaje as number,
      tasa: tasa as number,
    },
  }
}

/** Normaliza un nombre para comparar duplicados: sin acentos, sin caso, sin espacios extra. */
export function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}
