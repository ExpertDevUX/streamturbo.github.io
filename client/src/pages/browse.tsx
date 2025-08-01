import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/contexts/translation-context";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import StreamCard from "@/components/stream-card";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Stream, Category } from "@shared/schema";

export default function Browse() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [sortBy, setSortBy] = useState("viewers");

  const { data: streams = [], isLoading } = useQuery<Stream[]>({
    queryKey: ["/api/streams", { 
      search: searchQuery, 
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      language: selectedLanguage !== "all" ? selectedLanguage : undefined,
      sort: sortBy 
    }],
    retry: false,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className="lg:w-64 space-y-6">
                <Card className="bg-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Filters</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Search</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type="text"
                            placeholder="Search streams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-elevated border-elevated"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="bg-elevated border-elevated">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Language</label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className="bg-elevated border-elevated">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Languages</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Sort By</label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="bg-elevated border-elevated">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewers">Viewers (High to Low)</SelectItem>
                            <SelectItem value="recent">Recently Started</SelectItem>
                            <SelectItem value="recommended">Recommended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Streams Grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold">Browse Live Streams</h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>Showing {streams.length} streams</span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                        <div className="aspect-video bg-elevated"></div>
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-elevated rounded"></div>
                          <div className="h-3 bg-elevated rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : streams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {streams.map((stream) => (
                      <StreamCard key={stream.id} stream={stream} showCategory />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg mb-2">No streams found</p>
                    <p className="text-gray-500">Try adjusting your filters or search terms</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
