"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
}

export default function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(true)
  const [manualBarcode, setManualBarcode] = useState("")

  // Simulación de escaneo para demostración
  const simulateScan = () => {
    // Generar un código de barras aleatorio para demostración
    const randomBarcode = "750" + Math.floor(Math.random() * 10000000000)
    onDetected(randomBarcode)
  }

  // Entrada manual de código de barras
  const handleManualEntry = () => {
    if (manualBarcode.trim()) {
      onDetected(manualBarcode)
    }
  }

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      setIsLoading(true)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setHasPermission(true)
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        setHasPermission(false)
      } finally {
        setIsLoading(false)
      }
    }

    startCamera()

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // En un entorno real, aquí implementaríamos la detección de códigos de barras
  // usando una biblioteca como quagga.js o zbar.wasm

  return (
    <div className="flex flex-col items-center gap-4">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p>Iniciando cámara...</p>
        </div>
      ) : hasPermission ? (
        <>
          <div className="relative w-full max-w-sm aspect-video bg-black rounded-lg overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-2 border-red-500 opacity-50 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500"></div>
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground">Alinea el código de barras con la línea roja</p>
          <Button onClick={simulateScan} className="w-full">
            Simular Escaneo (Demo)
          </Button>
          <div className="flex w-full gap-2 mt-2">
            <input
              type="text"
              placeholder="Ingresa código manualmente"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button onClick={handleManualEntry} variant="outline">
              Ingresar
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">No se pudo acceder a la cámara</p>
          <p className="text-sm text-muted-foreground mb-4">
            Por favor, permite el acceso a la cámara o ingresa el código manualmente
          </p>
          <div className="flex w-full gap-2">
            <input
              type="text"
              placeholder="Ingresa código manualmente"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button onClick={handleManualEntry} variant="outline">
              Ingresar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
