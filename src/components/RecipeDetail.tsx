import { Recipe } from "@/types/recipe";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, Users, Flame, ChefHat, ShoppingCart, Lightbulb, UtensilsCrossed, AlertCircle, Share2 } from "lucide-react";

interface RecipeDetailProps {
  recipe: Recipe;
  onShare?: () => void;
  showShareButton?: boolean;
}

export function RecipeDetail({ recipe, onShare, showShareButton = true }: RecipeDetailProps) {
  return (
    <div className="bg-card rounded-xl p-8 border border-border">
      {/* Header with metadata */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold text-foreground">
            {recipe.title}
          </h2>
          
          <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{recipe.timing.total_min} min total ({recipe.timing.prep_min} prep + {recipe.timing.cook_min} cook)</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span>{recipe.nutrition_estimate.kcal_per_serving} per serving</span>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
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

      {/* Dish Visualization */}
      {recipe.dish_visualization.status === "ok" && recipe.dish_visualization.url && (
        <div className="mb-8">
          <img
            src={recipe.dish_visualization.url}
            alt={recipe.dish_visualization.alt}
            className="w-full h-64 object-cover rounded-lg"
          />
          <p className="text-xs text-muted-foreground mt-1 italic">
            Source: {recipe.dish_visualization.source}
          </p>
        </div>
      )}

      {/* Selected Ingredients */}
      {recipe.selected_ingredients.length > 0 && (
        <div className="mb-8 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            Ingredients
          </h3>
          
          {/* Group by role */}
          {["primary", "supporting", "fat", "aromatic", "acid", "seasoning"].map(role => {
            const roleIngredients = recipe.selected_ingredients.filter(ing => ing.role === role);
            if (roleIngredients.length === 0) return null;
            
            return (
              <div key={role} className="space-y-2">
                <h4 className="font-medium text-sm uppercase text-muted-foreground tracking-wider">
                  {role}
                </h4>
                <ul className="space-y-1.5 ml-2">
                  {roleIngredients.map((ing, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{ing.qty} {ing.unit} {ing.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Leftover Ingredients */}
      {recipe.leftover_ingredients.length > 0 && (
        <div className="mb-8 space-y-3 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            Not Used in This Recipe
          </h3>
          <div className="flex flex-wrap gap-2">
            {recipe.leftover_ingredients.map((item, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Shopping List (Extras to Buy) */}
      {recipe.extras_to_buy.length > 0 && (
        <div className="mb-8 space-y-3 p-4 bg-accent/50 rounded-lg">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Extras to Buy
          </h3>
          <p className="text-sm text-muted-foreground">Additional items needed beyond provided ingredients:</p>
          <ul className="space-y-1.5 ml-2">
            {recipe.extras_to_buy.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1">□</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Equipment */}
      {recipe.equipment.length > 0 && (
        <div className="mb-8 space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            Equipment Needed
          </h3>
          <div className="flex flex-wrap gap-2">
            {recipe.equipment.map((item, idx) => (
              <Badge key={idx} variant="secondary" className="text-sm">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-8 space-y-4">
        <h3 className="text-xl font-semibold">Instructions</h3>
        <ol className="space-y-6">
          {recipe.steps.map((step) => (
            <li key={step.n} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                {step.n}
              </div>
              <div className="flex-1 space-y-2 pt-0.5">
                <p className="text-base leading-relaxed">{step.do}</p>
                {step.why && (
                  <p className="text-sm text-muted-foreground italic">
                    💡 {step.why}
                  </p>
                )}
                <p className="text-xs text-muted-foreground font-medium">
                  ⏱️ {step.time}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Variations & Substitutions */}
      {recipe.subs_and_variations.length > 0 && (
        <div className="mb-8 space-y-3 p-4 bg-accent/30 rounded-lg">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Variations & Substitutions
          </h3>
          <ul className="space-y-2">
            {recipe.subs_and_variations.map((variation, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">↔</span>
                <span>{variation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {recipe.notes.length > 0 && (
        <div className="mb-8 space-y-3 p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 rounded-r-lg">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">📝 Chef's Notes</h3>
          <ul className="space-y-2">
            {recipe.notes.map((note, idx) => (
              <li key={idx} className="text-sm leading-relaxed text-orange-800 dark:text-orange-200">
                • {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nutrition */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Nutrition Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Calories:</span>
            <span className="ml-2 font-medium">{recipe.nutrition_estimate.kcal_per_serving}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Protein:</span>
            <span className="ml-2 font-medium">{recipe.nutrition_estimate.protein_g}g</span>
          </div>
          <div>
            <span className="text-muted-foreground">Carbs:</span>
            <span className="ml-2 font-medium">{recipe.nutrition_estimate.carbs_g}g</span>
          </div>
          <div>
            <span className="text-muted-foreground">Fat:</span>
            <span className="ml-2 font-medium">{recipe.nutrition_estimate.fat_g}g</span>
          </div>
        </div>
      </div>
    </div>
  );
}
