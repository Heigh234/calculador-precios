"use server"

import { revalidatePath } from "next/cache"
import { calculateDerived } from "@/lib/calculations"
import { countByName, mapProductRow, PRODUCT_COLUMNS, PRODUCTS_TABLE } from "@/lib/data"
import { createClient } from "@/lib/supabase/server"
import { validateProductInput } from "@/lib/validation"
import type { ActionResult, Product, ProductInput } from "@/lib/types"

const UPSERT_CHUNK_SIZE = 500

function firstMessage(errors: Record<string, string>): string {
  return Object.values(errors)[0] ?? "Revisa los datos ingresados."
}

/**
 * Crea un producto. Si el nombre ya existe y force !== true, devuelve code 'DUPLICATE'
 * para que el cliente muestre la advertencia. La advertencia NO es bloqueante:
 * al reintentar con force: true, el duplicado SIEMPRE se crea.
 */
export async function createProduct(
  input: ProductInput,
  options?: { force?: boolean },
): Promise<ActionResult<Product>> {
  const parsed = validateProductInput(input)
  if (!parsed.ok) {
    return { ok: false, code: "VALIDATION", error: firstMessage(parsed.errors), fieldErrors: parsed.errors }
  }
  const value = parsed.value

  try {
    if (!options?.force) {
      const existing = await countByName(value.nombre)
      if (existing > 0) {
        return {
          ok: false,
          code: "DUPLICATE",
          error: `Ya existe un producto llamado «${value.nombre}». ¿Deseas agregarlo de todas formas?`,
        }
      }
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .insert({ ...value, ...calculateDerived(value) })
      .select(PRODUCT_COLUMNS)
      .single()

    if (error) throw error

    revalidatePath("/")
    return { ok: true, data: mapProductRow(data as Record<string, unknown>) }
  } catch (error) {
    console.log("[v0] createProduct error:", error)
    return { ok: false, code: "UNKNOWN", error: "No se pudo agregar el producto. Intenta de nuevo." }
  }
}

/**
 * Actualiza un producto y recalcula sus derivados.
 * Editar la tasa aquí es la 'tasa individual': no afecta a los demás productos.
 * En edición NO se advierte por nombre duplicado (solo se exige al agregar).
 */
export async function updateProduct(id: number, input: ProductInput): Promise<ActionResult<Product>> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, code: "VALIDATION", error: "Producto inválido." }
  }

  const parsed = validateProductInput(input)
  if (!parsed.ok) {
    return { ok: false, code: "VALIDATION", error: firstMessage(parsed.errors), fieldErrors: parsed.errors }
  }
  const value = parsed.value

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .update({ ...value, ...calculateDerived(value) })
      .eq("id", id)
      .select(PRODUCT_COLUMNS)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return { ok: false, code: "NOT_FOUND", error: "El producto ya no existe." }
    }

    revalidatePath("/")
    return { ok: true, data: mapProductRow(data as Record<string, unknown>) }
  } catch (error) {
    console.log("[v0] updateProduct error:", error)
    return { ok: false, code: "UNKNOWN", error: "No se pudo guardar el producto. Intenta de nuevo." }
  }
}

/** Elimina un producto. La confirmación se muestra en el cliente ANTES de llamar aquí. */
export async function deleteProduct(id: number): Promise<ActionResult<{ id: number }>> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, code: "VALIDATION", error: "Producto inválido." }
  }

  try {
    const supabase = createClient()
    const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq("id", id)
    if (error) throw error

    revalidatePath("/")
    return { ok: true, data: { id } }
  } catch (error) {
    console.log("[v0] deleteProduct error:", error)
    return { ok: false, code: "UNKNOWN", error: "No se pudo eliminar el producto. Intenta de nuevo." }
  }
}

/**
 * TASA GLOBAL: sobrescribe la tasa de TODOS los productos sin excepción
 * (incluidos los que tenían una tasa individual distinta) y recalcula sus 4 derivados.
 * El cálculo se hace en JS con calculateDerived para mantener una sola fuente de verdad.
 */
export async function applyGlobalRate(tasa: number): Promise<ActionResult<{ updated: number }>> {
  const nuevaTasa = Number(tasa)
  if (!Number.isFinite(nuevaTasa) || nuevaTasa <= 0) {
    return { ok: false, code: "VALIDATION", error: "La tasa global debe ser un número mayor que 0." }
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select("id, precio_usd, cantidad, porcentaje")
      .order("id", { ascending: true })

    if (error) throw error

    const rows = data ?? []
    if (rows.length === 0) {
      revalidatePath("/")
      return { ok: true, data: { updated: 0 } }
    }

    const payload = rows.map((row) => {
      const base = {
        precio_usd: Number(row.precio_usd),
        cantidad: Number(row.cantidad),
        porcentaje: Number(row.porcentaje),
        tasa: nuevaTasa,
      }
      return { id: Number(row.id), tasa: nuevaTasa, ...calculateDerived(base) }
    })

    // Upsert por lotes: requiere que products.id sea 'generated BY DEFAULT as identity'.
    for (let i = 0; i < payload.length; i += UPSERT_CHUNK_SIZE) {
      const chunk = payload.slice(i, i + UPSERT_CHUNK_SIZE)
      const { error: upsertError } = await supabase
        .from(PRODUCTS_TABLE)
        .upsert(chunk, { onConflict: "id" })
      if (upsertError) throw upsertError
    }

    revalidatePath("/")
    return { ok: true, data: { updated: payload.length } }
  } catch (error) {
    console.log("[v0] applyGlobalRate error:", error)
    return { ok: false, code: "UNKNOWN", error: "No se pudo aplicar la tasa global. Intenta de nuevo." }
  }
}
