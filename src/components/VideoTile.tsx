import React, { useEffect, useRef } from 'react';
import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
interface VideoTileProps {
  stream: MediaStream | null;
  name: string;
  isLocal?: boolean;
  isMuted?: boolean;
}
export function VideoTile({ stream, name, isLocal = false, isMuted = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <Card className="relative aspect-video w-full overflow-hidden rounded-lg bg-card shadow-md transition-all duration-300">
      <CardContent className="p-0 h-full w-full">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className={cn(
              "h-full w-full object-cover",
              isLocal && "transform -scale-x-100"
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <User className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <span className="font-medium text-white drop-shadow-md">{name}</span>
        </div>
      </CardContent>
    </Card>
  );
}