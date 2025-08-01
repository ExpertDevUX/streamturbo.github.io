import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/translation-context";
import { RTMPPreview } from "@/components/RTMPPreview";
import { StreamEmbed } from "@/components/StreamEmbed";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Radio, 
  Copy, 
  Eye, 
  EyeOff, 
  Upload, 
  Users, 
  DollarSign, 
  BarChart3,
  Settings,
  Activity,
  Play,
  Square,
  Pause,
  Monitor,
  Wifi,
  WifiOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Download,
  Zap,
  Server,
  Globe,
  FileVideo,
  Code,
  AlertCircle,
  CheckCircle,
  Info,
  Smartphone,
  Gamepad2
} from "lucide-react";
import type { User, Category, Stream } from "@shared/schema";
import Breadcrumb from "@/components/breadcrumb";

export default function CreatorStudio() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [activeTab, setActiveTab] = useState("stream");
  const [streamConfig, setStreamConfig] = useState({
    title: "",
    categoryId: "",
    description: "",
    language: "en",
    tags: "",
  });
  const [encodingSettings, setEncodingSettings] = useState({
    resolution: "1080p",
    bitrate: "6000",
    fps: "60",
    encoder: "x264",
    autoConvert: true,
    hlsEnabled: true,
    dashEnabled: true,
  });
  const [streamStatus, setStreamStatus] = useState({
    isConnected: false,
    viewers: 0,
    bitrate: 0,
    fps: 0,
    dropFrames: 0,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
  });

  const { data: currentStream } = useQuery<Stream>({
    queryKey: ["/api/streams/current"],
    enabled: !!user,
    retry: false,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/overview"],
    enabled: !!user,
    retry: false,
  });

  const startStreamMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/streams/start", streamConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/streams/current"] });
      toast({
        title: t("Stream Configuration Updated"),
        description: t("Your stream settings have been saved. You can now start streaming with OBS or your preferred software."),
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t("Error"),
        description: t("Failed to update stream configuration"),
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: t("Copied!"),
        description: `${label} ${t("copied to clipboard")}`,
      });
    });
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const isLive = currentStream?.isLive || false;
  const rtmpUrl = process.env.NODE_ENV === 'production' 
    ? `rtmp://${window.location.hostname}/live/`
    : 'rtmp://localhost:1935/live/';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="container mx-auto p-6">
        <Breadcrumb 
          items={[
            { label: t("Home"), href: "/" },
            { label: t("Creator Studio") }
          ]}
        />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">{t("Creator Studio")}</h1>
          <p className="text-muted-foreground">{t("Advanced streaming platform with live encoding, auto-conversion and RTMP integration")}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-muted">
            <TabsTrigger value="stream" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              {t("Live Stream")}
            </TabsTrigger>
            <TabsTrigger value="encoding" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t("Encoding")}
            </TabsTrigger>
            <TabsTrigger value="rtmp" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              {t("RTMP Setup")}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("Analytics")}
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              {t("Tools")}
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t("Embed")}
            </TabsTrigger>
          </TabsList>

          {/* Live Stream Tab */}
          <TabsContent value="stream" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stream Status */}
              <Card className="bg-card border-border text-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    {t("Stream Status")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("Status")}:</span>
                    <Badge variant={isLive ? "default" : "secondary"} className="text-foreground">
                      {isLive ? t("Live") : t("Offline")}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("Viewers")}:</span>
                    <span className="font-bold text-foreground">{streamStatus.viewers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("Bitrate")}:</span>
                    <span className="font-bold text-foreground">{streamStatus.bitrate} kbps</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("FPS")}:</span>
                    <span className="font-bold text-foreground">{streamStatus.fps}</span>
                  </div>
                  <Button 
                    onClick={() => startStreamMutation.mutate()}
                    disabled={startStreamMutation.isPending}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    {isLive ? t("Update Stream") : t("Go Live")}
                  </Button>
                </CardContent>
              </Card>

              {/* Stream Configuration */}
              <Card className="lg:col-span-2 bg-card border-border text-foreground">
                <CardHeader>
                  <CardTitle className="text-foreground">{t("Stream Configuration")}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t("Configure your stream settings and metadata")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-foreground">{t("Stream Title")}</Label>
                    <Input
                      id="title"
                      placeholder={t("Enter your stream title...")}
                      value={streamConfig.title}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category" className="text-foreground">{t("Category")}</Label>
                      <Select value={streamConfig.categoryId} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, categoryId: value }))}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder={t("Select category")} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="language" className="text-foreground">{t("Language")}</Label>
                      <Select value={streamConfig.language} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="pt">Português</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-foreground">{t("Description")}</Label>
                    <Textarea
                      id="description"
                      placeholder={t("Describe your stream...")}
                      value={streamConfig.description}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-background border-border text-foreground"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags" className="text-foreground">{t("Tags")}</Label>
                    <Input
                      id="tags"
                      placeholder={t("gaming, tutorial, music (comma separated)")}
                      value={streamConfig.tags}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, tags: e.target.value }))}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Encoding Settings Tab */}
          <TabsContent value="encoding" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border text-foreground">
                <CardHeader>
                  <CardTitle className="text-foreground">{t("Video Encoding")}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t("Configure video quality and encoding settings")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground">{t("Resolution")}</Label>
                      <Select value={encodingSettings.resolution} onValueChange={(value) => setEncodingSettings(prev => ({ ...prev, resolution: value }))}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="720p">720p HD</SelectItem>
                          <SelectItem value="1080p">1080p Full HD</SelectItem>
                          <SelectItem value="1440p">1440p 2K</SelectItem>
                          <SelectItem value="2160p">2160p 4K</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-foreground">{t("Frame Rate")}</Label>
                      <Select value={encodingSettings.fps} onValueChange={(value) => setEncodingSettings(prev => ({ ...prev, fps: value }))}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 FPS</SelectItem>
                          <SelectItem value="60">60 FPS</SelectItem>
                          <SelectItem value="120">120 FPS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-foreground">{t("Bitrate")} (kbps)</Label>
                    <Input
                      type="number"
                      value={encodingSettings.bitrate}
                      onChange={(e) => setEncodingSettings(prev => ({ ...prev, bitrate: e.target.value }))}
                      className="bg-background border-border text-foreground"
                      min="1000"
                      max="15000"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("Recommended: 3000-6000 for 1080p")}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-foreground">{t("Encoder")}</Label>
                    <Select value={encodingSettings.encoder} onValueChange={(value) => setEncodingSettings(prev => ({ ...prev, encoder: value }))}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="x264">x264 (CPU)</SelectItem>
                        <SelectItem value="nvenc">NVENC (NVIDIA GPU)</SelectItem>
                        <SelectItem value="amd">AMD VCE</SelectItem>
                        <SelectItem value="quicksync">Intel Quick Sync</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border text-foreground">
                <CardHeader>
                  <CardTitle className="text-foreground">{t("Auto-Conversion")}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t("Automatically convert streams to multiple formats")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">{t("Auto-Convert Enabled")}</Label>
                      <p className="text-xs text-muted-foreground">
                        {t("Automatically process streams for web playback")}
                      </p>
                    </div>
                    <Switch
                      checked={encodingSettings.autoConvert}
                      onCheckedChange={(checked) => setEncodingSettings(prev => ({ ...prev, autoConvert: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">{t("HLS Output")}</Label>
                      <p className="text-xs text-muted-foreground">
                        {t("HTTP Live Streaming for web browsers")}
                      </p>
                    </div>
                    <Switch
                      checked={encodingSettings.hlsEnabled}
                      onCheckedChange={(checked) => setEncodingSettings(prev => ({ ...prev, hlsEnabled: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">{t("DASH Output")}</Label>
                      <p className="text-xs text-muted-foreground">
                        {t("Dynamic Adaptive Streaming over HTTP")}
                      </p>
                    </div>
                    <Switch
                      checked={encodingSettings.dashEnabled}
                      onCheckedChange={(checked) => setEncodingSettings(prev => ({ ...prev, dashEnabled: checked }))}
                    />
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">{t("Auto-Conversion Benefits")}</h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                          <li>• {t("Multiple quality levels (adaptive bitrate)")}</li>
                          <li>• {t("Cross-platform compatibility")}</li>
                          <li>• {t("Reduced bandwidth usage")}</li>
                          <li>• {t("Better viewer experience")}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RTMP Setup Tab */}
          <TabsContent value="rtmp" className="space-y-6">
            {/* Stream Preview Section */}
            <RTMPPreview 
              streamKey={user?.streamKey || ""} 
              isLive={isLive}
              onStreamStart={() => startStreamMutation.mutate()}
              onStreamStop={() => {/* Handle stream stop */}}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-gray-900 dark:to-indigo-900 border-indigo-200 dark:border-indigo-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                    <Server className="h-5 w-5" />
                    {t("RTMP Configuration")}
                  </CardTitle>
                  <CardDescription className="text-indigo-600 dark:text-indigo-300">
                    {t("Connect your streaming software to our RTMP server")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
                    <Label className="text-indigo-800 dark:text-indigo-200 font-medium">{t("RTMP Server URL")}</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={rtmpUrl}
                        readOnly
                        className="bg-white dark:bg-gray-700 border-indigo-300 dark:border-indigo-600 text-indigo-900 dark:text-indigo-100 font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(rtmpUrl, t("RTMP URL"))}
                        className="border-indigo-300 dark:border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                      >
                        <Copy className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
                    <Label className="text-indigo-800 dark:text-indigo-200 font-medium">{t("Stream Key")}</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type={showStreamKey ? "text" : "password"}
                        value={user?.streamKey || ""}
                        readOnly
                        className="bg-white dark:bg-gray-700 border-indigo-300 dark:border-indigo-600 text-indigo-900 dark:text-indigo-100 font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowStreamKey(!showStreamKey)}
                        className="border-indigo-300 dark:border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                      >
                        {showStreamKey ? <EyeOff className="h-4 w-4 text-indigo-600 dark:text-indigo-300" /> : <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(user?.streamKey || "", t("Stream Key"))}
                        className="border-indigo-300 dark:border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                      >
                        <Copy className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                      </Button>
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                      {t("Keep your stream key private. Don't share it with anyone.")}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100">{t("Connection Status")}</h4>
                        <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                          {isLive ? t("RTMP server is live and ready to receive your stream") : t("RTMP server is ready. Start streaming to go live.")}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          <span className="text-xs font-medium">
                            {isLive ? t("Live") : t("Offline")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      {t("Streaming Software Setup")}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      {t("Configure popular streaming applications with step-by-step guides")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <Monitor className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-blue-800 dark:text-blue-200">{t("OBS Studio")}</h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400">Professional Broadcasting</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">1</div>
                            <div className="text-sm text-blue-800 dark:text-blue-200 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                              {t("Open OBS Studio")}
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">2</div>
                            <div className="text-sm text-blue-800 dark:text-blue-200 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                              {t("Go to Settings → Stream")}
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">3</div>
                            <div className="text-sm text-blue-800 dark:text-blue-200 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                              {t("Service: Custom")}
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">4</div>
                            <div className="text-sm text-blue-800 dark:text-blue-200 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                              <div className="mb-1">{t("Server:")}</div>
                              <code className="bg-blue-100 dark:bg-blue-800 px-3 py-1.5 rounded-lg text-xs font-mono text-blue-900 dark:text-blue-100 block">{rtmpUrl}</code>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">5</div>
                            <div className="text-sm text-blue-800 dark:text-blue-200 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                              {t("Stream Key: [Your stream key above]")}
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">6</div>
                            <div className="text-sm text-blue-800 dark:text-blue-200 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                              {t("Click Apply and OK")}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                          <p className="text-xs text-green-800 dark:text-green-200 font-medium">✓ Recommended for professional streaming</p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6 border border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-purple-800 dark:text-purple-200">{t("XSplit")}</h4>
                            <p className="text-xs text-purple-600 dark:text-purple-400">Game Streaming Made Easy</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">1</div>
                            <div className="text-sm text-purple-800 dark:text-purple-200 group-hover:text-purple-900 dark:group-hover:text-purple-100 transition-colors">
                              {t("Open XSplit Broadcaster")}
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">2</div>
                            <div className="text-sm text-purple-800 dark:text-purple-200 group-hover:text-purple-900 dark:group-hover:text-purple-100 transition-colors">
                              {t("Click Broadcast → Add Channel")}
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">3</div>
                            <div className="text-sm text-purple-800 dark:text-purple-200 group-hover:text-purple-900 dark:group-hover:text-purple-100 transition-colors">
                              {t("Select Custom RTMP")}
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">4</div>
                            <div className="text-sm text-purple-800 dark:text-purple-200 group-hover:text-purple-900 dark:group-hover:text-purple-100 transition-colors">
                              <div className="mb-1">{t("RTMP URL:")}</div>
                              <code className="bg-purple-100 dark:bg-purple-800 px-3 py-1.5 rounded-lg text-xs font-mono text-purple-900 dark:text-purple-100 block">{rtmpUrl}</code>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">5</div>
                            <div className="text-sm text-purple-800 dark:text-purple-200 group-hover:text-purple-900 dark:group-hover:text-purple-100 transition-colors">
                              {t("Stream Key: [Your stream key above]")}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                          <p className="text-xs text-green-800 dark:text-green-200 font-medium">✓ Great for gaming content</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                            <Settings className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-emerald-800 dark:text-emerald-200">{t("vMix")}</h4>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">Professional Live Production</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">1</div>
                            <div className="text-sm text-emerald-800 dark:text-emerald-200 group-hover:text-emerald-900 dark:group-hover:text-emerald-100 transition-colors">
                              {t("Open vMix")}
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">2</div>
                            <div className="text-sm text-emerald-800 dark:text-emerald-200 group-hover:text-emerald-900 dark:group-hover:text-emerald-100 transition-colors">
                              {t("Go to Settings → Streaming")}
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">3</div>
                            <div className="text-sm text-emerald-800 dark:text-emerald-200 group-hover:text-emerald-900 dark:group-hover:text-emerald-100 transition-colors">
                              {t("Destination: Custom RTMP Server")}
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">4</div>
                            <div className="text-sm text-emerald-800 dark:text-emerald-200 group-hover:text-emerald-900 dark:group-hover:text-emerald-100 transition-colors">
                              <div className="mb-1">{t("URL:")}</div>
                              <code className="bg-emerald-100 dark:bg-emerald-800 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-900 dark:text-emerald-100 block">{rtmpUrl}</code>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">5</div>
                            <div className="text-sm text-emerald-800 dark:text-emerald-200 group-hover:text-emerald-900 dark:group-hover:text-emerald-100 transition-colors">
                              {t("Stream Name or Key: [Your stream key]")}
                            </div>
                          </div>
                          <div className="flex items-start gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">6</div>
                            <div className="text-sm text-emerald-800 dark:text-emerald-200 group-hover:text-emerald-900 dark:group-hover:text-emerald-100 transition-colors">
                              {t("Click OK and Start Stream")}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                          <p className="text-xs text-green-800 dark:text-green-200 font-medium">✓ Advanced multi-camera setup</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-primary" />
                          <h4 className="font-medium text-foreground">{t("Streamlabs Mobile")}</h4>
                        </div>
                        <ol className="text-sm text-muted-foreground space-y-1">
                          <li>1. {t("Open Streamlabs Mobile")}</li>
                          <li>2. {t("Go to Settings → Stream")}</li>
                          <li>3. {t("Platform: Custom RTMP")}</li>
                          <li>4. {t("Server URL:")} <code className="bg-muted px-1 rounded text-xs">{rtmpUrl}</code></li>
                          <li>5. {t("Stream Key: [Your stream key]")}</li>
                        </ol>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="h-5 w-5 text-primary" />
                          <h4 className="font-medium text-foreground">{t("Wirecast")}</h4>
                        </div>
                        <ol className="text-sm text-muted-foreground space-y-1">
                          <li>1. {t("Open Wirecast")}</li>
                          <li>2. {t("Window → Output Settings")}</li>
                          <li>3. {t("Destination: RTMP Server")}</li>
                          <li>4. {t("Address:")} <code className="bg-muted px-1 rounded text-xs">{rtmpUrl}</code></li>
                          <li>5. {t("Stream: [Your stream key]")}</li>
                        </ol>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Radio className="h-5 w-5 text-primary" />
                          <h4 className="font-medium text-foreground">{t("FFmpeg CLI")}</h4>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{t("Command line streaming:")}</p>
                          <code className="bg-muted p-2 rounded text-xs block break-all">
                            ffmpeg -f v4l2 -i /dev/video0 -c:v libx264 -preset fast -b:v 3000k -f flv {rtmpUrl}[KEY]
                          </code>
                          <p className="text-xs">{t("Replace [KEY] with your stream key")}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">{t("Quick Test")}</h4>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        {t("Use the test stream feature in your software to verify the connection before going live.")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border text-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("Total Stream Time")}</p>
                      <p className="text-2xl font-bold text-foreground">{(analytics as any)?.totalStreamTime || "0h 0m"}</p>
                    </div>
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border text-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("Average Viewers")}</p>
                      <p className="text-2xl font-bold text-foreground">{(analytics as any)?.averageViewers || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border text-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("Total Followers")}</p>
                      <p className="text-2xl font-bold text-foreground">{(analytics as any)?.totalFollowers || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border text-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("Monthly Growth")}</p>
                      <p className="text-2xl font-bold text-foreground">+{(analytics as any)?.monthlyGrowth || 0}%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border text-foreground">
                <CardHeader>
                  <CardTitle className="text-foreground">{t("Stream Tools")}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t("Helpful tools for managing your streams")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Monitor className="h-4 w-4 mr-2" />
                    {t("Stream Health Monitor")}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileVideo className="h-4 w-4 mr-2" />
                    {t("VOD Manager")}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {t("Download Stream Archive")}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    {t("Stream Optimizer")}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border text-foreground">
                <CardHeader>
                  <CardTitle className="text-foreground">{t("API Integration")}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t("Integrate StreamVibe with your applications")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-foreground">{t("API Endpoint")}</Label>
                    <div className="flex gap-2">
                      <Input
                        value={`${window.location.origin}/api/streams`}
                        readOnly
                        className="bg-background border-border text-foreground font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(`${window.location.origin}/api/streams`, t("API Endpoint"))}
                        className="border-border"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <Code className="h-4 w-4 mr-2" />
                    {t("View API Documentation")}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    {t("Webhook Settings")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Embed Tab */}
          <TabsContent value="embed" className="space-y-6">
            <StreamEmbed 
              streamKey={user?.streamKey || ""} 
              isLive={isLive}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}