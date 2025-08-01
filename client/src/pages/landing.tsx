import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Heart, Users, Video } from "lucide-react";
import { AuthMenu } from "@/components/auth-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { CategoryMenu } from "@/components/category-menu";
import LanguageSelector from "@/components/language-selector";
import { useTranslation } from "@/contexts/translation-context";

export default function Landing() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">StreamVibe</span>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSelector />
              <ThemeToggle />
              <AuthMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" 
             style={{backgroundImage: 'url(https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800)'}} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4 text-foreground">{t('Your Gateway to Live Entertainment')}</h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('Discover amazing streamers')}
            </p>
            <div className="flex space-x-4">
              <AuthMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <CategoryMenu />
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">{t('Why Choose StreamVibe?')}</h2>
          <p className="text-muted-foreground">{t('Everything you need')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Video className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">{t('HD Streaming')}</h3>
              <p className="text-muted-foreground">{t('Crystal clear video')}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">{t('Live Chat')}</h3>
              <p className="text-muted-foreground">{t('Interactive real-time')}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">{t('Community')}</h3>
              <p className="text-muted-foreground">{t('Join thousands')}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Play className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">{t('Analytics')}</h3>
              <p className="text-muted-foreground">{t('Track your growth')}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Categories Preview */}
      <div className="bg-muted/20 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Explore Categories</h2>
            <p className="text-muted-foreground">Find content that matches your interests</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Gaming', icon: '🎮', count: '45.2K' },
              { name: 'Music', icon: '🎵', count: '12.8K' },
              { name: 'Art', icon: '🎨', count: '3.4K' },
              { name: 'Chatting', icon: '💬', count: '28.1K' },
              { name: 'Sports', icon: '⚽', count: '8.7K' },
              { name: 'Cooking', icon: '🍳', count: '2.9K' },
            ].map((category) => (
              <Card key={category.name} className="bg-card border-border hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold mb-1 text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} live</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4 text-foreground">{t('Get Started Today')}</h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t('Join millions')}
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-purple-700 px-8 py-3 text-lg"
          >
            {t('Sign In')}
          </Button>
        </div>
      </div>
    </div>
  );
}
