import { useRef, useState, useEffect } from 'react'
import { Camera, Image, X, Trash2 } from 'lucide-react'

export default function PhotoPicker({ isOpen, onClose, currentPhoto, onUpload, onRemove, isUploading }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      setShowCamera(false)
      setCameraError('')
    }
  }, [isOpen])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const startCamera = async () => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      setShowCamera(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 50)
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permissions and try again.')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
        onUpload(file)
      }
      stopCamera()
      setShowCamera(false)
      onClose()
    }, 'image/jpeg', 0.9)
  }

  const handleFileSelect = (file) => {
    if (!file) return
    onUpload(file)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!showCamera ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">Set Photo</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-text-muted hover:bg-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-surface px-4 py-4 text-sm font-semibold text-text-primary transition hover:bg-surface/80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Image size={20} />
                </div>
                <div className="text-left">
                  <p>Choose from Gallery</p>
                  <p className="text-xs font-normal text-text-muted">Select an existing photo</p>
                </div>
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-surface px-4 py-4 text-sm font-semibold text-text-primary transition hover:bg-surface/80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Camera size={20} />
                </div>
                <div className="text-left">
                  <p>Take Photo</p>
                  <p className="text-xs font-normal text-text-muted">Capture with camera</p>
                </div>
              </button>

              {cameraError && (
                <p className="text-xs text-danger text-center">{cameraError}</p>
              )}

              {currentPhoto && (
                <button
                  type="button"
                  onClick={() => { onRemove(); onClose(); }}
                  disabled={isUploading}
                  className="flex w-full items-center gap-3 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-4 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
                    <Trash2 size={20} />
                  </div>
                  <div className="text-left">
                    <p>Remove Photo</p>
                    <p className="text-xs font-normal text-text-muted">Use initials instead</p>
                  </div>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">Take Photo</h3>
              <button
                type="button"
                onClick={() => { stopCamera(); setShowCamera(false); }}
                className="rounded-full p-1 text-text-muted hover:bg-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <button
              type="button"
              onClick={capturePhoto}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-success to-emerald-600 py-4 text-base font-bold text-white shadow-lg transition active:scale-95"
            >
              <Camera size={20} />
              Capture Photo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
