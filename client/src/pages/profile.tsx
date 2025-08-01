import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import StreamCard from "@/components/stream-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Settings, Users, Heart, Calendar } from "lucide-react";
import type { User, Stream } from "@shared/schema";
import Breadcrumb from "@/components/breadcrumb";

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  
  // If no userId provided, show current user's profile
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;

  const { data: profileUser, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users", targetUserId],
    enabled: !!targetUserId,
    retry: false,
  });

  const { data: userStreams = [] } = useQuery<Stream[]>({
    queryKey: ["/api/users", targetUserId, "streams"],
    enabled: !!targetUserId,
    retry: false,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            <div className="flex items-center justify-center h-96 text-foreground">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
                <p className="text-muted-foreground">This user doesn't exist or has been deactivated.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Breadcrumb 
              items={[
                { label: "Home", href: "/" },
                { label: isOwnProfile ? "Profile" : `${profileUser.username}'s Profile` }
              ]}
            />
            {/* Profile Header */}
            <Card className="bg-card border-border overflow-hidden mb-8">
              {/* Profile banner */}
              <div className="h-48 bg-cover bg-center relative bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
                <div className="absolute inset-0 bg-black/50"></div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 md:-mt-12">
                  <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-card relative z-10">
                    <AvatarImage src={profileUser.profileImageUrl || undefined} />
                    <AvatarFallback className="text-2xl">{profileUser.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {profileUser.firstName && profileUser.lastName 
                        ? `${profileUser.firstName} ${profileUser.lastName}`
                        : profileUser.username
                      }
                    </h1>
                    <p className="text-muted-foreground mb-2">@{profileUser.username}</p>
                    {profileUser.bio && (
                      <p className="text-foreground mb-4">{profileUser.bio}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        {profileUser.followerCount?.toLocaleString() || 0} followers
                      </span>
                      <span className="flex items-center text-muted-foreground">
                        <Heart className="w-4 h-4 mr-2" />
                        {profileUser.followingCount?.toLocaleString() || 0} following
                      </span>
                      <span className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-4 md:mt-0">
                    {isOwnProfile ? (
                      <>
                        <Button className="bg-primary hover:bg-purple-700" asChild>
                          <a href="/creator-studio">
                            <Video className="w-4 h-4 mr-2" />
                            Go Live
                          </a>
                        </Button>
                        <Button variant="outline" className="bg-elevated hover:bg-gray-600 border-elevated">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </>
                    ) : (
                      <Button className="bg-primary hover:bg-purple-700">
                        <Heart className="w-4 h-4 mr-2" />
                        Follow
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Tabs */}
            <div className="mb-8">
              <div className="border-b border-elevated">
                <nav className="flex space-x-8">
                  <button className="py-4 px-1 border-b-2 border-primary text-primary font-medium">
                    Recent Streams
                  </button>
                  <button className="py-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-white transition-colors">
                    Highlights
                  </button>
                  <button className="py-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-white transition-colors">
                    Clips
                  </button>
                  <button className="py-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-white transition-colors">
                    About
                  </button>
                </nav>
              </div>
            </div>

            {/* Recent Streams */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userStreams.length > 0 ? (
                userStreams.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} showDate />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No streams yet</p>
                  <p className="text-gray-500">
                    {isOwnProfile 
                      ? "Start your first stream to see it here!" 
                      : "This user hasn't streamed yet."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
