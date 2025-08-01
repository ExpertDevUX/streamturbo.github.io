import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Square, Eye, EyeOff, Wifi, WifiOff, Monitor, Upload, Settings, Volume2, VolumeX, Maximize, RotateCcw, Image } from "lucide-react";
import { useTranslation } from "@/contexts/translation-context";

interface RTMPPreviewProps {
  streamKey: string;
  isLive?: boolean;
  onStreamStart?: () => void;
  onStreamStop?: () => void;
}

export function RTMPPreview({ streamKey, isLive = false, onStreamStart, onStreamStop }: RTMPPreviewProps) {
  const { t } = useTranslation();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [logoEnabled, setLogoEnabled] = useState(false);
  const [logoPosition, setLogoPosition] = useState('top-right');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [autoEncoding, setAutoEncoding] = useState({
    hls: true,
    dash: true,
    quality: '1080p'
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated stream preview (in a real implementation, this would connect to your RTMP stream)
  const handlePreviewToggle = () => {
    if (!isPreviewVisible) {
      setConnectionStatus('connecting');
      setPreviewError(null);
      
      // Simulate connection attempt
      setTimeout(() => {
        if (isLive) {
          setConnectionStatus('connected');
          setIsPreviewVisible(true);
          
          // In a real implementation, you would:
          // 1. Connect to your RTMP stream via HLS/WebRTC
          // 2. Display the actual video feed
          // Example: videoRef.current.src = `https://your-domain.com/hls/${streamKey}/index.m3u8`;
        } else {
          setConnectionStatus('disconnected');
          setPreviewError(t('creator.rtmp.preview.noStream'));
        }
      }, 1500);
    } else {
      setIsPreviewVisible(false);
      setConnectionStatus('disconnected');
      if (videoRef.current) {
        videoRef.current.src = '';
      }
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return t('creator.rtmp.preview.connected');
      case 'connecting': return t('creator.rtmp.preview.connecting');
      default: return t('creator.rtmp.preview.disconnected');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 border-purple-200 dark:border-gray-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            {t('creator.rtmp.preview.title')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`} />
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
              {getConnectionStatusText()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Enhanced Preview Window */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video group">
          {isPreviewVisible && !previewError ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                controls={showControls}
                muted={isMuted}
                poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgZmlsbD0iIzFhMWExYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2YjdiODUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5MaXZlIFN0cmVhbSBQcmV2aWV3PC90ZXh0Pgo8L3N2Zz4K"
              >
                {t('creator.rtmp.preview.notSupported')}
              </video>
              
              {/* Custom Logo Overlay */}
              {logoEnabled && logoFile && (
                <div className={`absolute ${logoPosition === 'top-left' ? 'top-4 left-4' : 
                  logoPosition === 'top-right' ? 'top-4 right-4' :
                  logoPosition === 'bottom-left' ? 'bottom-4 left-4' : 
                  'bottom-4 right-4'} z-10`}>
                  <img 
                    src={URL.createObjectURL(logoFile)} 
                    alt="Stream Logo" 
                    className="w-16 h-16 object-contain opacity-80"
                  />
                </div>
              )}
              
              {/* Custom Video Controls */}
              {!showControls && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {connectionStatus === 'connecting' ? (
                <div className="text-center text-white">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
                  <p>{t('creator.rtmp.preview.connecting')}</p>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Monitor className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>{t('creator.rtmp.preview.noPreview')}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Live Indicator */}
          {isLive && isPreviewVisible && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white px-2 py-1 rounded-md text-sm font-medium z-20">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          )}
          
          {/* Encoding Status */}
          {autoEncoding.hls || autoEncoding.dash ? (
            <div className="absolute top-3 right-3 bg-green-600/90 text-white px-2 py-1 rounded-md text-xs font-medium z-20">
              Auto-Encoding: {autoEncoding.hls ? 'HLS' : ''} {autoEncoding.dash ? 'DASH' : ''}
            </div>
          ) : null}
        </div>

        {/* Error Message */}
        {previewError && (
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>{previewError}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={handlePreviewToggle}
              variant={isPreviewVisible ? "destructive" : "default"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isPreviewVisible ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  {t('creator.rtmp.preview.hide')}
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  {t('creator.rtmp.preview.show')}
                </>
              )}
            </Button>
            
            {isLive ? (
              <Button
                onClick={onStreamStop}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                {t('creator.rtmp.preview.stop')}
              </Button>
            ) : (
              <Button
                onClick={onStreamStart}
                variant="default"
                size="sm"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4" />
                {t('creator.rtmp.preview.start')}
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {isLive ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span>{isLive ? t('creator.rtmp.preview.streaming') : t('creator.rtmp.preview.offline')}</span>
          </div>
        </div>

        {/* Advanced Controls */}
        <div className="space-y-4">
          {/* Encoding Settings */}
          <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Auto-Encoding Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="hls-toggle" className="text-sm">HLS Streaming</Label>
                <Switch
                  id="hls-toggle"
                  checked={autoEncoding.hls}
                  onCheckedChange={(checked) => setAutoEncoding(prev => ({ ...prev, hls: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dash-toggle" className="text-sm">DASH Streaming</Label>
                <Switch
                  id="dash-toggle"
                  checked={autoEncoding.dash}
                  onCheckedChange={(checked) => setAutoEncoding(prev => ({ ...prev, dash: checked }))}
                />
              </div>
            </div>
            <div className="mt-3">
              <Label htmlFor="quality-select" className="text-sm">Quality</Label>
              <Select value={autoEncoding.quality} onValueChange={(value) => setAutoEncoding(prev => ({ ...prev, quality: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p HD</SelectItem>
                  <SelectItem value="1080p">1080p Full HD</SelectItem>
                  <SelectItem value="1440p">1440p QHD</SelectItem>
                  <SelectItem value="4K">4K Ultra HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Logo Settings */}
          <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Logo Overlay</h4>
              <Switch
                checked={logoEnabled}
                onCheckedChange={setLogoEnabled}
              />
            </div>
            {logoEnabled && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Logo Position</Label>
                  <Select value={logoPosition} onValueChange={setLogoPosition}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Upload Logo</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Image className="h-4 w-4" />
                      {logoFile ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    {logoFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLogoFile(null)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setLogoFile(file);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Player Settings */}
          <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Player Settings</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show Controls</Label>
                <Switch checked={showControls} onCheckedChange={setShowControls} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Muted by Default</Label>
                <Switch checked={isMuted} onCheckedChange={setIsMuted} />
              </div>
            </div>
          </div>
        </div>

        {/* Stream Info */}
        <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {t('creator.rtmp.preview.server')}:
              </span>
              <p className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                rtmp://localhost:1935/live
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {t('creator.rtmp.preview.key')}:
              </span>
              <p className="text-gray-600 dark:text-gray-400 font-mono text-xs truncate">
                {streamKey?.slice(0, 20)}...
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              HLS URL: <span className="font-mono">https://localhost:5000/hls/{streamKey}/index.m3u8</span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              DASH URL: <span className="font-mono">https://localhost:5000/dash/{streamKey}/index.mpd</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}