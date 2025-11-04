import React, { useEffect, useMemo, useRef } from 'react';
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
  const { stream: initialStream, error, isLoading, getStream } = useMediaStream();
  const localStream = useRoomStore(s => s.localStream);
  const remoteStreams = useRoomStore(s => s.remoteStreams);
  const participants = useRoomStore(s => s.participants);
  const isMuted = useRoomStore(s => s.isMuted);
  const isCameraOff = useRoomStore(s => s.isCameraOff);
  const setLocalStream = useRoomStore(s => s.setLocalStream);
  const toggleMute = useRoomStore(s => s.toggleMute);
  const toggleCamera = useRoomStore(s => s.toggleCamera);
  const reset = useRoomStore(s => s.reset);
  const activeSpeakerId = useRoomStore(s => s.activeSpeakerId);
  const setActiveSpeakerId = useRoomStore(s => s.setActiveSpeakerId);
  const { mySessionId } = useWebRTC(roomId!);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodesRef = useRef<Map<string, { analyser: AnalyserNode, dataArray: Uint8Array, source: MediaStreamAudioSourceNode }>>(new Map());
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (initialStream) {
      setLocalStream(initialStream);
    }
  }, [initialStream, setLocalStream]);
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
    }
    const audioContext = audioContextRef.current;
    const remoteStreamEntries = Array.from(remoteStreams.entries());
    remoteStreamEntries.forEach(([sessionId, stream]) => {
      if (!analyserNodesRef.current.has(sessionId) && stream.getAudioTracks().length > 0) {
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyserNodesRef.current.set(sessionId, { analyser, dataArray, source });
      }
    });
    const speakingInterval = setInterval(() => {
      let loudestParticipant: string | null = null;
      let maxVolume = -1;
      analyserNodesRef.current.forEach(({ analyser, dataArray }, sessionId) => {
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        if (volume > 20 && volume > maxVolume) { // Threshold to avoid background noise
          maxVolume = volume;
          loudestParticipant = sessionId;
        }
      });
      if (loudestParticipant !== activeSpeakerId) {
        setActiveSpeakerId(loudestParticipant);
        if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
        if (loudestParticipant) {
          speakingTimerRef.current = setTimeout(() => {
            setActiveSpeakerId(null);
          }, 2000); // Speaker indicator timeout
        }
      }
    }, 200); // Check every 200ms
    return () => {
      clearInterval(speakingInterval);
      if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
      analyserNodesRef.current.forEach(({ source }) => source.disconnect());
      analyserNodesRef.current.clear();
    };
  }, [remoteStreams, setActiveSpeakerId, activeSpeakerId]);
  useEffect(() => {
    return () => {
      reset();
      audioContextRef.current?.close();
    };
  }, [reset]);
  const handleEndCall = () => {
    navigate('/');
  };
  const allParticipants = useMemo(() => {
    const list = [
      { sessionId: mySessionId, name: 'You', stream: localStream, isLocal: true },
      ...participants
        .filter(p => p.sessionId !== mySessionId)
        .map(p => ({ sessionId: p.sessionId, name: p.name, stream: remoteStreams.get(p.sessionId) || null, isLocal: false }))
    ];
    return list;
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
              <AlertTriangle className="h-6 w-6" /> Media Access Error
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
  const getGridLayout = (count: number) => {
    if (count === 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    return "grid-cols-3 grid-rows-3";
  };
  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-900 text-white">
      <div className="absolute inset-0 p-4 flex items-center justify-center">
        <div className={cn(
          "grid gap-4 w-full h-full max-w-7xl max-h-[calc(100vh-120px)]",
          getGridLayout(allParticipants.length)
        )}>
          {allParticipants.map(({ sessionId, stream, name, isLocal }) => (
            <VideoTile
              key={sessionId}
              stream={stream}
              name={name}
              isLocal={isLocal}
              isMuted={isLocal && isMuted}
              isSpeaking={!isLocal && activeSpeakerId === sessionId}
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