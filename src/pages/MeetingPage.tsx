import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useRoomStore } from '@/stores/useRoomStore';
import { VideoTile } from '@/components/VideoTile';
import { ControlBar } from '@/components/ControlBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
export function MeetingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  // Local media stream management
  const { stream: initialStream, error, isLoading, getStream } = useMediaStream();
  // Zustand store selectors and actions
  const {
    localStream,
    remoteStreams,
    participants,
    isMuted,
    isCameraOff,
    setLocalStream,
    toggleMute,
    toggleCamera,
    reset,
  } = useRoomStore(s => ({
    localStream: s.localStream,
    remoteStreams: s.remoteStreams,
    participants: s.participants,
    isMuted: s.isMuted,
    isCameraOff: s.isCameraOff,
    setLocalStream: s.setLocalStream,
    toggleMute: s.toggleMute,
    toggleCamera: s.toggleCamera,
    reset: s.reset,
  }));
  // WebRTC hook
  const { mySessionId } = useWebRTC(roomId!);
  useEffect(() => {
    if (initialStream) {
      setLocalStream(initialStream);
    }
  }, [initialStream, setLocalStream]);
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      reset();
    };
  }, [reset]);
  const handleEndCall = () => {
    reset();
    navigate('/');
  };
  const allStreams = useMemo(() => {
    const streams = new Map<string, { stream: MediaStream | null, participant: { name: string } }>();
    // Add local user
    streams.set(mySessionId, {
      stream: localStream,
      participant: { name: 'You' },
    });
    // Add remote users
    participants.forEach(p => {
      if (p.sessionId !== mySessionId) {
        streams.set(p.sessionId, {
          stream: remoteStreams.get(p.sessionId) || null,
          participant: { name: p.name },
        });
      }
    });
    return Array.from(streams.entries());
  }, [localStream, remoteStreams, participants, mySessionId]);
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
  const gridCols = `grid-cols-${Math.min(Math.ceil(Math.sqrt(allStreams.length)), 3)}`;
  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-900 text-white">
      <div className="absolute inset-0 p-4 flex items-center justify-center">
        <div className={cn(
          "grid gap-4 w-full h-full max-w-6xl max-h-[calc(100vh-120px)]",
          `grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(allStreams.length, 3)}`,
          allStreams.length > 4 && 'lg:grid-rows-2'
        )}>
          {allStreams.map(([sessionId, { stream, participant }]) => (
            <VideoTile
              key={sessionId}
              stream={stream}
              name={participant.name}
              isLocal={sessionId === mySessionId}
              isMuted={sessionId === mySessionId && isMuted}
            />
          ))}
        </div>
      </div>
      <ControlBar
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onEndCall={handleEndCall}
      />
    </div>
  );
}