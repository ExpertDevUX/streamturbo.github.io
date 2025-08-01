import NodeMediaServer from 'node-media-server';
import { storage } from './storage';
import { WebSocketServer } from 'ws';

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8889, // Changed to avoid conflict with port 8888
    allow_origin: '*',
    mediaroot: './media'
  },
  relay: {
    ffmpeg: '/usr/local/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        mode: 'push',
        edge: 'rtmp://127.0.0.1/hls'
      }
    ]
  }
};

export class RTMPStreamingServer {
  private nms: any;
  private wss: WebSocketServer | null = null;

  constructor() {
    this.nms = new NodeMediaServer(config);
    this.setupEventHandlers();
  }

  setWebSocketServer(wss: WebSocketServer) {
    this.wss = wss;
  }

  private setupEventHandlers() {
    this.nms.on('preConnect', (id: string, args: any) => {
      console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
    });

    this.nms.on('postConnect', (id: string, args: any) => {
      console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
    });

    this.nms.on('doneConnect', (id: string, args: any) => {
      console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
    });

    this.nms.on('prePublish', async (id: string, StreamPath: string, args: any) => {
      console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
      
      // Extract stream key from path (format: /live/STREAM_KEY)
      const streamKey = StreamPath.split('/').pop();
      if (!streamKey) {
        console.log('Invalid stream path, rejecting');
        return;
      }

      try {
        // Validate stream key and get user
        const user = await storage.getUserByStreamKey(streamKey);
        if (!user) {
          console.log('Invalid stream key, rejecting stream');
          const session = this.nms.getSession(id);
          session.reject();
          return;
        }

        // Create or update stream record
        await storage.startStream(user.id, {
          title: `${user.username}'s Live Stream`,
          categoryId: null,
          description: '',
          language: 'en',
          tags: [],
        });

        console.log(`✅ REAL RTMP STREAM STARTED for user ${user.username}`);
        console.log(`📺 Stream Key: ${streamKey}`);
        console.log(`🔗 RTMP URL: rtmp://localhost:1935/live/`);
        console.log(`🌐 Playback URL: http://localhost:8889/live/${streamKey}.flv`);
        
        // Notify WebSocket clients about stream start
        if (this.wss) {
          this.wss.clients.forEach((client) => {
            if (client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify({
                type: 'stream_started',
                userId: user.id,
                username: user.username,
                streamKey: streamKey
              }));
            }
          });
        }
        
        // Broadcast stream start via WebSocket
        this.broadcastStreamUpdate(user.id, 'started');
      } catch (error) {
        console.error('Error handling prePublish:', error);
        const session = this.nms.getSession(id);
        session.reject();
      }
    });

    this.nms.on('postPublish', async (id: string, StreamPath: string, args: any) => {
      console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    });

    this.nms.on('donePublish', async (id: string, StreamPath: string, args: any) => {
      console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
      
      const streamKey = StreamPath.split('/').pop();
      if (!streamKey) return;

      try {
        const user = await storage.getUserByStreamKey(streamKey);
        if (user) {
          await storage.endStream(user.id);
          console.log(`Stream ended for user ${user.username}`);
          
          // Broadcast stream end via WebSocket
          this.broadcastStreamUpdate(user.id, 'ended');
        }
      } catch (error) {
        console.error('Error handling donePublish:', error);
      }
    });

    this.nms.on('prePlay', (id: string, StreamPath: string, args: any) => {
      console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    });

    this.nms.on('postPlay', (id: string, StreamPath: string, args: any) => {
      console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    });

    this.nms.on('donePlay', (id: string, StreamPath: string, args: any) => {
      console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    });
  }

  private broadcastStreamUpdate(userId: string, event: 'started' | 'ended') {
    if (!this.wss) return;

    const message = JSON.stringify({
      type: 'stream_update',
      userId,
      event,
      timestamp: new Date().toISOString(),
    });

    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  start() {
    this.nms.run();
    console.log('RTMP Server started on port 1935');
    console.log('HTTP Server started on port 8888');
  }

  stop() {
    this.nms.stop();
  }
}

export const rtmpServer = new RTMPStreamingServer();
