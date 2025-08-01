import type { Express } from "express";
import path from "path";

export function registerEmbedRoutes(app: Express) {
  // Serve embed player page
  app.get('/embed/:streamKey', (req, res) => {
    const { streamKey } = req.params;
    const {
      autoplay = 'false',
      muted = 'true',
      controls = 'true',
      theme = 'dark',
      logo = 'false',
      branding = 'true'
    } = req.query;

    const embedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StreamVibe Player</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: ${theme === 'dark' ? '#000' : '#fff'};
            color: ${theme === 'dark' ? '#fff' : '#000'};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            overflow: hidden;
        }
        .player-container {
            position: relative;
            width: 100%;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .video-player {
            width: 100%;
            height: 100%;
            background: #000;
            object-fit: cover;
        }
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255,255,255,0.1);
            border-left: 4px solid #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .live-indicator {
            position: absolute;
            top: 16px;
            left: 16px;
            background: #ef4444;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
            z-index: 10;
        }
        .live-dot {
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .branding {
            position: absolute;
            bottom: 16px;
            right: 16px;
            font-size: 12px;
            opacity: 0.7;
            z-index: 10;
        }
        .error {
            text-align: center;
            padding: 32px;
        }
        .custom-controls {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.7));
            padding: 16px;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .player-container:hover .custom-controls {
            opacity: 1;
        }
        .controls-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: white;
        }
        .control-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 8px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        .control-btn:hover {
            background: rgba(255,255,255,0.2);
        }
    </style>
</head>
<body>
    <div class="player-container">
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Loading stream...</p>
        </div>
        
        <video 
            id="video-player" 
            class="video-player" 
            ${autoplay === 'true' ? 'autoplay' : ''}
            ${muted === 'true' ? 'muted' : ''}
            ${controls === 'true' ? 'controls' : ''}
            playsinline
            style="display: none;"
        >
            <source src="/hls/${streamKey}/index.m3u8" type="application/x-mpegURL">
            <source src="/dash/${streamKey}/index.mpd" type="application/dash+xml">
            <p>Your browser does not support the video tag.</p>
        </video>
        
        <div class="live-indicator" id="live-indicator" style="display: none;">
            <div class="live-dot"></div>
            LIVE
        </div>
        
        ${branding === 'true' ? '<div class="branding">Powered by StreamVibe</div>' : ''}
        
        ${controls === 'false' ? `
        <div class="custom-controls">
            <div class="controls-bar">
                <div>
                    <button class="control-btn" onclick="togglePlay()">⏯️</button>
                    <button class="control-btn" onclick="toggleMute()">🔊</button>
                </div>
                <div>
                    <button class="control-btn" onclick="toggleFullscreen()">⛶</button>
                </div>
            </div>
        </div>
        ` : ''}
        
        <div class="error" id="error" style="display: none;">
            <h3>Stream Unavailable</h3>
            <p>The stream is currently offline or unavailable.</p>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <script>
        const video = document.getElementById('video-player');
        const loading = document.getElementById('loading');
        const liveIndicator = document.getElementById('live-indicator');
        const error = document.getElementById('error');
        
        let hls;
        let isLive = false;
        
        function initPlayer() {
            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                
                hls.loadSource('/hls/${streamKey}/index.m3u8');
                hls.attachMedia(video);
                
                hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                    console.log('Media attached');
                });
                
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log('Manifest parsed');
                    loading.style.display = 'none';
                    video.style.display = 'block';
                    liveIndicator.style.display = 'flex';
                    isLive = true;
                    
                    if (${autoplay === 'true'}) {
                        video.play().catch(e => console.log('Autoplay failed:', e));
                    }
                });
                
                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS Error:', data);
                    if (data.fatal) {
                        showError();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Safari native HLS support
                video.src = '/hls/${streamKey}/index.m3u8';
                video.addEventListener('loadedmetadata', () => {
                    loading.style.display = 'none';
                    video.style.display = 'block';
                    liveIndicator.style.display = 'flex';
                    isLive = true;
                });
                video.addEventListener('error', showError);
            } else {
                showError();
            }
        }
        
        function showError() {
            loading.style.display = 'none';
            video.style.display = 'none';
            liveIndicator.style.display = 'none';
            error.style.display = 'block';
        }
        
        function togglePlay() {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
        
        function toggleMute() {
            video.muted = !video.muted;
        }
        
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
        
        // Initialize player
        initPlayer();
        
        // Check stream status periodically
        setInterval(async () => {
            try {
                const response = await fetch('/api/streams/${streamKey}/status');
                const data = await response.json();
                if (!data.isLive && isLive) {
                    showError();
                    isLive = false;
                } else if (data.isLive && !isLive) {
                    location.reload(); // Restart player
                }
            } catch (e) {
                console.log('Status check failed');
            }
        }, 30000);
        
        // Send analytics
        video.addEventListener('play', () => {
            fetch('/api/streams/${streamKey}/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'play', timestamp: Date.now() })
            });
        });
        
        video.addEventListener('pause', () => {
            fetch('/api/streams/${streamKey}/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'pause', timestamp: Date.now() })
            });
        });
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(embedHtml);
  });

  // API endpoints for embed functionality
  app.get('/api/streams/:streamKey/status', async (req, res) => {
    try {
      const { streamKey } = req.params;
      // Check if stream is live (implement based on your RTMP server)
      const isLive = false; // Replace with actual check
      res.json({ isLive, streamKey });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check stream status' });
    }
  });

  app.get('/api/streams/:streamKey/hls', (req, res) => {
    const { streamKey } = req.params;
    const hlsUrl = `/hls/${streamKey}/index.m3u8`;
    res.json({ url: hlsUrl });
  });

  app.get('/api/streams/:streamKey/dash', (req, res) => {
    const { streamKey } = req.params;
    const dashUrl = `/dash/${streamKey}/index.mpd`;
    res.json({ url: dashUrl });
  });

  app.post('/api/streams/:streamKey/analytics', (req, res) => {
    const { streamKey } = req.params;
    const { event, timestamp } = req.body;
    
    // Store analytics data (implement based on your needs)
    console.log(`Analytics: ${event} for stream ${streamKey} at ${timestamp}`);
    
    res.json({ success: true });
  });

  // HLS/DASH stream endpoints (placeholder - implement with actual streaming server)
  app.get('/hls/:streamKey/:file', (req, res) => {
    const { streamKey, file } = req.params;
    // Serve HLS files from your streaming server
    res.status(404).json({ error: 'HLS stream not available' });
  });

  app.get('/dash/:streamKey/:file', (req, res) => {
    const { streamKey, file } = req.params;
    // Serve DASH files from your streaming server
    res.status(404).json({ error: 'DASH stream not available' });
  });
}