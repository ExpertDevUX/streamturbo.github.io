import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Play } from "lucide-react";
import type { Stream, User } from "@shared/schema";

interface StreamCardProps {
  stream: Stream & { user?: User };
  showCategory?: boolean;
  showDate?: boolean;
}

export default function StreamCard({ stream, showCategory = false, showDate = false }: StreamCardProps) {
  const formatViewerCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const streamDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - streamDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <Link href={`/stream/${stream.id}`}>
      <Card className="bg-card hover:bg-elevated transition-colors cursor-pointer group overflow-hidden">
        <div className="relative aspect-video">
          <img 
            src={stream.thumbnailUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"}
            alt={`${stream.title} thumbnail`}
            className="w-full h-full object-cover"
          />
          
          {stream.isLive && (
            <div className="absolute top-3 left-3 bg-live px-2 py-1 rounded text-xs font-semibold">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                LIVE
              </div>
            </div>
          )}
          
          <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-xs">
            <div className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {formatViewerCount(stream.viewerCount)} viewers
            </div>
          </div>
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Play className="w-12 h-12 text-white" />
          </div>

          {showDate && stream.endedAt && (
            <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded text-xs">
              {formatDate(stream.endedAt)}
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-white mb-2 line-clamp-2">
            {stream.title}
          </h3>
          
          {stream.user && (
            <div className="flex items-center space-x-2 mb-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={stream.user.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {stream.user.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-300 font-medium">
                {stream.user.username}
              </span>
            </div>
          )}
          
          {(showCategory || showDate) && (
            <div className="flex items-center justify-between text-sm text-gray-400">
              {showCategory && (
                <span>{stream.category?.name || "Uncategorized"}</span>
              )}
              {showDate && stream.startedAt && (
                <span>{formatDate(stream.startedAt)}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
