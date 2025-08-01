import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Compass, 
  Heart, 
  Gamepad2, 
  Music, 
  MessageCircle, 
  Palette 
} from "lucide-react";
import type { User } from "@shared/schema";

export default function Sidebar() {
  const [location] = useLocation();

  const { data: followedStreamers = [] } = useQuery<(User & { isLive: boolean, category: string })[]>({
    queryKey: ["/api/follows/live"],
    retry: false,
  });

  const navItems = [
    { name: "Home", path: "/", icon: Home, active: location === "/" },
    { name: "Browse", path: "/browse", icon: Compass, active: location === "/browse" },
    { name: "Following", path: "/following", icon: Heart, active: location === "/following" },
  ];

  const categories = [
    { name: "Gaming", icon: Gamepad2, path: "/category/gaming" },
    { name: "Music", icon: Music, path: "/category/music" },
    { name: "Just Chatting", icon: MessageCircle, path: "/category/chatting" },
    { name: "Art", icon: Palette, path: "/category/art" },
  ];

  return (
    <aside className="w-64 bg-card border-r border-elevated hidden lg:block">
      <div className="p-4 space-y-6">
        {/* For You Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            For You
          </h3>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  item.active
                    ? "text-white bg-elevated"
                    : "text-gray-400 hover:text-white hover:bg-elevated"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Categories
          </h3>
          <nav className="space-y-1">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.path}
                className="flex items-center px-3 py-2 text-gray-400 hover:text-white hover:bg-elevated rounded-lg transition-colors"
              >
                <category.icon className="w-5 h-5 mr-3" />
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Followed Channels */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Following
            </h3>
            {followedStreamers.length > 0 && (
              <span className="text-xs text-gray-500">
                {followedStreamers.filter(s => s.isLive).length} Live
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            {followedStreamers.length > 0 ? (
              followedStreamers.map((streamer) => (
                <Link
                  key={streamer.id}
                  href={`/profile/${streamer.id}`}
                  className="flex items-center px-3 py-2 hover:bg-elevated rounded-lg transition-colors cursor-pointer"
                >
                  <div className="relative mr-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={streamer.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {streamer.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {streamer.isLive && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-live rounded-full border-2 border-card"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {streamer.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {streamer.category}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400">No followed streamers</p>
                <p className="text-xs text-gray-500">Follow streamers to see them here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
