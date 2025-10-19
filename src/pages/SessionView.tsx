import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChefHat, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { RecipeList } from '@/components/RecipeList';
import { RecipeDetail } from '@/components/RecipeDetail';
import { supabase } from '@/integrations/supabase/client';
import { Session, Recipe } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

const SessionView = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user && sessionId) {
      fetchSession();
    }
  }, [user, authLoading, sessionId, navigate]);

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      setSession(data as unknown as Session);
      setSelectedIndex(data.selected_index);
    } catch (error: any) {
      console.error('Error fetching session:', error);
      toast({
        title: 'Failed to Load Session',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const recipes = session.suggestions_json as Recipe[];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/history')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <ChefHat className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Saved Recipe Session</h1>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {session.prompt}
                </p>
              </div>
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

export default SessionView;
