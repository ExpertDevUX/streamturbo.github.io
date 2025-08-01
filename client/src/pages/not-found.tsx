import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Search, 
  PlayCircle, 
  Users, 
  Settings, 
  HelpCircle, 
  Book, 
  MessageCircle,
  ExternalLink,
  ArrowRight,
  Wifi,
  Monitor,
  Smartphone,
  Code,
  Globe,
  Zap
} from "lucide-react";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const quickLinks = [
    { icon: Home, label: "Home", href: "/", description: "Return to homepage" },
    { icon: PlayCircle, label: "Browse Streams", href: "/browse", description: "Discover live content" },
    { icon: Users, label: "Creator Studio", href: "/creator-studio", description: "Start streaming" },
    { icon: Settings, label: "Settings", href: "/profile", description: "Manage your account" },
  ];

  const helpTopics = [
    {
      icon: Monitor,
      title: "Getting Started with Streaming",
      description: "Learn how to set up OBS, XSplit, and other streaming software",
      topics: ["RTMP Configuration", "Stream Settings", "Audio Setup", "Scene Management"]
    },
    {
      icon: Smartphone,
      title: "Mobile Streaming",
      description: "Stream directly from your mobile device",
      topics: ["Mobile Apps", "Camera Settings", "Mobile Optimization", "Data Usage"]
    },
    {
      icon: Code,
      title: "API Integration",
      description: "Integrate StreamVibe into your applications",
      topics: ["REST API", "WebSocket Events", "Embed Player", "Webhooks"]
    },
    {
      icon: Globe,
      title: "Embed & Sharing",
      description: "Share your streams on external websites",
      topics: ["Iframe Embed", "Responsive Player", "Custom Styling", "Analytics"]
    }
  ];

  const statusIndicators = [
    { label: "RTMP Server", status: "operational", color: "green" },
    { label: "Web Services", status: "operational", color: "green" },
    { label: "Database", status: "operational", color: "green" },
    { label: "CDN", status: "operational", color: "green" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <PlayCircle className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">StreamVibe</h1>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main 404 Section */}
        <div className="text-center mb-16">
          <div className="relative">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
              404
            </h1>
            <div className="absolute inset-0 text-9xl font-bold text-blue-600/10 dark:text-blue-400/10 blur-sm">
              404
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Stream Not Found
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            The page you're looking for might have ended, been moved, or never existed. 
            But don't worry – there's plenty of content to discover!
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search for streams, creators, or help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {quickLinks.map((link) => (
              <Link key={link.label} href={link.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <link.icon className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {link.label}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {link.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* System Status */}
        <Card className="mb-16 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-600" />
              <CardTitle className="text-slate-900 dark:text-slate-100">System Status</CardTitle>
            </div>
            <CardDescription>All systems are operational</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statusIndicators.map((indicator) => (
                <div key={indicator.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {indicator.label}
                  </span>
                  <Badge variant="secondary" className={`bg-${indicator.color}-100 text-${indicator.color}-800 dark:bg-${indicator.color}-900 dark:text-${indicator.color}-200`}>
                    <div className={`w-2 h-2 bg-${indicator.color}-500 rounded-full mr-2 animate-pulse`} />
                    {indicator.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Documentation */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Need Help Getting Started?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Explore our comprehensive documentation and tutorials
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {helpTopics.map((topic) => (
              <Card key={topic.title} className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <topic.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900 dark:text-slate-100">
                        {topic.title}
                      </CardTitle>
                      <CardDescription>
                        {topic.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topic.topics.map((subtopic) => (
                      <div key={subtopic} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                        <ArrowRight className="h-4 w-4" />
                        {subtopic}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 group">
                    Learn More
                    <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Still Need Help?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Our support team is here to help you get the most out of StreamVibe. 
              Whether you're having technical issues or need guidance on best practices, we're here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20">
                <Book className="h-4 w-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400">
            © 2025 StreamVibe. Professional live streaming platform.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              API Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}