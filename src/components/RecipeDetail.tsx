import { Recipe } from '@/types/recipe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onShare?: () => void;
  showShareButton?: boolean;
}

export const RecipeDetail = ({ recipe, onShare, showShareButton = true }: RecipeDetailProps) => {
  return (
    <div className="bg-card rounded-xl p-8 border border-border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {recipe.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {recipe.summary}
          </p>
        </div>
        {showShareButton && onShare && (
          <Button
            onClick={onShare}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Popularity Score: {recipe.popularity_score}/100
        </Badge>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-4">Ingredients</h3>
        <ul className="space-y-2">
          {recipe.content.ingredients.map((ingredient, idx) => (
            <li key={idx} className="flex gap-2 text-muted-foreground">
              <span className="text-primary">•</span>
              <span>{ingredient}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-4">Instructions</h3>
        <div className="space-y-4">
          {recipe.content.steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </div>
              <p className="flex-1 text-muted-foreground pt-1">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {recipe.content.notes && recipe.content.notes.length > 0 && (
        <div className="border-l-4 border-primary bg-background p-4 rounded">
          <h4 className="font-semibold text-foreground mb-2">Notes</h4>
          <div className="space-y-2">
            {recipe.content.notes.map((note, idx) => (
              <p key={idx} className="text-muted-foreground text-sm">{note}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
