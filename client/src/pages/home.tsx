import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/translation-context";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import StreamCard from "@/components/stream-card";
import { CategoryMenu } from "@/components/category-menu";
import { Card, CardContent } from "@/components/ui/card";
import type { Stream, Category } from "@shared/schema";

export default function Home() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: liveStreams, isLoading: streamsLoading } = useQuery<Stream[]>({
    queryKey: ["/api/streams/live"],
    retry: false,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
  });

  const { data: recommendedStreams } = useQuery<Stream[]>({
    queryKey: ["/api/streams/recommended"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-x-hidden">
          {/* Hero Section */}
          <div className="relative h-96 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-30" 
                 style={{backgroundImage: 'url(https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800)'}} />
            <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
              <div className="max-w-2xl">
                <h1 className="text-5xl font-bold mb-4 text-foreground">Your Gateway to Live Entertainment</h1>
                <p className="text-xl text-muted-foreground mb-8">Discover amazing streamers, connect with communities, and share your passion with the world.</p>
                <div className="flex space-x-4">
                  <button className="btn-primary px-8 py-3 rounded-xl font-semibold text-lg bg-primary hover:bg-purple-700 transition-colors">
                    Start Watching
                  </button>
                  <button className="border border-white/30 hover:bg-white/10 px-8 py-3 rounded-xl font-semibold text-lg transition-colors">
                    Explore Categories
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Categories Section */}
            <section className="mb-12">
              <CategoryMenu />
            </section>

            {/* Live Now Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <div className="w-3 h-3 bg-live rounded-full mr-3 animate-pulse"></div>
                  Live Now
                </h2>
                <a href="/browse" className="text-primary hover:text-purple-300 font-medium">View All</a>
              </div>

              {streamsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                      <div className="aspect-video bg-elevated"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-elevated rounded"></div>
                        <div className="h-3 bg-elevated rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {liveStreams && liveStreams.length > 0 ? (
                    liveStreams.map((stream) => (
                      <StreamCard key={stream.id} stream={stream} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-400 text-lg">No live streams at the moment</p>
                      <p className="text-gray-500">Check back later for amazing content!</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Categories Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories?.map((category) => (
                  <Card key={category.id} className="bg-card hover:bg-elevated transition-colors cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl text-primary mb-3">{category.icon}</div>
                      <h3 className="font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-400">{category.streamCount} live</p>
                    </CardContent>
                  </Card>
                )) || (
                  // Default categories if none loaded
                  [
                    { id: '1', name: 'Gaming', icon: '🎮', streamCount: 45200 },
                    { id: '2', name: 'Music', icon: '🎵', streamCount: 12800 },
                    { id: '3', name: 'Just Chatting', icon: '💬', streamCount: 28100 },
                    { id: '4', name: 'Art', icon: '🎨', streamCount: 3400 },
                    { id: '5', name: 'Sports', icon: '⚽', streamCount: 8700 },
                    { id: '6', name: 'Food', icon: '🍳', streamCount: 2900 },
                  ].map((category) => (
                    <Card key={category.id} className="bg-card hover:bg-elevated transition-colors cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl text-primary mb-3">{category.icon}</div>
                        <h3 className="font-semibold mb-1">{category.name}</h3>
                        <p className="text-sm text-gray-400">{(category.streamCount / 1000).toFixed(1)}K live</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>

            {/* Recommended For You */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedStreams && recommendedStreams.length > 0 ? (
                  recommendedStreams.map((stream) => (
                    <StreamCard key={stream.id} stream={stream} showCategory />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-400 text-lg">No recommendations available</p>
                    <p className="text-gray-500">Follow some streamers to get personalized recommendations!</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
