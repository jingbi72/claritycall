import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useMediaStream } from '@/hooks/useMediaStream';
import { VideoTile } from '@/components/VideoTile';
import { ControlBar } from '@/components/ControlBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
export function MeetingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { stream, error, isLoading, getStream } = useMediaStream();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const localStream = useMemo(() => {
    if (!stream) return null;
    if (isCameraOff) {
      // Return a stream with only audio if camera is off
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        return new MediaStream(audioTracks);
      }
      return null;
    }
    return stream;
  }, [stream, isCameraOff]);
  const handleToggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  };
  const handleToggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(prev => !prev);
    }
  };
  const handleEndCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate('/');
  };
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Setting up your call...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              Media Access Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={getStream}>Try Again</Button>
              <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-900 text-white">
      <div className="absolute inset-0 p-4">
        <div className="grid h-full w-full grid-cols-1 grid-rows-1 gap-4">
          <VideoTile stream={localStream} name="You" isLocal={true} isMuted={isMuted} />
        </div>
      </div>
      <ControlBar
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMute={handleToggleMute}
        onToggleCamera={handleToggleCamera}
        onEndCall={handleEndCall}
      />
    </div>
  );
}