'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const isEnvError = error.message.includes('Missing Supabase environment variables')

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="card max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold">Error</h2>
        </div>
        
        {isEnvError ? (
          <div className="space-y-4">
            <p className="text-gray-300">{error.message}</p>
            <div className="bg-dark-surface-light p-4 rounded-lg border border-dark-border">
              <p className="text-sm text-gray-400 mb-2">Para solucionar esto:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                <li>Crea un archivo <code className="bg-dark-bg px-1 rounded">.env.local</code> en la raíz del proyecto</li>
                <li>Agrega las siguientes variables:</li>
              </ol>
              <pre className="mt-3 p-3 bg-dark-bg rounded text-xs text-gray-300 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key`}
              </pre>
              <p className="text-xs text-gray-500 mt-3">
                Ver <code className="bg-dark-bg px-1 rounded">SETUP.md</code> para más detalles
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-300">{error.message}</p>
            <button
              onClick={reset}
              className="btn-primary w-full"
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

