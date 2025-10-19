import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wand2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RecipeFormProps {
  onSubmit: (ingredients: string, preferences: string, nSuggestions: number) => void;
  isLoading?: boolean;
}

export const RecipeForm = ({ onSubmit, isLoading }: RecipeFormProps) => {
  const [ingredients, setIngredients] = useState("");
  const [preferences, setPreferences] = useState("");
  const [nSuggestions, setNSuggestions] = useState<number>(5);
  const [isAutoCorrecting, setIsAutoCorrecting] = useState(false);
  const [hasAutoCorrected, setHasAutoCorrected] = useState(false);
  const { toast } = useToast();

  const handleAutoCorrect = async () => {
    if (!ingredients.trim()) return;
    
    console.log('Starting auto-correct for:', ingredients);
    setIsAutoCorrecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-correct-ingredients', {
        body: { ingredients: ingredients.trim() }
      });

      console.log('Auto-correct response:', { data, error });

      if (error) {
        console.error('Supabase invocation error:', error);
        throw error;
      }
      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      console.log('Corrected ingredients:', data.corrected);
      setIngredients(data.corrected);
      setHasAutoCorrected(true);
      
      toast({
        title: 'Ingredients Auto-Corrected!',
        description: 'Your ingredients have been cleaned up and normalized',
      });
    } catch (error: any) {
      console.error('Auto-correct error:', error);
      toast({
        title: 'Auto-Correct Failed',
        description: error.message || 'Failed to auto-correct ingredients',
        variant: 'destructive',
      });
    } finally {
      setIsAutoCorrecting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim()) {
      onSubmit(ingredients, preferences, nSuggestions);
    }
  };

  const handleIngredientsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIngredients(e.target.value);
    setHasAutoCorrected(false);
  };

  return (
    <div className="bg-card rounded-xl p-8 border border-border h-fit">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        What's in your kitchen?
      </h2>
      <p className="text-muted-foreground mb-6">
        Enter your available ingredients and taste preferences
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="ingredients" className="text-foreground font-semibold">
              Ingredients *
            </Label>
            {hasAutoCorrected && (
              <Badge variant="secondary" className="gap-1">
                <Check className="w-3 h-3" />
                Auto-corrected
              </Badge>
            )}
          </div>
          <Textarea
            id="ingredients"
            placeholder="e.g., chicken, rice, tomatoes..."
            value={ingredients}
            onChange={handleIngredientsChange}
            className="min-h-[120px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
            required
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 gap-2"
            onClick={handleAutoCorrect}
            disabled={isAutoCorrecting || !ingredients.trim()}
          >
            <Wand2 className="w-4 h-4" />
            {isAutoCorrecting ? 'Correcting...' : 'Auto-Correct Ingredients'}
          </Button>
        </div>

        <div>
          <Label htmlFor="preferences" className="text-foreground font-semibold mb-2 block">
            Taste Preferences (Optional)
          </Label>
          <Input
            id="preferences"
            placeholder="e.g., spicy, sweet, vegetarian, low-carb..."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div style="display: none;">
          <Label htmlFor="n-suggestions" className="text-foreground font-semibold mb-2 block">
            Number of Suggestions
          </Label>
          <Select
            value={nSuggestions.toString()}
            onValueChange={(value) => setNSuggestions(parseInt(value))}
          >
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 recipes</SelectItem>
              <SelectItem value="5">5 recipes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
          disabled={isLoading}
        >
          {isLoading ? "Finding Recipes..." : "Get Recipe Suggestions"}
        </Button>
      </form>
    </div>
  );
};
