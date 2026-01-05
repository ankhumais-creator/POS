import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, X, Flashlight } from 'lucide-react'

interface BarcodeScannerProps {
    onScan: (barcode: string) => void
    onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [error, setError] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const streamRef = useRef<MediaStream | null>(null)

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
    }, [])

    useEffect(() => {
        let mounted = true

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                })

                if (!mounted) {
                    stream.getTracks().forEach(track => track.stop())
                    return
                }

                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    setIsScanning(true)
                }
            } catch (err) {
                console.error('Camera error:', err)
                setError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.')
            }
        }

        startCamera()

        return () => {
            mounted = false
            stopCamera()
        }
    }, [stopCamera])

    // Simple barcode detection using canvas
    // For production, consider using @aspect-analytics/javascript-barcode-reader or similar
    useEffect(() => {
        if (!isScanning) return

        let animationId: number
        let lastScan = ''
        let scanCount = 0

        const detectBarcode = async () => {
            if (!videoRef.current || !canvasRef.current) {
                animationId = requestAnimationFrame(detectBarcode)
                return
            }

            const video = videoRef.current
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')

            if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
                animationId = requestAnimationFrame(detectBarcode)
                return
            }

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0)

            // Use BarcodeDetector API if available (Chrome, Edge)
            if ('BarcodeDetector' in window) {
                try {
                    // @ts-ignore - BarcodeDetector is not in TS types yet
                    const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code'] })
                    const barcodes = await detector.detect(canvas)

                    if (barcodes.length > 0) {
                        const barcode = barcodes[0].rawValue

                        // Require same barcode detected 3 times for stability
                        if (barcode === lastScan) {
                            scanCount++
                            if (scanCount >= 3) {
                                stopCamera()
                                onScan(barcode)
                                return
                            }
                        } else {
                            lastScan = barcode
                            scanCount = 1
                        }
                    }
                } catch (err) {
                    // Barcode detection error
                }
            }

            animationId = requestAnimationFrame(detectBarcode)
        }

        detectBarcode()

        return () => {
            cancelAnimationFrame(animationId)
        }
    }, [isScanning, onScan, stopCamera])

    const handleClose = () => {
        stopCamera()
        onClose()
    }

    // Manual input fallback
    const [manualInput, setManualInput] = useState('')

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (manualInput.trim()) {
            stopCamera()
            onScan(manualInput.trim())
        }
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Camera className="w-5 h-5 text-blue-400" />
                        Scan Barcode
                    </h3>
                    <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="modal-body space-y-4">
                    {error ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    ) : (
                        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Scan guide overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-64 h-24 border-2 border-blue-400 rounded-lg">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400" />
                                </div>
                            </div>

                            {isScanning && (
                                <div className="absolute bottom-2 left-0 right-0 text-center">
                                    <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                                        Arahkan barcode ke dalam kotak
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Manual input fallback */}
                    <div className="border-t border-slate-700 pt-4">
                        <p className="text-sm text-slate-400 mb-2">Atau masukkan barcode manual:</p>
                        <form onSubmit={handleManualSubmit} className="flex gap-2">
                            <input
                                type="text"
                                className="input flex-1"
                                placeholder="Masukkan kode barcode..."
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                autoFocus={!!error}
                            />
                            <button type="submit" className="btn btn-primary">
                                Cari
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
