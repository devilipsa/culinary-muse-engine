import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChefHat, Loader2 } from 'lucide-react';
import { RecipeList } from '@/components/RecipeList';
import { RecipeDetail } from '@/components/RecipeDetail';
import { supabase } from '@/integrations/supabase/client';
import { Session, Recipe } from '@/types/recipe';

const Share = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareId) {
      fetchSharedSession();
    }
  }, [shareId]);

  const fetchSharedSession = async () => {
    try {
      // First get the share to find the session_id
      const { data: shareData, error: shareError } = await supabase
        .from('shares')
        .select('session_id')
        .eq('id', shareId)
        .single();

      if (shareError) throw new Error('Share link not found');

      // Then get the session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', shareData.session_id)
        .single();

      if (sessionError) throw new Error('Session not found');

      setSession(sessionData as unknown as Session);
      setSelectedIndex(sessionData.selected_index);
    } catch (error: any) {
      console.error('Error fetching shared session:', error);
      setError(error.message || 'Failed to load shared recipe');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Share Not Found</h1>
          <p className="text-muted-foreground">
            This recipe share link doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const recipes = session.suggestions_json as Recipe[];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Shared Recipe</h1>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {session.prompt}
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              Read-Only
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8 max-w-7xl mx-auto">
          {/* Left Column - Recipe List */}
          <div className="bg-card rounded-xl p-6 border border-border h-fit">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Recipe Suggestions ({recipes.length})
            </h2>
            <RecipeList
              recipes={recipes}
              selectedIndex={selectedIndex}
              onSelectRecipe={setSelectedIndex}
            />
          </div>

          {/* Right Column - Recipe Detail */}
          <div>
            <RecipeDetail
              recipe={recipes[selectedIndex]}
              showShareButton={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Share;
