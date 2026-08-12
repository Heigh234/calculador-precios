"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBs } from "@/lib/format"
import type { Product } from "@/lib/types"

type ProductCardProps = {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div
      className="group relative flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-card p-5 text-left transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_var(--border),0_8px_24px_-12px_rgb(0_0_0/0.18)] focus-within:ring-1 focus-within:ring-ring"
    >
      <button
        type="button"
        onClick={() => onEdit(product)}
        className="flex flex-col gap-3 text-left outline-none"
      >
        <h3 className="font-display text-xl text-balance leading-tight text-foreground">
          {product.nombre}
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className="num text-4xl font-light leading-none text-foreground md:text-5xl">
            {formatBs(product.valor_final_unidad_bs).replace(" Bs", "")}
          </span>
          <span className="text-sm text-muted-foreground">Bs</span>
        </div>
      </button>

      <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(product)}
        >
          <Pencil />
          <span className="sr-only">Editar {product.nombre}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(product)}
        >
          <Trash2 />
          <span className="sr-only">Eliminar {product.nombre}</span>
        </Button>
      </div>
    </div>
  )
}
