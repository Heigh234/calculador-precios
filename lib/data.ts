import "server-only"
import { createClient } from "@/lib/supabase/server"
import { toFiniteNumber } from "@/lib/calculations"
import type { Product } from "@/lib/types"

export const PRODUCTS_TABLE = "products"

export const PRODUCT_COLUMNS =
  "id, nombre, precio_usd, cantidad, porcentaje, tasa, precio_bs, valor_mas_porcentaje, valor_final_unidad_bs, valor_final_unidad_usd, created_at"

/** Convierte una fila cruda de Postgres (numeric -> string) en un Product tipado. */
export function mapProductRow(row: Record<string, unknown>): Product {
  return {
    id: toFiniteNumber(row.id),
    nombre: String(row.nombre ?? ""),
    precio_usd: toFiniteNumber(row.precio_usd),
    cantidad: toFiniteNumber(row.cantidad),
    porcentaje: toFiniteNumber(row.porcentaje),
    tasa: toFiniteNumber(row.tasa),
    precio_bs: toFiniteNumber(row.precio_bs),
    valor_mas_porcentaje: toFiniteNumber(row.valor_mas_porcentaje),
    valor_final_unidad_bs: toFiniteNumber(row.valor_final_unidad_bs),
    valor_final_unidad_usd: toFiniteNumber(row.valor_final_unidad_usd),
    created_at: String(row.created_at ?? ""),
  }
}

/**
 * Todos los productos en ORDEN DE INSERCIÓN (id ascendente).
 * No cambiar el criterio de orden: el orden estático es un requisito del producto.
 */
export async function getProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select(PRODUCT_COLUMNS)
    .order("id", { ascending: true })

  if (error) {
    console.log("[v0] getProducts error:", error.message)
    throw new Error("No se pudo cargar el inventario.")
  }

  return (data ?? []).map((row) => mapProductRow(row as Record<string, unknown>))
}

/** Cuenta productos con el mismo nombre (case-insensitive) para la advertencia de duplicado. */
export async function countByName(nombre: string): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select("id", { count: "exact", head: true })
    .ilike("nombre", nombre.trim())

  if (error) {
    console.log("[v0] countByName error:", error.message)
    return 0
  }

  return count ?? 0
}
