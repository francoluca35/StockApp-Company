'use client'

import { useEffect, useRef, useState } from 'react'
import { Scan } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  disabled?: boolean
}

export default function BarcodeScanner({ onScan, disabled }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isScanning && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isScanning])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current?.value) {
      onScan(inputRef.current.value)
      inputRef.current.value = ''
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-2">
      {!isScanning ? (
        <button
          type="button"
          onClick={() => setIsScanning(true)}
          disabled={disabled}
          className="btn-secondary flex items-center gap-2"
        >
          <Scan className="w-5 h-5" />
          Escanear Código de Barras
        </button>
      ) : (
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Escanea o ingresa el código de barras..."
            onKeyPress={handleKeyPress}
            onBlur={() => setIsScanning(false)}
            className="input-field font-mono"
            autoFocus
          />
          <p className="text-xs text-gray-500">
            Presiona Enter después de escanear
          </p>
        </div>
      )}
    </div>
  )
}

