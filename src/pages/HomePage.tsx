import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';
export function HomePage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const createNewMeeting = async () => {
    setIsCreating(true);
    try {
      // In a real app, you might hit an API endpoint to create/validate a room
      // For now, we just generate a UUID on the client.
      // The previous implementation used a POST to /api/rooms which was removed.
      // Let's stick to client-side generation for simplicity as per original intent.
      const { v4: uuidv4 } = await import('uuid');
      const newRoomId = uuidv4();
      navigate(`/room/${newRoomId}`);
    } catch (error) {
      console.error("Failed to create meeting", error);
      toast.error('Could not create a new meeting. Please try again.');
      setIsCreating(false);
    }
  };
  const joinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    } else {
      toast.error('Please enter a valid Room ID.');
    }
  };
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background font-sans">
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-50 dark:bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-400 opacity-20 blur-[100px]"></div>
      </div>
      <ThemeToggle className="absolute top-6 right-6" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen flex-col items-center justify-center py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-slate-50 dark:to-slate-400">
              ClarityCall
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground md:text-xl">
              Minimalist, visually stunning video calls. Simple, secure, and instant communication.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 w-full max-w-md"
          >
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle>Start or Join a Meeting</CardTitle>
                <CardDescription>No sign-ups required. Just create and share.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  size="lg"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base py-6 transition-all duration-300 transform hover:scale-105"
                  onClick={createNewMeeting}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Video className="mr-2 h-5 w-5" />
                  )}
                  Create New Meeting
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or join with a code
                    </span>
                  </div>
                </div>
                <form onSubmit={joinMeeting} className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="h-12 text-base"
                  />
                  <Button type="submit" size="lg" variant="outline" className="h-12">
                    <LogIn className="h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <footer className="absolute bottom-8 w-full text-center text-muted-foreground/80">
        <p>Built with ❤️ at Cloudflare</p>
      </footer>
      <Toaster richColors closeButton />
    </div>
  );
}