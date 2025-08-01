import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import VideoPlayer from "@/components/video-player";
import Chat from "@/components/chat";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Bell, Eye, Clock, Settings, Expand } from "lucide-react";
import type { Stream, User } from "@shared/schema";

export default function StreamViewer() {
  const { streamId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: stream, isLoading } = useQuery<Stream & { user: User }>({
    queryKey: ["/api/streams", streamId],
    enabled: !!streamId,
    retry: false,
  });

  const { data: followStatus } = useQuery<{ isFollowing: boolean }>({
    queryKey: ["/api/follows/status", stream?.userId],
    enabled: !!stream?.userId && !!user,
    retry: false,
  });

  useEffect(() => {
    if (followStatus) {
      setIsFollowing(followStatus.isFollowing);
    }
  }, [followStatus]);

  const followMutation = useMutation({
    mutationFn: async () => {
      const action = isFollowing ? "unfollow" : "follow";
      await apiRequest("POST", `/api/follows/${action}`, {
        followedId: stream?.userId,
      });
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      queryClient.invalidateQueries({ queryKey: ["/api/follows/status"] });
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? "You are no longer following this streamer" 
          : "You will be notified when they go live",
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
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-dark">
        <Navigation />
        <div className="flex items-center justify-center h-96 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Stream Not Found</h1>
            <p className="text-gray-400">This stream may have ended or doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navigation />
      
      <div className="flex h-screen">
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col">
          <VideoPlayer 
            streamId={streamId!} 
            isLive={stream.isLive}
            viewerCount={stream.viewerCount}
          />

          {/* Stream Info */}
          <div className="bg-card p-6 border-t border-elevated">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">{stream.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    {stream.viewerCount.toLocaleString()} viewers
                  </span>
                  {stream.startedAt && (
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Started {new Date(stream.startedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={isFollowing 
                    ? "bg-elevated hover:bg-gray-600" 
                    : "bg-primary hover:bg-purple-700"
                  }
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" className="bg-elevated hover:bg-gray-600 border-elevated">
                  <Bell className="w-4 h-4 mr-2" />
                  Notify
                </Button>
              </div>
            </div>

            {/* Streamer Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={stream.user.profileImageUrl || undefined} />
                <AvatarFallback>{stream.user.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-white">{stream.user.username}</h3>
                <p className="text-sm text-gray-400">{stream.user.followerCount} followers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="w-80 bg-card border-l border-elevated">
          <Chat streamId={streamId!} />
        </div>
      </div>
    </div>
  );
}
