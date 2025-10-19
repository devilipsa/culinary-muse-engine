import { useState } from "react";
import { ChefHat } from "lucide-react";
import { RecipeForm } from "@/components/RecipeForm";
import { RecipeDisplay } from "@/components/RecipeDisplay";
import { mockRecipes } from "@/data/mockRecipes";

const Index = () => {
  const [currentRecipe, setCurrentRecipe] = useState(mockRecipes[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRecipeSearch = (ingredients: string, preferences: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // For demo, alternate between recipes or pick based on ingredients
      const recipeIndex = ingredients.toLowerCase().includes("tofu") ? 1 : 0;
      setCurrentRecipe(mockRecipes[recipeIndex]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <ChefHat className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Recipe Finder!</h1>
          </div>
          <p className="text-center text-muted-foreground mt-2">
            Tell us what ingredients you have, and we'll suggest delicious recipes!
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Form */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <RecipeForm onSubmit={handleRecipeSearch} isLoading={isLoading} />
          </div>

          {/* Right Column - Recipe Display */}
          <div>
            {isLoading ? (
              <div className="bg-card rounded-xl p-8 border border-border flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Finding the perfect recipe...</p>
                </div>
              </div>
            ) : (
              <RecipeDisplay recipe={currentRecipe} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 Recipe Finder. Discover delicious recipes with ingredients you have!</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
