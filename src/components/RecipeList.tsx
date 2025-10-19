import { Recipe } from '@/types/recipe';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';

interface RecipeListProps {
  recipes: Recipe[];
  selectedIndex: number;
  onSelectRecipe: (index: number) => void;
}

export const RecipeList = ({ recipes, selectedIndex, onSelectRecipe }: RecipeListProps) => {
  const getPopularityLabel = (score: number) => {
    if (score >= 80) return { label: 'Popular', color: 'bg-primary text-primary-foreground' };
    if (score >= 60) return { label: 'Common', color: 'bg-secondary text-secondary-foreground' };
    return { label: 'Niche', color: 'bg-muted text-muted-foreground' };
  };

  return (
    <div className="space-y-3">
      {recipes.map((recipe, index) => {
        const popularity = getPopularityLabel(recipe.popularity_score);
        const isSelected = index === selectedIndex;

        return (
          <button
            key={recipe.id}
            onClick={() => onSelectRecipe(index)}
            className={`
              w-full text-left p-4 rounded-lg border transition-all
              ${isSelected 
                ? 'bg-primary/10 border-primary' 
                : 'bg-card border-border hover:border-primary/50 hover:bg-card/80'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
              `}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                  {recipe.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {recipe.summary}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`${popularity.color} text-xs`}>
                    <Flame className="w-3 h-3 mr-1" />
                    {popularity.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Score: {recipe.popularity_score}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
