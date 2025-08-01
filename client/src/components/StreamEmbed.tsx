import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Code, Eye, Settings, Monitor, Smartphone, Tablet } from "lucide-react";
import { useTranslation } from "@/contexts/translation-context";
import { useToast } from "@/hooks/use-toast";

interface StreamEmbedProps {
  streamKey: string;
  isLive?: boolean;
}

export function StreamEmbed({ streamKey, isLive = false }: StreamEmbedProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [embedConfig, setEmbedConfig] = useState({
    width: '800',
    height: '450',
    autoplay: false,
    muted: true,
    controls: true,
    responsive: true,
    theme: 'dark',
    logo: false,
    branding: true
  });

  const generateEmbedCode = () => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${window.location.hostname}` 
      : 'http://localhost:5000';
    
    const params = new URLSearchParams({
      autoplay: embedConfig.autoplay.toString(),
      muted: embedConfig.muted.toString(),
      controls: embedConfig.controls.toString(),
      theme: embedConfig.theme,
      logo: embedConfig.logo.toString(),
      branding: embedConfig.branding.toString()
    });

    if (embedConfig.responsive) {
      return `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe 
    src="${baseUrl}/embed/${streamKey}?${params.toString()}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0" 
    allowfullscreen
    allow="autoplay; fullscreen; encrypted-media">
  </iframe>
</div>`;
    } else {
      return `<iframe 
  src="${baseUrl}/embed/${streamKey}?${params.toString()}" 
  width="${embedConfig.width}" 
  height="${embedConfig.height}"
  frameborder="0" 
  allowfullscreen
  allow="autoplay; fullscreen; encrypted-media">
</iframe>`;
    }
  };

  const generateApiCode = () => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${window.location.hostname}` 
      : 'http://localhost:5000';
    
    return {
      javascript: `// JavaScript Integration
const streamPlayer = new StreamVibePlayer({
  container: '#stream-player',
  streamKey: '${streamKey}',
  apiUrl: '${baseUrl}/api',
  config: {
    autoplay: ${embedConfig.autoplay},
    muted: ${embedConfig.muted},
    controls: ${embedConfig.controls},
    theme: '${embedConfig.theme}'
  }
});

// Listen for events
streamPlayer.on('play', () => console.log('Stream started'));
streamPlayer.on('pause', () => console.log('Stream paused'));
streamPlayer.on('ended', () => console.log('Stream ended'));`,

      react: `// React Component
import { StreamVibePlayer } from '@streamvibe/react-player';

function MyStreamPlayer() {
  return (
    <StreamVibePlayer
      streamKey="${streamKey}"
      apiUrl="${baseUrl}/api"
      width="${embedConfig.width}"
      height="${embedConfig.height}"
      autoplay={${embedConfig.autoplay}}
      muted={${embedConfig.muted}}
      controls={${embedConfig.controls}}
      theme="${embedConfig.theme}"
      onPlay={() => console.log('Stream started')}
      onPause={() => console.log('Stream paused')}
    />
  );
}`,

      api: `// REST API Endpoints
GET ${baseUrl}/api/streams/${streamKey}/status
GET ${baseUrl}/api/streams/${streamKey}/hls
GET ${baseUrl}/api/streams/${streamKey}/dash
POST ${baseUrl}/api/streams/${streamKey}/analytics

// WebSocket Events
const ws = new WebSocket('${baseUrl.replace('http', 'ws')}/ws');
ws.send(JSON.stringify({
  type: 'subscribe',
  streamKey: '${streamKey}'
}));`
    };
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    });
  };

  const [activeTab, setActiveTab] = useState<'embed' | 'api'>('embed');
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Code className="h-5 w-5" />
            {t("Embed Configuration")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Width</Label>
              <Input
                value={embedConfig.width}
                onChange={(e) => setEmbedConfig(prev => ({ ...prev, width: e.target.value }))}
                placeholder="800"
                disabled={embedConfig.responsive}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Height</Label>
              <Input
                value={embedConfig.height}
                onChange={(e) => setEmbedConfig(prev => ({ ...prev, height: e.target.value }))}
                placeholder="450"
                disabled={embedConfig.responsive}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Theme</Label>
              <Select value={embedConfig.theme} onValueChange={(value) => setEmbedConfig(prev => ({ ...prev, theme: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Responsive</Label>
              <Switch
                checked={embedConfig.responsive}
                onCheckedChange={(checked) => setEmbedConfig(prev => ({ ...prev, responsive: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Autoplay</Label>
              <Switch
                checked={embedConfig.autoplay}
                onCheckedChange={(checked) => setEmbedConfig(prev => ({ ...prev, autoplay: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Controls</Label>
              <Switch
                checked={embedConfig.controls}
                onCheckedChange={(checked) => setEmbedConfig(prev => ({ ...prev, controls: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Branding</Label>
              <Switch
                checked={embedConfig.branding}
                onCheckedChange={(checked) => setEmbedConfig(prev => ({ ...prev, branding: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t("Preview")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={previewSize === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewSize('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewSize === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewSize('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewSize === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewSize('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`mx-auto ${
            previewSize === 'desktop' ? 'max-w-4xl' :
            previewSize === 'tablet' ? 'max-w-2xl' :
            'max-w-sm'
          }`}>
            <div 
              className="bg-black rounded-lg overflow-hidden"
              style={{
                aspectRatio: embedConfig.responsive ? '16/9' : `${embedConfig.width}/${embedConfig.height}`
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Monitor className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Stream Preview</p>
                  <Badge variant={isLive ? "default" : "secondary"} className="mt-2">
                    {isLive ? "LIVE" : "OFFLINE"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Generation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              variant={activeTab === 'embed' ? 'default' : 'outline'}
              onClick={() => setActiveTab('embed')}
            >
              Embed Code
            </Button>
            <Button
              variant={activeTab === 'api' ? 'default' : 'outline'}
              onClick={() => setActiveTab('api')}
            >
              API Integration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'embed' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">HTML Embed Code</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateEmbedCode(), "Embed code")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={generateEmbedCode()}
                readOnly
                className="font-mono text-xs min-h-[120px]"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(generateApiCode()).map(([language, code]) => (
                <div key={language}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium capitalize">{language} Integration</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(code, `${language} code`)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={code}
                    readOnly
                    className="font-mono text-xs min-h-[150px]"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}