import { AppHeader } from '@/components/inventory/app-header'
import { InventoryView } from '@/components/inventory/inventory-view'
import { getProducts } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const products = await getProducts()

  return (
    <main>
      <AppHeader total={products.length} />
      <InventoryView initialProducts={products} />
    </main>
  )
}
