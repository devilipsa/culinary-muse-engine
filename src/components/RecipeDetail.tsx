import { Recipe } from '@/types/recipe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Clock, Users, Flame, ShoppingCart } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onShare?: () => void;
  showShareButton?: boolean;
}

export const RecipeDetail = ({ recipe, onShare, showShareButton = true }: RecipeDetailProps) => {
  return (
    <div className="bg-card rounded-xl p-8 border border-border">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {recipe.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {recipe.summary}
          </p>
          
          {/* Recipe Metadata */}
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4" />
              <span>{recipe.time} total</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Users className="w-4 h-4" />
              <span>{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Flame className="w-4 h-4" />
              <span>{recipe.calories} cal/serving</span>
            </div>
          </div>
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

      {/* Recipe Image */}
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
      )}

      {/* Selected Ingredients */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-4">Selected Ingredients</h3>
        <div className="space-y-3">
          {recipe.content.ingredients.map((group, idx) => (
            <div key={idx} className="flex flex-wrap gap-2">
              {group.items.map((item, itemIdx) => (
                <Badge
                  key={itemIdx}
                  variant="secondary"
                  className="bg-secondary text-secondary-foreground px-3 py-1"
                >
                  <span className="text-xs font-semibold mr-2">{group.category}</span>
                  {item}
                </Badge>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Shopping List */}
      {recipe.content.shopping_list && recipe.content.shopping_list.length > 0 && (
        <div className="mb-8 bg-background p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-foreground" />
            <h4 className="font-semibold text-foreground">You'll need to buy</h4>
          </div>
          <p className="text-muted-foreground text-sm">
            {recipe.content.shopping_list.join(', ')}
          </p>
        </div>
      )}

      {/* Equipment */}
      {recipe.content.equipment && recipe.content.equipment.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">Equipment</h3>
          <div className="flex flex-wrap gap-2">
            {recipe.content.equipment.map((item, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="border-border text-foreground px-3 py-1"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-4">Instructions</h3>
        <div className="space-y-6">
          {recipe.content.steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-foreground mb-1">{step.instruction}</p>
                <p className="text-muted-foreground text-sm italic mb-1">
                  {step.context}
                </p>
                <p className="text-xs text-muted-foreground">~{step.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Variations & Substitutions */}
      {recipe.content.variations && recipe.content.variations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">
            Variations & Substitutions
          </h3>
          <ul className="space-y-2">
            {recipe.content.variations.map((variation, idx) => (
              <li key={idx} className="text-muted-foreground text-sm flex gap-2">
                <span className="text-primary">•</span>
                <span>{variation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {recipe.content.notes && recipe.content.notes.length > 0 && (
        <div className="mb-6 border-l-4 border-primary bg-background p-4 rounded">
          <h4 className="font-semibold text-foreground mb-2">Notes</h4>
          <div className="space-y-2">
            {recipe.content.notes.map((note, idx) => (
              <p key={idx} className="text-muted-foreground text-sm">{note}</p>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition */}
      {recipe.nutrition && (
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold">Nutrition (per serving):</span> {recipe.nutrition}
        </div>
      )}
    </div>
  );
};
