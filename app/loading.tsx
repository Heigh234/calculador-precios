import { ProductGridSkeleton } from "@/components/inventory/product-grid-skeleton"

export default function Loading() {
  return (
    <main>
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-6 md:px-6 md:py-8">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="font-display text-4xl leading-none text-balance text-foreground md:text-5xl">
              Inventario
            </h1>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Gestión de bodega
          </p>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        <ProductGridSkeleton />
      </div>
    </main>
  )
}
