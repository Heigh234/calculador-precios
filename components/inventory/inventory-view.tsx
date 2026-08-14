"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddProductDialog } from "@/components/inventory/add-product-dialog"
import { DeleteProductDialog } from "@/components/inventory/delete-product-dialog"
import { EditProductDialog } from "@/components/inventory/edit-product-dialog"
import { EmptyState } from "@/components/inventory/empty-state"
import { GlobalRateBar } from "@/components/inventory/global-rate-bar"
import { ProductGrid } from "@/components/inventory/product-grid"
import { SearchInput } from "@/components/inventory/search-input"
import { normalizeName } from "@/lib/validation"
import type { Product } from "@/lib/types"

type InventoryViewProps = {
  initialProducts: Product[]
}

export function InventoryView({ initialProducts }: InventoryViewProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [query, setQuery] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeName(query)
    if (normalizedQuery === "") return products
    return products.filter((product) => normalizeName(product.nombre).includes(normalizedQuery))
  }, [products, query])

  function handleCreated(product: Product) {
    setProducts((prev) => [...prev, product])
  }

  function handleUpdated(product: Product) {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)))
  }

  function handleDeleted(id: number) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setDeletingProduct(null)
  }

  function handleGlobalRateApplied(updatedProducts: Product[]) {
    setProducts(updatedProducts)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
      <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border bg-background/80 py-4 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchInput value={query} onChange={setQuery} />
          <Button type="button" onClick={() => setAddOpen(true)} className="shrink-0">
            <Plus data-icon="inline-start" />
            Agregar producto
          </Button>
        </div>
        {products.length > 0 && (
          <GlobalRateBar productCount={products.length} onApplied={handleGlobalRateApplied} />
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState variant="empty" onAdd={() => setAddOpen(true)} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState variant="no-results" query={query} />
      ) : (
        <ProductGrid
          products={filteredProducts}
          onEdit={setEditingProduct}
          onDelete={setDeletingProduct}
        />
      )}

      <AddProductDialog open={addOpen} onOpenChange={setAddOpen} onCreated={handleCreated} />

      <EditProductDialog
        product={editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        onUpdated={handleUpdated}
      />

      <DeleteProductDialog
        product={deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
