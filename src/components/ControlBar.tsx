import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
interface ControlBarProps {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
}
export function ControlBar({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onEndCall,
}: ControlBarProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-6">
      <div className="flex items-center justify-center gap-4 rounded-full bg-card/80 p-3 shadow-lg backdrop-blur-md border">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isMuted ? 'destructive' : 'secondary'}
                size="icon"
                className="rounded-full h-14 w-14"
                onClick={onToggleMute}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMuted ? 'Unmute' : 'Mute'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isCameraOff ? 'destructive' : 'secondary'}
                size="icon"
                className="rounded-full h-14 w-14"
                onClick={onToggleCamera}
              >
                {isCameraOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isCameraOff ? 'Start Video' : 'Stop Video'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700"
                onClick={onEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>End Call</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}