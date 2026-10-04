"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";

export function WebcamModal({
  open,
  onOpenChange,
  onPhotoCaptured,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoCaptured: (file: File) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let isMounted = true;
    setIsInitializing(true);
    setError(null);
  /* eslint-enable react-hooks/set-state-in-effect */

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Webcam access is not supported by your browser");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsInitializing(false);
      } catch (err) {
        if (!isMounted) return;
        setIsInitializing(false);
        const message =
          err instanceof Error && err.name === "NotAllowedError"
            ? "Camera permission was denied. Please enable camera access in your browser settings to take a photo."
            : "Could not connect to webcam. Please check your camera connection or upload a photo instead.";
        setError(message);
      }
    }

    void startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [open]);

  function handleCapture() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `webcam_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        onOpenChange(false);
        onPhotoCaptured(file);
      },
      "image/jpeg",
      0.9,
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup
        className="max-w-lg p-6 rounded-3xl"
        data-testid="webcam-modal"
      >
        <div className="flex items-center justify-between mb-4">
          <DialogTitle className="text-lg">Take a Photo</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close camera"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
            data-testid="webcam-modal__close-button"
          >
            <X className="size-5" />
          </button>
        </div>

        {error ? (
          <div
            className="flex flex-col items-center justify-center gap-4 py-8 text-center"
            data-testid="webcam-modal__error-state"
          >
            <p className="text-sm text-destructive max-w-sm">{error}</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setError(null);
                setIsInitializing(true);
                // Trigger re-init
                onOpenChange(false);
                setTimeout(() => onOpenChange(true), 100);
              }}
              className="gap-2"
              data-testid="webcam-modal__retry-button"
            >
              <RefreshCw className="size-4" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="size-full object-cover"
                data-testid="webcam-modal__video"
              />
              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs uppercase tracking-wider">
                  Starting camera…
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={handleCapture}
              disabled={isInitializing}
              className="w-full gap-2 rounded-xl py-3"
              data-testid="webcam-modal__capture-button"
            >
              <Camera className="size-4" />
              Capture Photo
            </Button>
          </div>
        )}
      </DialogPopup>
    </Dialog>
  );
}
