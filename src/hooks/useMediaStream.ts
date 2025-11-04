import { useState, useEffect, useCallback } from 'react';
export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const getStream = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing media devices.", err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Permission to access camera and microphone was denied. Please allow access in your browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera or microphone found. Please connect a device and try again.');
        } else {
          setError(`An error occurred while accessing media devices: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred while accessing media devices.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);
  useEffect(() => {
    getStream();
    return () => {
      stopStream();
    };
  }, [getStream, stopStream]);
  return { stream, error, isLoading, getStream, stopStream };
}