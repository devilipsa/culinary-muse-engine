import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchSessions();
    }
  }, [user, authLoading, navigate]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSessions((data as unknown as Session[]) || []);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      toast({
        title: 'Failed to Load History',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewSession = (sessionId: string) => {
    navigate(`/session/${sessionId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <ChefHat className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-primary">Recipe History</h1>
                <p className="text-sm text-muted-foreground">
                  View your past recipe searches
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {sessions.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No History Yet</h2>
            <p className="text-muted-foreground mb-6">
              Your recipe searches will appear here
            </p>
            <Button onClick={() => navigate('/')}>
              Start Generating Recipes
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Your Recipe Sessions ({sessions.length})
            </h2>
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="p-6 bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleViewSession(session.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {session.prompt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(session.created_at)}
                      </span>
                      <span>
                        {session.n_suggestions} recipes generated
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
