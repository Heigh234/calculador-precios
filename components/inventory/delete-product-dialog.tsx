"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { deleteProduct } from "@/app/actions/products"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Product } from "@/lib/types"

type DeleteProductDialogProps = {
  product: Product | null
  onOpenChange: (open: boolean) => void
  onDeleted: (id: number) => void
}

export function DeleteProductDialog({ product, onOpenChange, onDeleted }: DeleteProductDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (!product) return
    const id = product.id
    startTransition(async () => {
      const res = await deleteProduct(id)
      if (res.ok) {
        onDeleted(id)
        toast.success("Producto eliminado")
        onOpenChange(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <AlertDialog open={product !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar {product ? `«${product.nombre}»` : "este producto"}? Esta
            acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
