import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, Participant, SignalMessage } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const durableObjectStub = (c: any) => c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
  app.post('/api/rooms/:roomId/join', async (c) => {
    const { roomId } = c.req.param();
    const participant = await c.req.json<{ sessionId: string, name: string }>();
    if (!participant || !participant.sessionId) {
      return c.json({ success: false, error: 'Session ID is required' }, 400);
    }
    const newParticipant: Participant = {
      id: participant.sessionId, // Using sessionId as unique ID for simplicity
      sessionId: participant.sessionId,
      name: participant.name || 'Guest',
    };
    const existingParticipants = await durableObjectStub(c).joinRoom(roomId, newParticipant);
    return c.json({ success: true, data: { participants: existingParticipants } });
  });
  app.post('/api/rooms/:roomId/leave', async (c) => {
    const { roomId } = c.req.param();
    const { sessionId } = await c.req.json<{ sessionId: string }>();
    if (!sessionId) {
      return c.json({ success: false, error: 'Session ID is required' }, 400);
    }
    await durableObjectStub(c).leaveRoom(roomId, sessionId);
    return c.json({ success: true });
  });
  app.post('/api/rooms/:roomId/signal', async (c) => {
    const { roomId } = c.req.param();
    const message = await c.req.json<SignalMessage>();
    await durableObjectStub(c).addSignalMessage(roomId, message);
    return c.json({ success: true });
  });
  app.get('/api/rooms/:roomId/signal', async (c) => {
    const { roomId } = c.req.param();
    const sessionId = c.req.query('sessionId');
    if (!sessionId) {
      return c.json({ success: false, error: 'Session ID is required' }, 400);
    }
    const messages = await durableObjectStub(c).getSignalMessages(roomId, sessionId);
    return c.json(messages);
  });
}