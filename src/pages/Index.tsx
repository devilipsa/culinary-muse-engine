import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, LogOut, History as HistoryIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RecipeForm } from '@/components/RecipeForm';
import { RecipeList } from '@/components/RecipeList';
import { RecipeDetail } from '@/components/RecipeDetail';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/recipe';

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleGenerateRecipes = async (ingredients: string, preferences: string, nSuggestions: number = 5) => {
    setLoading(true);
    setRecipes([]);
    setCurrentSessionId(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-recipes', {
        body: {
          prompt: `Ingredients: ${ingredients}${preferences ? `\nPreferences: ${preferences}` : ''}`,
          n_suggestions: nSuggestions,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setRecipes(data.recipes);
      setSelectedIndex(0);
      setCurrentSessionId(data.sessionId);

      toast({
        title: 'Recipes Generated!',
        description: `Found ${data.recipes.length} delicious recipes for you`,
      });
    } catch (error: any) {
      console.error('Error generating recipes:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate recipes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!currentSessionId) return;

    try {
      const { data, error } = await supabase
        .from('shares')
        .insert({ session_id: currentSessionId })
        .select()
        .single();

      if (error) throw error;

      const url = `${window.location.origin}/share/${data.id}`;
      setShareUrl(url);
      setShareDialogOpen(true);

      await navigator.clipboard.writeText(url);
      toast({
        title: 'Share Link Copied!',
        description: 'The link has been copied to your clipboard',
      });
    } catch (error: any) {
      console.error('Error creating share:', error);
      toast({
        title: 'Share Failed',
        description: error.message || 'Failed to create share link',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-primary">Recipe Finder!</h1>
                <p className="text-sm text-muted-foreground">
                  Discover delicious recipes based on your ingredients
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/history')}
                title="View History"
              >
                <HistoryIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8 max-w-7xl mx-auto">
          {/* Left Column - Form & Recipe List */}
          <div className="space-y-6">
            <RecipeForm onSubmit={handleGenerateRecipes} isLoading={loading} />
            
            {loading && (
              <div className="bg-card rounded-xl p-8 border border-border flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating delicious recipes...</p>
              </div>
            )}

            {recipes.length > 0 && !loading && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Recipe Suggestions ({recipes.length})
                </h2>
                <RecipeList
                  recipes={recipes}
                  selectedIndex={selectedIndex}
                  onSelectRecipe={setSelectedIndex}
                />
              </div>
            )}
          </div>

          {/* Right Column - Recipe Detail */}
          <div>
            {recipes.length > 0 && !loading ? (
              <RecipeDetail
                recipe={recipes[selectedIndex]}
                onShare={handleShare}
                showShareButton={!!currentSessionId}
              />
            ) : !loading ? (
              <div className="bg-card rounded-xl p-8 border border-border flex items-center justify-center h-[600px]">
                <div className="text-center max-w-md">
                  <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Recipes Yet
                  </h3>
                  <p className="text-muted-foreground">
                    Enter your ingredients and preferences to discover amazing recipes!
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share This Recipe</DialogTitle>
            <DialogDescription>
              Anyone with this link can view your recipe results
            </DialogDescription>
          </DialogHeader>
          <div className="bg-background p-3 rounded border border-border">
            <code className="text-sm text-foreground break-all">{shareUrl}</code>
          </div>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
