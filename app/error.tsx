'use client'

import { useEffect } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.log('[v0] app error:', error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <TriangleAlert className="size-8 text-muted-foreground" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl text-foreground">Algo salió mal</h1>
        <p className="max-w-sm text-pretty text-sm text-muted-foreground">
          Ocurrió un error al cargar el inventario. Intenta de nuevo.
        </p>
      </div>
      <Button type="button" onClick={() => reset()}>
        Reintentar
      </Button>
    </main>
  )
}
