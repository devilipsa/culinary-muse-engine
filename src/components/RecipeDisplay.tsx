import { Clock, Users, Flame, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Recipe {
  title: string;
  description: string;
  time: string;
  servings: number;
  calories: string;
  image: string;
  ingredients: {
    category: string;
    items: string[];
  }[];
  shoppingList: string[];
  equipment: string[];
  instructions: {
    step: number;
    title: string;
    description: string;
    time: string;
  }[];
  variations: string[];
  notes: string[];
  nutrition: string;
}

interface RecipeDisplayProps {
  recipe: Recipe;
}

export const RecipeDisplay = ({ recipe }: RecipeDisplayProps) => {
  return (
    <div className="bg-card rounded-xl p-8 border border-border">
      <h2 className="text-3xl font-bold text-foreground mb-3">
        {recipe.title}
      </h2>
      <p className="text-muted-foreground mb-6 leading-relaxed">
        {recipe.description}
      </p>

      <div className="flex gap-6 mb-6 text-sm">
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

      <img
        src={recipe.image}
        alt={recipe.title}
        className="w-full h-64 object-cover rounded-lg mb-8"
      />

      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-4">
          Selected Ingredients
        </h3>
        <div className="space-y-3">
          {recipe.ingredients.map((group, idx) => (
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

      {recipe.shoppingList.length > 0 && (
        <div className="mb-8 bg-background p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-foreground" />
            <h4 className="font-semibold text-foreground">You'll need to buy</h4>
          </div>
          <p className="text-muted-foreground text-sm">
            {recipe.shoppingList.join(", ")}
          </p>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-4">Equipment</h3>
        <div className="flex flex-wrap gap-2">
          {recipe.equipment.map((item, idx) => (
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

      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-4">Instructions</h3>
        <div className="space-y-6">
          {recipe.instructions.map((instruction) => (
            <div key={instruction.step} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {instruction.step}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  {instruction.title}
                </h4>
                <p className="text-muted-foreground text-sm italic mb-1">
                  {instruction.description}
                </p>
                <p className="text-xs text-muted-foreground">~{instruction.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-4">
          Variations & Substitutions
        </h3>
        <ul className="space-y-2">
          {recipe.variations.map((variation, idx) => (
            <li key={idx} className="text-muted-foreground text-sm flex gap-2">
              <span className="text-primary">•</span>
              <span>{variation}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6 border-l-4 border-primary bg-background p-4 rounded">
        <h4 className="font-semibold text-foreground mb-2">Notes</h4>
        <div className="space-y-2">
          {recipe.notes.map((note, idx) => (
            <p key={idx} className="text-muted-foreground text-sm">
              {note}
            </p>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <span className="font-semibold">Nutrition (per serving):</span> {recipe.nutrition}
      </div>
    </div>
  );
};
