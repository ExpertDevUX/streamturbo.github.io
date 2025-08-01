import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { 
  Gamepad2, 
  Music, 
  Mic, 
  Palette, 
  Code, 
  GraduationCap,
  Users,
  Tv,
  ChevronRight,
  TrendingUp
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  streamCount: number;
  description?: string;
}

const categoryIcons: Record<string, any> = {
  gaming: Gamepad2,
  music: Music,
  talk: Mic,
  art: Palette,
  programming: Code,
  education: GraduationCap,
  social: Users,
  entertainment: Tv,
};

export function CategoryMenu() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
  });

  // Default categories if none exist
  const defaultCategories: Category[] = [
    { id: "gaming", name: "Gaming", icon: "gaming", streamCount: 1247, description: "Video games and esports" },
    { id: "music", name: "Music", icon: "music", streamCount: 523, description: "Live music and DJ sets" },
    { id: "talk", name: "Just Chatting", icon: "talk", streamCount: 892, description: "Conversations and discussions" },
    { id: "art", name: "Art & Design", icon: "art", streamCount: 234, description: "Creative content and tutorials" },
    { id: "programming", name: "Programming", icon: "programming", streamCount: 167, description: "Coding and development" },
    { id: "education", name: "Education", icon: "education", streamCount: 145, description: "Learning and teaching" },
    { id: "social", name: "Social", icon: "social", streamCount: 456, description: "Community and social content" },
    { id: "entertainment", name: "Entertainment", icon: "entertainment", streamCount: 678, description: "Shows and entertainment" },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="w-full">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Browse Categories
        </h2>
      </div>

      {/* Categories Grid */}
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayCategories.map((category) => {
            const IconComponent = categoryIcons[category.icon] || Tv;
            const isSelected = selectedCategory === category.id;
            
            return (
              <Card 
                key={category.id}
                className={`
                  bg-card border-border hover:bg-accent/50 transition-all duration-200 cursor-pointer group
                  ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
                `}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-2 rounded-lg transition-colors
                        ${isSelected ? 'bg-primary' : 'bg-muted group-hover:bg-muted/80'}
                      `}>
                        <IconComponent className="h-4 w-4 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm truncate">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`
                      h-4 w-4 text-muted-foreground transition-transform
                      ${isSelected ? 'rotate-90 text-primary' : 'group-hover:text-foreground'}
                    `} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {category.streamCount.toLocaleString()} viewers
                    </Badge>
                    <div className="flex -space-x-1">
                      {/* Sample viewer avatars */}
                      {[1, 2, 3].map((i) => (
                        <div 
                          key={i}
                          className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-primary/80 border border-border"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All Categories
        </Button>
        <Button 
          variant="outline" 
          size="sm"
        >
          Following
        </Button>
      </div>
    </div>
  );
}