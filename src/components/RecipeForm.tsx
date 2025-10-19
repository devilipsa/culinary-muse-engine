import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RecipeFormProps {
  onSubmit: (ingredients: string, preferences: string, nSuggestions: number) => void;
  isLoading?: boolean;
}

export const RecipeForm = ({ onSubmit, isLoading }: RecipeFormProps) => {
  const [ingredients, setIngredients] = useState("");
  const [preferences, setPreferences] = useState("");
  const [nSuggestions, setNSuggestions] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim()) {
      onSubmit(ingredients, preferences, nSuggestions);
    }
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
          <Label htmlFor="ingredients" className="text-foreground font-semibold mb-2 block">
            Ingredients *
          </Label>
          <Textarea
            id="ingredients"
            placeholder="e.g., chicken, rice, tomatoes..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="min-h-[120px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
            required
          />
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

        <div>
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
